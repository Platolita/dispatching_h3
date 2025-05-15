const { Pool } = require('pg');
const h3 = require('h3-js');
const fs = require('fs');

const dbConfig = require('../conf/pgdb').postgres;

process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
    process.exit(1);
});

// 在代码开头添加测试坐标
const testCoord = [116.4074, 39.9042]; // 天安门坐标 [经度, 纬度]
console.log('测试H3索引:', h3.latLngToCell(testCoord[1], testCoord[0], 10));
// 应输出：8a194ab7027ffff

async function importData() {
    // 1. 读取GeoJSON
    const roads = JSON.parse(fs.readFileSync('D:/Code/zhen-da-chuang/track-manager/server/data/六区四环内.geojson'));
    
    // 2. 建立PG连接池
    const pool = new Pool({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        connectionTimeoutMillis: 10000,  // 增加超时时间
        idleTimeoutMillis: 30000,
        max: 20,
        ssl: {
            rejectUnauthorized: false,
            require: true  // 强制SSL
        }
    });
    
    // 修改后的数据库连接测试
    try {
        const client = await pool.connect();
        console.log('✅ 数据库连接成功 | 主机:', 
            client.connectionParameters?.host ?? '未知',  // 直接访问connectionParameters
            '端口:', 
            client.connectionParameters?.port ?? '未知',
            '数据库:', 
            client.connectionParameters?.database ?? '未知');
    } catch (err) {
        console.error('❌ 数据库连接失败:', err.message);
        console.error('连接配置:', {  // 打印实际使用的连接配置
            host: dbConfig.host,
            port: dbConfig.port,
            database: dbConfig.database,
            user: dbConfig.user
        });
        process.exit(1);
    }
    // 3. 预处理道路类型
    const typeCache = new Map();
    const { rows: types } = await pool.query('SELECT id, type FROM highway_types');
    types.forEach(t => typeCache.set(t.type, t.id));
    
    // 4. 预处理GeoJSON数据
    roads.features = roads.features.filter(f => {
        const coords = f.geometry?.coordinates;
        return coords && coords.length > 0 && 
               coords.every(c => 
                   Array.isArray(c) && c.length >= 2 &&  // 确保是二维坐标
                   typeof c[0] === 'number' && 
                   typeof c[1] === 'number'
               );
    });

    // 在读取GeoJSON后添加数据清洗
    roads.features = roads.features.filter(f => {
        // 确保坐标是有效的二维数组
        return f.geometry?.coordinates?.every(coord => 
            Array.isArray(coord) && 
            coord.length >= 2 &&
            typeof coord[0] === 'number' &&
            typeof coord[1] === 'number'
        );
    });

    console.log(`过滤后有效道路数: ${roads.features.length}`);
    
    // 5. 批量导入（调整H3计算和字段映射）
    const batchSize = 100;
    for (let i = 0; i < roads.features.length; i += batchSize) {
        const client = await pool.connect();
        try {
            const batch = roads.features.slice(i, i + batchSize);
            
            // 预先生成所有h3_res10值
            const h3Codes = batch.map(feature => {
                const center = feature.geometry.coordinates[Math.floor(feature.geometry.coordinates.length / 2)];
                return h3.latLngToCell(center[1], center[0], 10);
            });
            
            // 去重并创建分区
            const uniqueCodes = [...new Set(h3Codes)];
            await client.query('BEGIN');
            for (const code of uniqueCodes) {
                await client.query(
                    'SELECT create_road_partition($1)',
                    [code]
                );
            }
            await client.query('COMMIT');
            
            const values = [];
            const params = await Promise.all(batch.map(async feature => {
                const wkt = `LINESTRING(${feature.geometry.coordinates
                    .map(coord => {
                        // 确保坐标是二维数组且包含有效数值
                        if (!Array.isArray(coord) || coord.length < 2 || isNaN(coord[0]) || isNaN(coord[1])) {
                            console.error('无效坐标:', coord);
                            throw new Error(`无效坐标值: ${JSON.stringify(coord)}`);
                        }
                        return `${coord[0].toFixed(7)} ${coord[1].toFixed(7)}`;
                    }).join(',')})`;
                
                // 计算两个分辨率的H3索引（匹配数据库字段）
                const center = feature.geometry.coordinates[Math.floor(feature.geometry.coordinates.length / 2)];
                const h3_res10 = h3.latLngToCell(center[1], center[0], 10); // 新API
                const h3_res11 = h3.latLngToCell(center[1], center[0], 11); // 新API
                
                // 获取道路类型ID
                const highwayType = feature.properties?.highway || 'unclassified';
                const typeId = typeCache.get(highwayType) || await getOrCreateType(highwayType);
                
                const isValid = await client.query(
                    'SELECT ST_IsValid(ST_GeomFromEWKT($1))',
                    [wkt]
                );
                if (!isValid.rows[0].st_isvalid) {
                    console.log('无效几何数据:', wkt);
                    return null;
                }
                
                // 确保使用正确的坐标顺序
                const coord = await client.query(
                    'SELECT ST_X(geom) as lng, ST_Y(geom) as lat FROM ST_DumpPoints(ST_GeomFromEWKT($1))',
                    [wkt]
                );

                // 坐标转换的正确方法
                const h3Index = h3.latLngToCell(
                    coord.rows[0].lat, // 纬度在前
                    coord.rows[0].lng, // 经度在后
                    11                 // 分辨率级别
                );
                
                // 新增名称提取
                const roadName = feature.properties.name || '未命名道路';
                
                // 修改后的插入语句
                const res = await client.query(
                    `INSERT INTO roads (geometry, highway_type, oneway, lanes, surface, maxspeed, cycleway, properties, h3_res10, h3_res11)
                     VALUES (ST_GeomFromEWKT($1), $2, $3, $4, $5, $6, $7, $8, $9, $10)
                     RETURNING id`,
                    [wkt, typeId, Boolean(feature.properties.oneway), Number(feature.properties.lanes || 1), String(feature.properties.surface || 'asphalt'), Number(feature.properties.maxspeed || 40), feature.properties.cycleway ? String(feature.properties.cycleway) : null, JSON.stringify(feature.properties), h3_res10, h3_res11]
                );
                
                // 同步插入road_names
                await client.query(
                    'INSERT INTO road_names (road_id, h3_res10, lang, name) VALUES ($1, $2, $3, $4)',
                    [res.rows[0].id, h3_res10, 'zh', roadName]
                );
                
                return [
                    wkt,
                    Number(typeId),
                    Boolean(feature.properties.oneway),
                    Number(feature.properties.lanes || 1),
                    String(feature.properties.surface || 'asphalt'),
                    Number(feature.properties.maxspeed || 40),
                    feature.properties.cycleway ? String(feature.properties.cycleway) : null,
                    JSON.stringify(feature.properties),
                    h3_res10,
                    h3_res11
                ];
            }));
            
            // 修改参数结构（关键修复）
            const paramArrays = params.filter(p => p !== null).reduce((acc, row) => {
                row.forEach((val, i) => acc[i].push(val));
                return acc;
            }, Array.from({length: 10}, () => []));

            await client.query('BEGIN');
            try {
                await pool.query(`
                    INSERT INTO roads 
                        (geometry, highway_type, oneway, lanes, surface, maxspeed, 
                         cycleway, properties, h3_res10, h3_res11)
                    SELECT 
                        ST_GeomFromText(unnest($1::text[]), 4326),
                        unnest($2::int[]),
                        unnest($3::boolean[]),
                        unnest($4::int[]),
                        unnest($5::varchar[]),
                        unnest($6::int[]),
                        unnest($7::varchar[]),
                        unnest($8::jsonb[]),
                        unnest($9::h3index[]),
                        unnest($10::h3index[])
                `, paramArrays); // 传递展开的数组参数
                await client.query('COMMIT');
            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`批量插入失败（第${i}条开始）:`);
                console.error('错误详情:', err.message);
                
                // 获取第一个失败的特征数据
                const failedFeature = batch[0]; // 取批次第一个作为示例
                console.error('问题特征数据:', {
                    coordinates: failedFeature.geometry.coordinates.slice(0, 3), // 显示前三个坐标点
                    properties: failedFeature.properties,
                    h3_res10: paramArrays[8], // 直接取参数中的值
                    h3_res11: paramArrays[9],
                    h3_index: paramArrays[10]
                });
                
                throw err; // 重新抛出错误
            } finally {
                client.release(); // 释放连接
            }
        } catch (err) {
            console.error('批量插入失败:', err.message);
            throw err;
        }
    }
    
    async function getOrCreateType(typeName) {
        const { rows } = await pool.query(
            'INSERT INTO highway_types (type) VALUES ($1) ON CONFLICT (type) DO UPDATE SET type=EXCLUDED.type RETURNING id',
            [typeName]
        );
        typeCache.set(typeName, rows[0].id);
        return rows[0].id;
    }
    console.log('导入完成');
    await pool.end();
    process.exit(0); // 确保退出
}

importData().catch(err => {
    console.error('导入失败:', err);
    process.exit(1);
}).finally(() => {
    console.log('进程即将退出');
    pool.end().then(() => process.exit(0)); // 强制退出
});

// 在pool配置后添加
//pool.on('connect', () => console.log('新连接建立'));
//pool.on('remove', () => console.log('连接关闭'));
const { Pool } = require('pg');
const dbConfig = require('./conf/pgdb').postgres;

async function testConnection() {
    // 修正后的连接池配置
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

    // 增加连接池事件监听
    pool.on('error', (err) => {
        console.error('连接池异常:', err);
    });

    try {
        // 2. 测试连接是否建立
        const client = await pool.connect();
        console.log('✅ 成功连接到PostgreSQL服务器');

        // 3. 检查数据库是否存在
        const dbRes = await client.query('SELECT current_database() AS dbname');
        console.log(`📊 当前数据库: ${dbRes.rows[0].dbname}`);

        // 4. 检查PostGIS和H3扩展状态
        const extRes = await client.query(`
            SELECT extname, extversion 
            FROM pg_extension 
            WHERE extname IN ('postgis', 'h3')
        `);
        console.log('🔌 已安装扩展:');
        extRes.rows.forEach(row => {
            console.log(`   ${row.extname} (v${row.extversion})`);
        });

        // 5. 测试基本查询
        const testRes = await client.query('SELECT COUNT(*) FROM roads');
        console.log(`🗺️ 道路数据量: ${testRes.rows[0].count} 条`);

    } catch (err) {
        console.error('❌ 连接失败:', err.message);
        if (err.code === '28P01') {
            console.log('⚠️ 可能原因: 用户名/密码错误');
        } else if (err.code === 'ECONNREFUSED') {
            console.log('⚠️ 可能原因: 服务器未运行或端口错误');
        } else if (err.code === '3D000') {
            console.log('⚠️ 可能原因: 数据库不存在');
        }
    } finally {
        await pool.end();
        console.log('🔌 连接已关闭');
    }
}

testConnection(); 
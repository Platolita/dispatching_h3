const fs = require('fs');
const path = require('path');
const fastcsv = require('fast-csv');
const h3 = require('h3-js');
const mysql = require('mysql');

// 数据库配置
const dbConfig = require('../conf/db').mysql;
const pool = mysql.createPool(dbConfig);

// CSV文件路径
const csvFilePath = path.join(__dirname, 'data/2016.08.06/distribute_2016.08.06_110100_.csv');

// 生成唯一姓名和电话
function generateUniqueName(index) {
    return `Driver_${index}`;
}

function generateUniquePhone(index) {
    return `1380001${String(index).padStart(4, '0')}`;
}

// 处理一行数据，计算h3编码
function processRow(row, index) {
    const lat = parseFloat(row.latitude);
    const lng = parseFloat(row.longitude);

    if (isNaN(lat) || isNaN(lng)) {
        console.error(`无效的经纬度：${row.latitude}, ${row.longitude}`);
        return null; // 跳过无效行
    }

    // 计算h3编码
    row.h3_8 = h3.latLngToCell(lat, lng, 8);
    row.h3_9 = h3.latLngToCell(lat, lng, 9);
    row.h3_10 = h3.latLngToCell(lat, lng, 10);
    row.h3_11 = h3.latLngToCell(lat, lng, 11);
    row.h3_12 = h3.latLngToCell(lat, lng, 12);

    return row;
}

// 获取当前最大driverID
function getMaxdriverID(callback) {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query('SELECT MAX(driverID) AS maxId FROM driver', (err, result) => {
            connection.release();
            if (err) throw err;
            const maxId = result[0].maxId || 4; // 如果表为空，从4开始
            callback(maxId);
        });
    });
}

// 将hour转换为时间戳
function getTimestamp(hour) {
    const date = new Date('2016-08-06'); // 固定日期
    date.setHours(hour, 0, 0, 0); // 设置小时
    return date.toISOString().slice(0, 19).replace('T', ' '); // 格式化为MySQL时间戳
}

// 批量插入到数据库
function insertToDatabase(rows, startId, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('【数据库连接获取失败】:', err);
            if (err.code) {
                console.error('MySQL错误代码:', err.code, ', errno:', err.errno);
            }
            if (callback) callback(err);
            return;
        }
        const driverValues = [];
        let driverIndex = 0;
        let totalGenerated = 0;
        rows.forEach((row) => {
            const timestamp = getTimestamp(row.hour);
            for (let i = 0; i < row.value; i++) {
                driverValues.push([
                    startId + driverValues.length + 1,
                    generateUniqueName(driverIndex),
                    generateUniquePhone(driverIndex),
                    row.longitude,
                    row.latitude,
                    row.latitude,
                    row.longitude,
                    'available',
                    timestamp,
                    row.h3_8,
                    row.h3_9,
                    row.h3_10,
                    row.h3_11,
                    row.h3_12
                ]);
                driverIndex++;
            }
        });
        totalGenerated = driverValues.length;
        console.log(`实际生成待插入的driver记录数：${totalGenerated}`);

        const driverSql = `
            INSERT INTO driver 
            (driverID, name, phone, Longtitude, Latitude, current_lat, current_long, status, last_update, h3_8, h3_9, h3_10, h3_11, h3_12) 
            VALUES ?
        `;

        const batchSize = 1000;
        let current = 0;
        let batchNum = 0;
        function insertNextBatch() {
            if (current >= driverValues.length) {
                console.log(`所有批次已插入完成。`);
                connection.release();
                callback();
                return;
            }
            const batch = driverValues.slice(current, current + batchSize);
            batchNum++;
            console.log(`即将插入第${batchNum}批, record ${current + 1} - ${current + batch.length} ...`);
            connection.query(driverSql, [batch], (err, result) => {
                if (err) {
                    console.error('插入driver表出错:', err);
                    if (err.code) {
                        console.error('MySQL错误代码:', err.code, ', errno:', err.errno);
                    }
                    console.error('出错批内容首行:', JSON.stringify(batch[0]));
                    connection.release();
                    callback(err); // 让主流程拿到异常信息
                    return;
                }
                console.log(`第${batchNum}批插入成功，插入行数: ${result.affectedRows}`);
                current += batchSize;
                setImmediate(insertNextBatch); // 避免阻塞
            });
        }
        insertNextBatch();
    });
}

// 主流程
// 新增部分: 读取demand，自动补齐表头和需要生成默认值的字段
const demandFilePath = path.join(__dirname, 'data/2016.08.06/demand_2016.08.06_110100_.csv');
let demandHeaders = [];

function readDemandHeaders(callback) {
    fs.createReadStream(demandFilePath)
        .pipe(fastcsv.parse({ headers: false }))
        .on('data', (row) => {
            if (demandHeaders.length === 0) {
                demandHeaders = row;
                callback(demandHeaders);
            }
        });
}

// 覆写distribute文件，补齐字段
function rewriteDistributeWithAllFields(rows, demandHeaders, callback) {
    const distributeHeaders = Object.keys(rows[0]);
    // 找出 demand 比 distribute 多出的字段
    const extraHeaders = demandHeaders.filter(
        h => !distributeHeaders.includes(h) && h !== ''
    );
    // 补齐所有 header
    const outputHeaders = distributeHeaders.concat(extraHeaders);

    // 针对每一行补齐 extra 字段
    const patchedRows = rows.map((row, idx) => {
        const newRow = { ...row };
        extraHeaders.forEach(h => {
            if (h.startsWith('h3_')) {
                // 继续用 h3-js 生成
                const lat = parseFloat(row.latitude);
                const lng = parseFloat(row.longitude);
                if (!isNaN(lat) && !isNaN(lng)) {
                    const resolution = parseInt(h.split('_')[1], 10);
                    newRow[h] = h3.latLngToCell(lat, lng, resolution);
                } else {
                    newRow[h] = '';
                }
            } else if (h === 'drivername' || h === 'name') {
                newRow[h] = generateUniqueName(idx);
            } else if (h === 'phone') {
                newRow[h] = generateUniquePhone(idx);
            } else {
                newRow[h] = '';
            }
        });
        return newRow;
    });

    const ws = fs.createWriteStream(csvFilePath); // 覆写原 distribute 文件
    fastcsv.write(patchedRows, { headers: outputHeaders }).pipe(ws).on('finish', callback);
}

// 在主流程加上：先补全distribute再入库
function main() {
    const rows = [];
    const readStream = fs.createReadStream(csvFilePath);

    let totalRaw = 0;
    let totalSkipped = 0;
    const csvStream = fastcsv
        .parse({ headers: true })
        .transform((row, callback) => {
            const processedRow = processRow(row, rows.length);
            callback(null, processedRow);
        })
        .on('data', row => {
            totalRaw++;
            if (row) {
                if (isNaN(Number(row.longitude)) || isNaN(Number(row.latitude)) || isNaN(Number(row.hour))) {
                    console.error('解析到不合法的数据，跳过:', row);
                    totalSkipped++;
                    return;
                }
                rows.push(row);
            } else {
                totalSkipped++;
            }
        })
        .on('end', () => {
            console.log(`CSV读取完毕。总行数:${totalRaw}, 合法数据行:${rows.length}, 跳过行数:${totalSkipped}`);
            getMaxdriverID((maxId) => {
                console.log('数据库当前最大driverID:', maxId);
                insertToDatabase(rows, maxId, () => {
                    console.log('数据库插入操作全部处理完成！');
                    process.exit(0);
                });
            });
        })
        .on('error', (err) => {
            console.error('CSV文件读取错误:', err);
            process.exit(1);
        });

    readStream.pipe(csvStream);
}

main();
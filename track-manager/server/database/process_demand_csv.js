const fs = require('fs');
const path = require('path');
const fastcsv = require('fast-csv');
const h3 = require('h3-js');
const mysql = require('mysql');

// 数据库配置
const dbConfig = require('../conf/db').mysql;
const pool = mysql.createPool(dbConfig);

// CSV文件路径
const csvFilePath = path.join(__dirname, 'data/2016.08.06/demand_2016.08.06_110100_.csv');

// 生成唯一姓名和电话
function generateUniqueName(index) {
    return `Passenger_${index}`;
}

function generateUniquePhone(index) {
    return `1380000${String(index).padStart(4, '0')}`;
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

// 获取当前最大passengerid
function getMaxPassengerId(callback) {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query('SELECT MAX(passengerid) AS maxId FROM passenger', (err, result) => {
            connection.release();
            if (err) throw err;
            const maxId = result[0].maxId || 1003; // 如果表为空，从1003开始
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
        if (err) throw err;

        // 生成乘客记录
        const passengerValues = [];
        let passengerIndex = 0; // 用于生成唯一姓名和电话
        rows.forEach((row) => {
            const timestamp = getTimestamp(row.hour);
            for (let i = 0; i < row.value; i++) { // 根据value生成多个乘客
                passengerValues.push([
                    startId + passengerValues.length + 1, // passengerid（从当前最大值+1开始）
                    generateUniqueName(passengerIndex), // 唯一姓名
                    generateUniquePhone(passengerIndex), // 唯一电话
                    row.longitude, // Longtitude
                    row.latitude, // Latitude
                    row.latitude, // current_lat
                    row.longitude, // current_long
                    'available', // status
                    timestamp, // last_update
                    row.h3_8,
                    row.h3_9,
                    row.h3_10,
                    row.h3_11,
                    row.h3_12
                ]);
                passengerIndex++;
            }
        });

        const passengerSql = `
            INSERT INTO passenger 
            (passengerid, passengername, phone, Longtitude, Latitude, current_lat, current_long, status, last_update, h3_8, h3_9, h3_10, h3_11, h3_12) 
            VALUES ?
        `;

        connection.query(passengerSql, [passengerValues], (err) => {
            if (err) console.log('插入passenger表出错:', err);
            connection.release();
            callback();
        });
    });
}

// 主流程
function main() {
    const rows = [];
    const readStream = fs.createReadStream(csvFilePath);
    const csvStream = fastcsv
        .parse({ headers: true })
        .transform((row, callback) => {
            const processedRow = processRow(row, rows.length);
            callback(null, processedRow);
        })
        .on('data', row => {
            if (row) rows.push(row); // 只处理有效行
        })
        .on('end', () => {
            // 获取当前最大passengerid
            getMaxPassengerId((maxId) => {
                // 插入数据库
                insertToDatabase(rows, maxId, () => {
                    console.log('全部处理完成！');
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
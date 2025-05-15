const mysql = require('mysql2');
const dbConfig = require('./conf/db.js').mysql;

// 创建数据库连接池
const pool = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 测试数据库连接
pool.getConnection((err, connection) => {
    if (err) {
        console.error('连接数据库失败:', err.message);
        process.exit(1); // 退出程序
    }

    console.log('数据库连接成功！');

    // 检查数据库是否存在
    connection.query('SELECT DATABASE() AS dbName;', (err, results) => {
        if (err) {
            console.error('查询当前数据库失败:', err.message);
            connection.release();
            process.exit(1);
        }

        const currentDb = results[0].dbName;
        if (currentDb === 'pro1') {
            console.log('成功连接到数据库 pro1！');
        } else {
            console.warn(`当前连接的数据库是 ${currentDb}，不是预期的 pro1。`);
        }

        connection.release();
        pool.end((err) => {
            if (err) {
                console.error('关闭连接池时出错:', err.message);
            } else {
                console.log('连接池已关闭。');
            }
        });
    });
}); 
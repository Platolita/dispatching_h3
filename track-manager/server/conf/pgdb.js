module.exports = {
    postgres: {
        host: 'localhost',
        port: 5433,
        user: 'postgres',
        password: '193878',
        database: 'h3test',
        max: 20, // 连接池大小
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        ssl: { rejectUnauthorized: false }
    }
};
const { mysqlHost, mysqlPort, mysqlUser, mysqlPass, mysqlDatabase } = require('../../../config.json');
const mysql = require('mysql2');

module.exports = () => {
const pool = mysql.createPool({
    host: mysqlHost,
    port: mysqlPort,
    user: mysqlUser,
    password: mysqlPass,
    database: mysqlDatabase,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 20,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

return pool;
}
const logging = require('../../baseUtils/logging');
const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();

function testConnecion() {
    pool.execute(
        'SHOW TABLES',
        function (err, results) {
            if (err) {
                if (err.code === "ECONNREFUSED") {
                    logging.error(__filename, `Cannot connect to database | Error: ${err}`);
                } else {
                    logging.error(__filename, `There was an error querying the database | Error: ${err}`);
                }
            } else {
                return results;
            }
        }
    )
}

//make functions global
module.exports = { 
    testConnecion,
};
const path = require('path');
const getAllFiles = require('../../utils/baseUtils/getAllFiles');

const logging = require('../../utils/baseUtils/logging');

module.exports = async () => {
    logging.info(__filename, "Checking and registering missing database tables");

    //all table files are located in ./src/utils/database/tables
    const createTablesFiles = getAllFiles(
        path.join(__dirname, '..', '..', "utils", "database", "tables")
    );

    for (createTablesFile of createTablesFiles) {
        const executeFile = require(createTablesFile);
        await executeFile();
    };
}
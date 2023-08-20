const path = require('path');
const getAllFiles = require('../../utils/baseUtils/getAllFiles')

module.exports = async () => {
    console.log('STARTUP-database | Checking and registering missing database tables')
    //all table files are located in ./src/utils/database/tables
    const createTablesFiles = getAllFiles(
        path.join(__dirname, '..', '..', "utils", "database", "tables")
    )

    for (createTablesFile of createTablesFiles) {
        const executeFile = require(createTablesFile);
        await executeFile();
    }
}
const fs = require('fs');
const path = require('path');

const { fullLogging } = require('../../../config.json');


// info types: INFO, WARNING, ERROR, DEV


function logging(type, message, subtype, logfileOnly=false) {
    const now = new Date();
    const time = `${now.getUTCHours()}:${now.getUTCMinutes()}:${now.getUTCSeconds()}-${now.getUTCDay()}/${now.getUTCMonth()+1}/${now.getUTCFullYear()}`
    
    var logOut;
    if (type === "start") {
        logOut = (`\n\n==================================================\nStarting bot. Current time/date: ${time}\n==================================================`);
    } else {
        if (subtype) {
            logOut = `[${time} | ${type.toUpperCase()}/${subtype}] ${message}`;
            
        } else {
            logOut = `[${time} | ${type.toUpperCase()}] ${message}`;
        }
    }

    const daydate = `${now.getUTCDay()}-${now.getUTCMonth()+1}-${now.getUTCFullYear()}`

    //only log to console if it is NOT log file only
    if (!logfileOnly) {
        console.log(logOut);

        const logLocation = path.join(__dirname, '..', '..', '..', 'logs', `${daydate}.txt`)

        fs.appendFile(logLocation, `${logOut}\n`, (err) => {
            if (err) throw err;
        });
    } else {
        if (!fullLogging) return;

        const logLocation = path.join(__dirname, '..', '..', '..', 'logs', `logfileOnly_${daydate}.txt`)

        fs.appendFile(logLocation, `${logOut}\n`, (err) => {
            if (err) throw err;
        });
    }

    

    if (type === "error") {
        const logLocation = path.join(__dirname, '..', '..', '..', 'logs', `error_${daydate}.txt`)
        fs.appendFile(logLocation, `${logOut}\n`, (err) => {
            if (err) throw err;
        });
    };  
    if (type === "warning") {
        const logLocation = path.join(__dirname, '..', '..', '..', 'logs', `warning_${daydate}.txt`)
        fs.appendFile(logLocation, `${logOut}\n`, (err) => {
            if (err) throw err;
        });
    };
};

module.exports = { 
    logging,
}
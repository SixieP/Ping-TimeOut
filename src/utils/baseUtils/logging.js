const fs = require('fs');
const path = require('path');


// info types: INFO, WARNING, ERROR


function logging(type, message, subtype, logfile=false) {
    const now = new Date();
    const time = `${now.getUTCHours()}:${now.getUTCMinutes()}:${now.getUTCSeconds()}-${now.getUTCDay()}/${now.getUTCMonth()}/${now.getUTCFullYear()}`
    
    var logOut;
    if (type === "start") {
        logOut = (`\n\n==================================================\nStarting bot. Current time/date: ${time}\n==================================================`);
    } else {
        if (subtype) {
            logOut = `[${time} | ${type.toUpperCase()}/${subtype.toLowerCase()}] ${message}`;
            
        } else {
            logOut = `[${time} | ${type.toUpperCase()}] ${message}`;
        }
    }
    console.log(logOut);

    const daydate = `${now.getUTCDay()}-${now.getUTCMonth()}-${now.getUTCFullYear()}`
    
    const logLocation = path.join(__dirname, '..', '..', '..', 'logs', `${daydate}.txt`)
    fs.appendFile(logLocation, `${logOut}\n`, (err) => {
        if (err) throw err;
    })

    if (type === "error") {
        const logLocation = path.join(__dirname, '..', '..', '..', 'logs', `error_${daydate}.txt`)
        fs.appendFile(logLocation, `${logOut}\n`, (err) => {
        if (err) throw err;
    })
    }   
    if (type === "warning") {
        const logLocation = path.join(__dirname, '..', '..', '..', 'logs', `warning_${daydate}.txt`)
        fs.appendFile(logLocation, `${logOut}\n`, (err) => {
        if (err) throw err;
    })
    }
}

module.exports = { 
    logging,
}
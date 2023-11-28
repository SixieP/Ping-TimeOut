//VERSION 3.0

const fs = require('fs');
const path = require('path');

const { verbose } = require('../../../config.json');

const getAllFiles = require('./getAllFiles');

// info types: INFO, WARNING, ERROR, DEV
// log types: INFO, WARN, ERROR, VERBOSE INFO, VERBOSE WARN, GLOBAL INFO, GLOBAL WARN

//--default logging file structure--
//get the paths for all log folders
const logsDir = path.join(__dirname, '..', '..', '..', "logs");
const standardLogDir = path.join(__dirname, '..', '..', '..', "logs", "standard");
const infoLogDir = path.join(__dirname, '..', '..', '..', "logs", "info");
const warningLogDir = path.join(__dirname, '..', '..', '..', "logs", "warnings");
const errorLogDir = path.join(__dirname, '..', '..', '..', "logs", "errors");
const globalLogDir = path.join(__dirname, '..', '..', '..', "logs", "global");


//check if the log folders exist

if (!fs.existsSync(logsDir)) { //logsDir
    fs.mkdirSync(logsDir);
}
if (!fs.existsSync(standardLogDir)) { //standardLogDir
    fs.mkdirSync(standardLogDir);
}
if (!fs.existsSync(infoLogDir)) { //infoLogDir
    fs.mkdirSync(infoLogDir);
}
if (!fs.existsSync(warningLogDir)) { //warningLogDir
    fs.mkdirSync(warningLogDir);
}
if (!fs.existsSync(errorLogDir)) { //errorLogDir
    fs.mkdirSync(errorLogDir);
}
if (!fs.existsSync(globalLogDir)) { //globalLogDir
    fs.mkdirSync(globalLogDir);
}


// Get the datetime in the format that will be used in the log file name

const now = new Date();
const logfileDate = `${now.getUTCDate()}-${now.getUTCMonth()+1}-${now.getUTCFullYear()}` 

//get the filename of the standardLogFile
var counter = 0;
var loop = true
while (loop) {
    counter++;

    if(!fs.existsSync(`${standardLogDir}\\standard_${logfileDate}-${counter}.log`)) {
        loop = false;
    };

}
const standardLogFilename = `standard_${logfileDate}-${counter}.log`

//get the filename of the infoLogFile
var counter = 0;
var loop = true
while (loop) {
    counter++;

    if(!fs.existsSync(`${infoLogDir}\\info_${logfileDate}-${counter}.log`)) {
        loop = false;
    };

}
const infoLogFilename = `info_${logfileDate}-${counter}.log`

//get the filename of the warningLogFile
var counter = 0;
var loop = true
while (loop) {
    counter++;

    if(!fs.existsSync(`${warningLogDir}\\warning_${logfileDate}-${counter}.log`)) {
        loop = false;
    };

}
const warningLogFilename = `warning_${logfileDate}-${counter}.log`

//get the filename of the errorLogFile
var counter = 0;
var loop = true
while (loop) {
    counter++;

    if(!fs.existsSync(`${errorLogDir}\\error_${logfileDate}-${counter}.log`)) {
        loop = false;
    };

}
const errorLogFilename = `error_${logfileDate}-${counter}.log`

//get the filename of the globalLogFile
var counter = 0;
var loop = true
while (loop) {
    counter++;

    if(!fs.existsSync(`${globalLogDir}\\global_${logfileDate}-${counter}.log`)) {
        loop = false;
    };

}
const globalLogFilename = `global_${logfileDate}-${counter}.log`

//locations of the log files
const standardLogFile = path.join(__dirname, '..', '..', '..', "logs", "standard", standardLogFilename);
const infoLogFile = path.join(__dirname, '..', '..', '..', "logs", "info", infoLogFilename);
const warningLogFile = path.join(__dirname, '..', '..', '..', "logs", "warning", warningLogFilename);
const errorLogFile = path.join(__dirname, '..', '..', '..', "logs", "error", errorLogFilename);
const globalLogFile = path.join(__dirname, '..', '..', '..', "logs", "global", globalLogFilename);

//----logging logic----

    //--INFO--
    exports.info = (fileDir, message) => {
        const time = getTime();

        const logMessage = `[${time} INFO] ${message};`;

        standardLog(logMessage);
        infoLog(logMessage)

        const globalLogMessage = `[${time} INFO] (${fileDir}): ${message};`;
        globalLog(globalLogMessage);
    };

    //--WARNING--
    exports.warn = (fileDir, message) => {
        const time = getTime();

        const logMessage = `[${time} WARN] ${message};`;

        standardLog(logMessage);
        warningLog(logMessage)

        const globalLogMessage = `[${time} WARN] (${fileDir}): ${message};`;
        globalLog(globalLogMessage);
    };
    //--ERROR--
    exports.info = (fileDir, message) => {
        const time = getTime();

        const logMessage = `[${time} ERROR] (${fileDir}): ${message};`;

        standardLog(logMessage);
        errorLog(logMessage)
        globalLog(logMessage);
    };
    //--VERBOSE INFO--
    exports.verboseInfo = (fileDir, message) => {
        const time = getTime();

        const logMessage = `[${time} INFO] ${message};`;

        verboseInfoLog(logMessage)

        const globalLogMessage = `[${time} INFO] (${fileDir}): ${message};`;
        globalLog(globalLogMessage);
    };
    //--VERBOSE WARNING--
    exports.verboseWarn = (fileDir, message) => {
        const time = getTime();

        const logMessage = `[${time} WARN] ${message};`;

        verboseWarningLog(logMessage);

        const globalLogMessage = `[${time} WARN] (${fileDir}): ${message};`;
        globalLog(globalLogMessage);
    };
    //--GLOBAL INFO--
    exports.globalInfo = (fileDir, message) => {
        const time = getTime();

        const globalLogMessage = `[${time} INFO] (${fileDir}): ${message};`;
        globalLog(globalLogMessage);
    };
    //--GLOBAL WARNING--
    exports.warn = (fileDir, message) => {
        const time = getTime();

        const globalLogMessage = `[${time} WARN] (${fileDir}): ${message};`;
        globalLog(globalLogMessage);
    };

//functions that will be used inside this script

function getTime () { //get the current date/time in a nice format
    const now = new Date();
    const time = `${now.getUTCHours()}:${now.getUTCMinutes()}:${now.getUTCSeconds()}-${now.getUTCDate()}/${now.getUTCMonth()+1}/${now.getUTCFullYear()}`

    return time;
}

function standardLog (contents) {
    try {
        fs.appendFileSync(standardLogFile, `${contents}\n`);
    } catch (error) {
        console.error(error);
    };
};

function infoLog (contents) {
    console.log(contents);

    try {
        fs.appendFileSync(infoLogFile, `${contents}\n`);
    } catch (error) {
        console.error(error);
    };
};

function warningLog (contents) {
    console.log(`\x1b[202m${contents}\x1b[0m`);

    try {
        fs.appendFileSync(warningLogFile, `${contents}\n`);
    } catch (error) {
        console.error(error);
    };
};

function errorLog (contents) {
    console.log(`\x1b[31m${contents}\x1b[0m`);

    try {
        fs.appendFileSync(errorLogFile, `${contents}\n`);
    } catch (error) {
        console.error(error);
    };
};

function verboseInfoLog (contents) {
    if (verbose) {
        console.log(contents);

        try {
            standardLog(contents);
            infoLog(contents);
        } catch (error) {
            console.error(error);
        };
    };
};

function verboseWarningLog (contents) {
    if (verbose) {
        console.log(`\x1b[202m${contents}\x1b[0m`);

        try {
            standardLog(contents);
            warningLog(contents);
        } catch (error) {
            console.error(error);
        };
    };
};

function globalLog (contents) {
    console.log(contents);

    try {
        fs.appendFileSync(globalLogFile, `${contents}\n`);
    } catch (error) {
        console.error(error);
    };
};
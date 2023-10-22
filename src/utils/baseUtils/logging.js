const fs = require('fs');
const path = require('path');

const { fullLogging, verbose } = require('../../../config.json');

const getAllFiles = require('./getAllFiles');
const { count, error } = require('console');

// info types: INFO, WARNING, ERROR, DEV

//--default logging file structure--
//get the paths for all log folders
const logsDir = path.join(__dirname, '..', '..', '..', "logs");
const standardLogDir = path.join(__dirname, '..', '..', '..', "logs", "baselog");
const warningLogDir = path.join(__dirname, '..', '..', '..', "logs", "warning");
const errorLogDir = path.join(__dirname, '..', '..', '..', "logs", "error");
const verboseLogDir = path.join(__dirname, '..', '..', '..', "logs", "verbose");

//check if the log folders exist

if (!fs.existsSync(logsDir)) { //logsDir
    fs.mkdirSync(logsDir);
}
if (!fs.existsSync(standardLogDir)) { //standardLogDir
    fs.mkdirSync(standardLogDir);
}
if (!fs.existsSync(warningLogDir)) { //warningLogDir
    fs.mkdirSync(warningLogDir);
}
if (!fs.existsSync(errorLogDir)) { //errorLogDir
    fs.mkdirSync(errorLogDir);
}
if (!fs.existsSync(verboseLogDir)) { //verboseLogDir
    fs.mkdirSync(verboseLogDir);
}

const now = new Date();
const logfileDate = `${now.getUTCDate()}-${now.getUTCMonth()+1}-${now.getUTCFullYear()}` //default log name, date stucture
//get the standardlog file name
const standardLogFiles = getAllFiles(standardLogDir);

var counter = 0;
var loop = true
while (loop) {
    counter++;

    if(!fs.existsSync(`${standardLogDir}\\baselog_${logfileDate}-${counter}`)) {
        loop = false;
    };

}
const standardLogFileName = `baselog_${logfileDate}-${counter}`

//get the warning file name
const warningLogFiles = getAllFiles(errorLogDir);

var counter = 0;
var loop = true
while (loop) {
    counter++;

    if(!fs.existsSync(`${warningLogDir}\\baselog_${logfileDate}-${counter}`)) {
        loop = false;
    };

}
const warningLogFileName = `warning_${logfileDate}-${counter}`

//get the error file name
const errorLogFiles = getAllFiles(errorLogDir);

var counter = 0;
var loop = true
while (loop) {
    counter++;

    if(!fs.existsSync(`${errorLogDir}\\baselog_${logfileDate}-${counter}`)) {
        loop = false;
    };
    
}
const errorLogFileName = `error_${logfileDate}-${counter}`

//get the verbose file name
const verboseLogFiles = getAllFiles(errorLogDir);

var counter = 0;
var loop = true
while (loop) {
    counter++;

    if(!fs.existsSync(`${verboseLogDir}\\baselog_${logfileDate}-${counter}`)) {
        loop = false;
    };
    
}
const verboseLogFileName = `verbose_${logfileDate}-${counter}`

//log file locations
const standardLogFile = path.join(__dirname, '..', '..', '..', "logs", "baselog", standardLogFileName);
const warningLogFile = path.join(__dirname, '..', '..', '..', "logs", "warning", warningLogFileName);
const errorLogFile = path.join(__dirname, '..', '..', '..', "logs", "error", errorLogFileName);
const verboseLogFile = path.join(__dirname, '..', '..', '..', "logs", "verbose", verboseLogFileName);

//----logging logic----

    //--INFO--
    module.exports.infoDefault = (logMessage, description) => {
        const time = getTime();

        var message;
        if (!description) {
            message = `[${time} INFO]: ${logMessage}`;
        } else {
            message = `[${time} INFO] (${description}): ${logMessage}`;
        }

        standardLog(message);
    };

    module.exports.infoLongInteraction = (filename, description, interaction) => {
        const time = getTime();

        const message = `[${time} INFO] ${filename} (${description}):\nInteractionId: ${interaction.id}\nuserId: ${interaction.user.id}\nguildID: ${interaction.guildId}\ninteractionType: ${interaction.type}\n]`;

        standardLog(message);
    };

    module.exports.infoCustomInteraction = (filename, description, interaction, customInteractionData) => {
        const time = getTime();

        const message = `[${time} INFO] ${filename} (${description}):\ninteractionId: ${interaction.id}\n${customInteractionData}\n`

        standardLog(message);
    };

    //--WARNING--
    module.exports.warningDefault = (filename, warning, description) => {
        const time = getTime();

        var message;
        if (description) {
            message = `[${time} WARNING] ${filename} (${description}): ${warning}\n`
        } else {
            message = `[${time} WARNING] ${filename}: ${warning}\n`
        };

        warningLog(message);
    };

    //--ERROR--
    module.exports.errorDefault = (filename, errorMessage, description) => {
        const time = getTime();

        const message = `[${time} ERROR] ${filename} (${description}): ${errorMessage}\n`

        errorLog(message);
    };

    module.exports.errorInteraction = (filename, description, interaction, errorMessage) => {
        const time = getTime();

        const message = `[${time} ERROR] ${filename} (${description}):\ninteractionId: ${interaction.id}\nuserId: ${interaction.user.id}\nguildId: ${interaction.guildId}\n${errorMessage}\n`;

        errorLog(message);
    };

    module.exports.errorLongInteraction = (filename, description, interaction, errorMessage) => {
        const time = getTime();

        const message = `[${time} ERROR] ${filename} (${description}):\ninteractionId: ${interaction.id}\nuserId: ${interaction.user.id}\nguildId: ${interaction.guildId}\ntype: ${interaction.type}\ncreatedAt: ${interaction.createdAt}\n${errorMessage}`;

        errorLog(message);
    };

    module.exports.errorCustomInteraction = (filename, description, interaction, customInteractionInfo ,errorMessage) => {
        const time = getTime();

        const message = `[${time} ERROR] ${filename} (${description}):\ninteractionId: ${interaction.id}\nuserId: ${interaction.user.id}\nguildId: ${interaction.guildId}\ntype: ${interaction.type}\ncreatedAt: ${interaction.createdAt}\n${customInteractionInfo}\n${errorMessage}`;

        errorLog(message);
    };

    //DATABASE QUERY

    module.exports.errorQuery = (queryLocation, inputVars, errorMessage) => {
        const message = `[${getTime()} ERROR_database-${errorMessage.code}] (${queryLocation}):\n${inputVars}\n${errorMessage}`

        errorLog(message);
    };
    
    module.exports.errorQueryInteraction = (queryLocation, interaction, inputVars, errorMessage) => {
        const message = `[${getTime()} ERROR_database-${errorMessage.code}] (${queryLocation}): interactionId: ${interaction.id}\n${inputVars}\n${errorMessage}`

        errorLog(message);
    };

    //--VERBOSE--
    module.exports.verboseInfo = (infoMessage, description) => {
        
        var message;
        if (description) {
            message = `[${getTime()} INFO] (${description}): ${infoMessage}\n`
        } else {
            message = `[${getTime()} INFO]: ${infoMessage}\n`
        };

        verboseLog(message);
    };

    module.exports.verboseInteraction = (filename, description, interaction, verboseMessage) => {
        var message
        if (verboseMessage) {
            message = `[${getTime()} INFO] ${filename} (${description}):\ninteractionId: ${interaction.id}\nuserId: ${interaction.user.id}\nguildId: ${interaction.guildId}\n${verboseMessage}\n`;
        } else {
            message = `[${getTime()} INFO] ${filename} (${description}):\ninteractionId: ${interaction.id}\nuserId: ${interaction.user.id}\nguildId: ${interaction.guildId}\n`;
        };

        verboseLog(message);
    };

    module.exports.verboseLongInteraction = (filename, description, interaction, verboseMessage) => {

        var message;
        if (verboseMessage) {
            message = `[${getTime()} INFO] ${filename} (${description}):\ninteractionId: ${interaction.id}\nuserId: ${interaction.user.id}\nguildId: ${interaction.guildId}\ntype: ${interaction.type}\ncreatedAt: ${interaction.createdAt}\n${verboseMessage}\n`;
        } else {
            message = `[${getTime()} INFO] ${filename} (${description}):\ninteractionId: ${interaction.id}\nuserId: ${interaction.user.id}\nguildId: ${interaction.guildId}\ntype: ${interaction.type}\ncreatedAt: ${interaction.createdAt}\n`;
        };

        verboseLog(message);
    };

    module.exports.verboseCustomInteraction = (filename, description, interaction, customInteractionInfo ,verboseMessage) => {
        const time = getTime();

        var message;
        if (verboseMessage) {
            message = `[${time} INFO] ${filename} (${description}):\ninteractionId: ${interaction.id}\n${customInteractionInfo}\n${verboseMessage}\n`;
        } else {
            message = `[${time} INFO] ${filename} (${description}):\ninteractionId: ${interaction.id}\n${customInteractionInfo}\n`;
        };

        verboseLog(message);
    };

    module.exports.verboseWarningInteraction = (filename, description, interaction, customInteractionInfo, verboseMessage) => {

        var message;
        if (verboseMessage) {
            message = `[${getTime()} INFO] ${filename} (${description}):\ninteractionId: ${interaction.id}\nuserId: ${interaction.user.id}\nguildId: ${interaction.guildId}\ntype: ${interaction.type}\ncreatedAt: ${interaction.createdAt}\n${customInteractionInfo}\n${verboseMessage}\n`;
        } else {
            message = `[${getTime()} INFO] ${filename} (${description}):\ninteractionId: ${interaction.id}\nuserId: ${interaction.user.id}\nguildId: ${interaction.guildId}\ntype: ${interaction.type}\ncreatedAt: ${interaction.createdAt}\n${customInteractionInfo}\n`;
        }

        verboseLog(message);
    };

    module.exports.verboseWarning = (filename, warning, description) => {
        const time = getTime();

        const message = `[${time} WARNING] ${filename} (${description}): ${warning}\n`

        verboseLog(message);
    };

//functions that will be used inside this script

function getTime () { //get the current date/time in a nice format
    const now = new Date();
    const time = `${now.getUTCHours()}:${now.getUTCMinutes()}:${now.getUTCSeconds()}-${now.getUTCDate()}/${now.getUTCMonth()+1}/${now.getUTCFullYear()}`

    return time;
}

function standardLog (contents) {
    console.log(contents)

    try {
        fs.appendFileSync(standardLogFile, `${contents}\n`)
    } catch (error) {
        console.error(error)
    }
}

function warningLog (contents) {
    console.log(contents)

    try {
        fs.appendFileSync(warningLogFile, `${contents}\n`)
        fs.appendFileSync(standardLogFile, `${contents}\n`)
    } catch (error) {
        console.error(error)
    }
}

function errorLog (contents) {
    console.log(contents)

    try {
        fs.appendFileSync(errorLogFile, `${contents}\n`)
        fs.appendFileSync(standardLogFile, `${contents}\n`)
    } catch (error) {
        console.error(error)
    }
}

function verboseLog (contents) {

    if (verbose) {
        console.log(contents)
        try {
            fs.appendFileSync(standardLogFile, `${contents}\n`)
        } catch (error) {
            console.error(error)
        }
    } else {
        try {
            fs.appendFileSync(verboseLogFile, `${contents}\n`)
        } catch (error) {
            console.error(error)
        }
    }
}
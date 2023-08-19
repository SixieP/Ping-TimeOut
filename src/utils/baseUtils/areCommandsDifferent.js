const { Options, DefaultDeviceProperty } = require("discord.js");

module.exports = (existingCommand, localCommand) => {

  // Check if defaultMemberPermissions is different
    if (localCommand.defaultMemberPermissions || localCommand.defaultMemberPermissions === null) {
      var existingPerms;
      var localPerms;

      //check if existing command defaultperms is null
      if (existingCommand.defaultMemberPermissions === null) {
        existingPerms = existingCommand.defaultMemberPermissions;
      } else {
        existingPerms = existingCommand.defaultMemberPermissions.bitfield;
      }

      localPerms = localCommand.defaultMemberPermissions;

      if (existingPerms !== localPerms) {
        return true
      }
    }

  // Check if description is different
  var localDescription;
  var existingDescription = existingCommand.description;

  //if the command is a testCommand add TESTCOMMAND | to the localdescription. (so it is the same as the existing command)
  if (localCommand.testCommand) {
    localDescription = `TESTCOMMAND | ${localCommand.description}`
  } else {
    localDescription = localCommand.description
  }

  if (existingDescription !== localDescription) {
    return true;
  }

  //check if options are different
  
  if (localCommand.options) {
    for (localOption of localCommand.options) {
      const existingOption = existingCommand.options?.find(
        (option) => option.name === localOption.name
      );

      //if command.option exists
      if (localOption) {
        const compareResult = areOptionsDifferent(localOption, existingOption);
        if (compareResult === true) {
          return true;
        }
      }

      //if .options of command.options exits
      if (localOption.options) {
        const subGroupLocalOptions = localOption.options;

        for (subGroupLocalOption of subGroupLocalOptions) {
          const subGroupExistingOption = existingOption.options?.find(
            (option) => option.name === subGroupLocalOption.name
          );

          const compareResult = areOptionsDifferent(subGroupLocalOption, subGroupExistingOption);
          if (compareResult === true) {
            return true;
          }
        }
        
      }
    }
  }

  //check command NSFW status
  if((localCommand.nsfw || false) !== (existingCommand.nsfw)) {
    return true;
  }

  //check command DM perms status
  if((localCommand.dmPermission || true) !== (existingCommand.dmPermission || true)) {
    return true;
  }

  // If non of the conditions are true default to false
  return false;

  //END OF MODULE.EXPORTS
};

  //START OF FUNCTIONS

  //compare local and exiting options
  function areOptionsDifferent(localOption, existingOption) {
    if (
      localOption.type !== existingOption.type ||
      localOption.description !== existingOption.description ||
      (localOption.required || false) !== (existingOption.required || false) ||
      (localOption.choices?.lenght || 0) !== (existingOption.choices?.lenght || 0) ||
      areChoicesDifferent(localOption.choices || [], existingOption.choices || []) ||
      localOption.minValue !== existingOption.minValue ||
      localOption.maxValue !== existingOption.maxValue ||
      localOption.minLength !== existingOption.minLength ||
      localOption.maxLenght !== existingOption.maxLenght
    ) {
      return true;
    } else {
      return false;
    }
  }

  //compare local and exiting choices
  function areChoicesDifferent(localChoices, existingChoises) {
    for (localChoice of localChoices) {
      const existingChoice = existingChoises?.find(
        (choice) => choice.name === localChoice.name
      );

      if (!existingChoice) {
        return true;
      }

      if (localChoice.value !== existingChoice.value) {
        return true;
      }


      return false;
    }
  }
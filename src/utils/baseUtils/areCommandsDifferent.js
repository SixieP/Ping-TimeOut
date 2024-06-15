const { Options, DefaultDeviceProperty } = require("discord.js");

module.exports = (existingCommand, localCommand) => {

  for (const [key, value] of Object.entries(localCommand)) {

    //If the key is one of the following values continue;
    const excludedKeys = [
      "testCommand",
      "inactive",
      "devOnly",
      "callback",
      "modal",
      "cooldown",
      "contexts", //Include when available on discord
      "intergration_types" //Include when available on discord
    ];

    if (excludedKeys.includes(key)) continue;

    if (!existingCommand[key] && existingCommand[key] != null) return true;

    //Check if the value is a string/function
    if (typeof(value) == "string" || typeof(value) == "bigint") {

      //If the value is the description check if its a test command cause that adds TEST-COMMAND to the description
      if (key === "description" && localCommand?.testCommand) {
        if (value != existingCommand[key].slice(15)) return true;
      } else {
        if (value != existingCommand[key]) return true;
      };
    } else if (typeof(value) == "boolean") {
      if (key == "dm_permission") {
        if (value != existingCommand["dmPermission"]) return true;
      } else {
        if (value != existingCommand[key]) return true;
      };
    } else if (typeof(value) == "object") {
      if (key == "defaultMemberPermissions") {
        if (value != existingCommand[key]) return true;
      } else if (key == "options") {
        areOptionsDifferent(value, existingCommand["options"]);
      } else {
        console.log(key, typeof(value), value, existingCommand[key]);
      }
    } else {
      console.log(key, typeof(value))
    }
  };

  // If nothing changed return false
  return false;

  //END OF MODULE.EXPORTS
};

  //START OF FUNCTIONS

  //compare local and exiting options
  function areOptionsDifferent(localOption, existingOption) {
    if (
      localOption.type !== existingOption?.type ||
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
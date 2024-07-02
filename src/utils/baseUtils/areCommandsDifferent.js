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
        var loopCount = value.length;
        if (loopCount < existingCommand[key].length) loopCount = existingCommand[key].length;

        for (i = 0; i < loopCount; i++) {
          const localOption = value[i];
          const existingOption = existingCommand[key][i];

          if (!localOption || !existingOption) return true;

          areOptionsDifferent(localOption, existingOption);
        };
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
      (localOption.choices?.length || 0) !== (existingOption.choices?.length || 0) ||
      areChoicesDifferent(localOption.choices || [], existingOption.choices || []) ||
      localOption.minValue !== existingOption.minValue ||
      localOption.maxValue !== existingOption.maxValue ||
      localOption.minLength !== existingOption.minLength ||
      localOption.maxLength !== existingOption.maxLength
    ) return true;
      
    // If there are options within the options also check those
    if (localOption.options || existingOption.options) {
        var loopCount = localOption.options.length;
        if (loopCount < existingOption.options.length) loopCount = existingOption.options.length;

        for (i = 0; i < loopCount; i++) {
          const embeddedLocalOption = localOption.options;
          const embeddedExistingOption = existingOption.options[i];

          if (!embeddedLocalOption || !embeddedExistingOption) return true;

          areOptionsDifferent(embeddedLocalOption, embeddedExistingOption);
        };
    };

    return false;
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
const helper = {};

helper.isNullOrUndefined = val => val === null || val === undefined;
helper.isNullOrUndefinedOrEmpty = val => val === "" || helper.isNullOrUndefined( val );
helper.isString = val => typeof( val ) === "string";
helper.isBoolean = val => typeof( val ) === "boolean";

module.exports = helper;

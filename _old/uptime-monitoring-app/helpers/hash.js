// Dependencies
const crypto = require( "crypto" );
const config = require( "../lib/config" );
const { isString } = require( './type-of' );

const helper = {};

// Hash a string
// Input: string value
// Output: Return a sha256 hash of the string
helper.hash = str => {
  let hashedStr = '';

  if ( isString( str ) && str.length > 0 ) {
    hashedStr = crypto.createHmac( "sha256", config.hashingSecret )
                      .update( str )
                      .digest( "hex" );
  }

  return hashedStr;
};

module.exports = helper;
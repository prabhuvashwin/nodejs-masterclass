// These are the request handlers

// Dependencies
const users = require( "./users" );

// Define the handlers
const handlers = {};

// Users handler
handlers.users = ( data, cb ) => users( data, cb );

// Ping handler
handlers.ping = ( data, cb ) => {
  cb && cb( 200, data );
}

// Not found handler
handlers.notFound = ( _, cb ) => {
  cb && cb( 404 );
};

module.exports = handlers;
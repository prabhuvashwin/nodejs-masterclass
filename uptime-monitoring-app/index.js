// Primary file for the API

// Dependencies
const fs = require( "fs" );
const http = require( "http" );
const https = require( "https" );
const url = require( "url" );
const StringDecoder = require( "string_decoder" ).StringDecoder;
const config = require( "./config" );

// Instantiate the http server
const httpServer = http.createServer( ( req, res ) => {
  unifiedServer( req, res );
} );

// Start the server, and have it listen on port specified in the configuration
httpServer.listen( config.httpPort, () => {
  console.log( `The httpServer is listening on port ${config.httpPort}` );
} );

// Instantiate the https server
const httpsServerOptions = {
  key: fs.readFileSync( "./https/key.pem" ),
  cert: fs.readFileSync( "./https/cert.pem" ),
};
const httpsServer = https.createServer( httpsServerOptions, ( req, res ) => {
  unifiedServer( req, res );
} );

// Start the server, and have it listen on port specified in the configuration
httpsServer.listen( config.httpsPort, () => {
  console.log( `The httpsServer is listening on port ${config.httpsPort}` );
} );

// All the server logic for both http and https server
const unifiedServer = ( req, res, port ) => {
  // Get the url and parse it
  const parsedUrl = url.parse( req.url, true );

  // Get the path from the url
  // Get the query string as an object
  const { pathname: path, query } = parsedUrl;
  const trimmedPath = path.replace( /^\/+|\/+$/g, "" );

  // Ge tthe HTTP method
  const method = req.method.toLowerCase();

  // Get the headers as an object
  const { headers } = req;

  // Get the payload, if any
  const decoder = new StringDecoder( "utf-8" );
  let buffer = "";
  
  req.on( "data", data => {
    buffer += decoder.write( data );
  } );

  req.on( "end", () => {
    buffer += decoder.end();

    // Choose the handler this request should go to.
    // If not handler is matched, then choose notFoundHandler
    const chosenHandler = typeof( router[trimmedPath] ) !== "undefined"
                            ? router[trimmedPath]
                            : handlers.notFound;

    // Construct a data object tp send to the handler
    const data = {
      trimmedPath,
      method,
      headers,
      payload: buffer
    };

    // Route the request to the handler specified in the router
    chosenHandler( data, ( code, payload ) => {
      // Use the status code called back by the handler, or default to 200
      code = typeof( code ) === "number" ? code : 200;

      // Use the payload called back by the handler, or default to {}
      payload = typeof( payload ) === "object" ? payload : {};

      // Convert the payload to a string
      const payloadStr = JSON.stringify( payload );

      // Return the response
      res.setHeader( "Content-Type", "application/json" );
      res.writeHead( code );
      res.end( payloadStr );

      // Log what path the user has requested for
      console.log( `Response returned: ${code} -> ${payloadStr}` );
    } );
  } );
};

// Deifne the handlers
const handlers = {};

// Ping handler
handlers.ping = ( data, cb ) => {
  cb && cb( 200 );
}

// Not found handler
handlers.notFound = ( data, cb ) => {
  cb && cb( 404 );
};

// Define a request router
const router = {
  "ping": handlers.ping,
};
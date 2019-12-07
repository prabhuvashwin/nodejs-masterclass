const http = require( "http" );
const url = require( "url" );
const StringDecoder = require( "string_decoder" ).StringDecoder;
const config = require( "./config" );

// Instantiate the http server
const server = http.createServer( ( req, res ) => serverCb( req, res ) );

// Start the server, and have it listen on port specified in the config
server.listen( config.port, () => console.log( `Server is listening on port ${config.port}` ) );

// All the server logic for both http server
const serverCb = ( req, res ) => {
  // Get the url and parse
  const parsedUrl = url.parse( req.url, true );

  // Get path from parsedUrl and trim it for '/'
  const { pathname: path } = parsedUrl;
  const trimmedPath = path.replace( /^\/+|\/+$/g, "" );

  // Get the http method
  const method = req.method.toLowerCase();

  // Get the headers as an object
  const { headers } = req;

  // Get the payload
  const decoder = new StringDecoder( "utf-8" );
  let buffer = "";

  req.on( "data", data => {
    buffer += decoder.write( data );
  } );

  req.on( "end", () => {
    buffer += decoder.end();

    // Choose the handler this request should go to.
    // If no handler is matched, then choose notFound handler
    const chosenHandler = typeof( router[trimmedPath] ) !== "undefined"
                            ? router[trimmedPath]
                            : handlers.notFound;

    // Construct a data object to send to the handler
    const data  ={
      trimmedPath,
      method,
      headers,
      payload: buffer,
    };

    // Route the request to the handler specified in the router
    chosenHandler( data, ( code, payload ) => {
      // Use the status code called back by the handler, or default to 200
      code = typeof( code ) === "number" ? code : 200;

      // Use the pyload called back by the handler, or default to {}
      payload = typeof( payload ) === "object" ? payload : {};

      // Convert the payload to a string
      const payloadStr = JSON.stringify( payload );

      // Return response
      res.setHeader( "Content-Type", "application/json" );
      res.writeHead( code );
      res.end( payloadStr );

      // Log what path the user has requested for
      console.log( `Response returned: ${code} -> ${payloadStr}` );
    } );
  } );
};

// Define handlers
const handlers = {};

// Hello handler
handlers.hello = ( _, cb ) => {
  cb && cb( 200, { message: "Hello everyone! Server is up and running :)" } );
};

// notFound handler
handlers.notFound = ( _, cb ) => {
  cb && cb( 404 );
};

// Define a request router
const router = {
  "hello": handlers.hello,
};
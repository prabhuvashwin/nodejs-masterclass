// Library for storing and editing data

// Dependencies
const fs = require( "fs" );
const path = require( "path" );
const parseHelper = require( "../helpers/parse" );

// Container for the module (to be exported)
const lib = {};

// Base directory of the data folder
lib.baseDir = path.join( __dirname, "/../.data" );

const closeCb = ( err, cb ) => {
  if ( !err ) {
    cb && cb( false );
  } else {
    cb && cb( "Error closing file" );
  }
};

const writeCb = ( err, fileDescriptor, cb ) => {
  if ( !err ) {
    fs.close( fileDescriptor, e => closeCb( e, cb ) );
  } else {
    cb && cb( "Error writing file" );
  }
};

// Write data to a file
lib.create = ( dir, file, data, cb ) => {
  // Open the file for writing
  fs.open( `${lib.baseDir}/${dir}/${file}.json`, "wx", ( err, fileDescriptor ) => {
    if ( !err && fileDescriptor ) {
      // Convert data to string
      const stringData = JSON.stringify( data );

      // Write to file and close
      fs.writeFile( fileDescriptor, stringData, e => writeCb( e, fileDescriptor, cb ) );
    } else {
      cb && cb( "Could not create new file. It may already exist!" );
    }
  } );
};

// Read data from a file
lib.read = ( dir, file, cb ) => {
  fs.readFile( `${lib.baseDir}/${dir}/${file}.json`, "utf8", ( err, data ) => {
    if ( !err && data ) {
      const parsedData = parseHelper.parseJSONToObject( data );
      cb && cb( false, parsedData );
    } else {
      cb && cb( err, data )
    }
  } );
};

// Update data inside a file
lib.update = ( dir, file, data, cb ) => {
  fs.open( `${lib.baseDir}/${dir}/${file}.json`, "r+", ( err, fileDescriptor ) => {
    if ( !err && fileDescriptor ) {
      // Convert data to string
      const stringData = JSON.stringify( data );

      // Trucate the file
      fs.ftruncate( fileDescriptor, err => {
        if ( !err ) {
          // Write to the file and close it
          fs.writeFile( fileDescriptor, stringData, e => writeCb( e, fileDescriptor, cb ) );
        } else {
          cb && cb( "Error truncating file" );
        }
      } );

    } else {
      cb && cb( "Could not open file for updating. It may not exist!" );
    }
  } );
};

// Delete a file
lib.delete = ( dir, file, cb ) => {
  // Unlink the file
  fs.unlink( `${lib.baseDir}/${dir}/${file}.json`, err => {
    if ( !err ) {
      cb && cb( false );
    } else {
      cb && cb( "Error deleting file" );
    }
  } );
}

module.exports = lib;
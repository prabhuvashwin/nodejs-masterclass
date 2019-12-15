// Dependencies
const _data = require( "./data" );
const hashHelper = require( "../helpers/hash" );
const typesHelper = require( "../helpers/type-of" );

// Container for the users submethods
const _users = {};

// Users - get method
// Required data: phoneNumber
// Optional data: none
// Note: Only let an authenticated user access their own data, and not anyone else's
_users.get = ( data, cb ) => {
  // Check the phoneNumber is valid
  const { query = {} } = data;
  const { phone } = query;
  const phoneNumber = typesHelper.isString( phone ) && phone.trim().length === 10 ? phone : "";

  if ( phoneNumber ) {
    // Lookup phone number
    _data.read( "users", phone, ( err, _returnedData ) => {
      if ( !err && _returnedData ) {
        // Remove the hashed password from user object before returning
        delete _returnedData.password;
        cb && cb( 200, _returnedData );
      } else {
        cb && cb( 404 );
      }
    } );
  } else {
    cb && cb( 400, { error: "Missing required field" } );
  }
};

// Users - post method
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
_users.post = ( data, cb ) => {
  // Check that all required fields are filled out
  const { payload = {} } = data;
  const {
    firstName: fName,
    lastName: lName,
    phoneNumber: pNum,
    password: pwd,
    tosAgreement: tos,
  } = payload;

  const firstName = ( typesHelper.isString( fName ) && fName.trim() ) ? fName.trim() : "";
  const lastName = ( typesHelper.isString( lName ) && lName.trim() ) ? lName.trim() : "";
  const phoneNumber = ( typesHelper.isString( pNum ) && pNum.trim().length === 10 ) ? pNum.trim() : "";
  const password = ( typesHelper.isString( pwd ) && pwd.trim() ) ? pwd.trim() : "";
  const tosAgreement = ( typesHelper.isBoolean( tos ) && tos ) || false;

  const isDataValid = firstName && lastName && phoneNumber && password && tosAgreement;
  if ( isDataValid ) {
    // Make sure that the user does not already exist
    _data.read( "users", phoneNumber, ( err, data ) => {
      if ( err ) {
        // Hash the password
        const hashedPwd = hashHelper.hash( password );

        if ( hashedPwd ) {
          // Create the user object
          const userObj = {
            firstName,
            lastName,
            phoneNumber,
            password: hashedPwd,
            tosAgreement,
          };

          // Store the user
          _data.create( "users", phoneNumber, userObj, err => {
            if ( !err ) {
              cb && cb( 200 );
            } else {
              console.log( "<--", err );
              cb && cb( 500, { error: "Could not create the new user" } );
            }
          } );
        } else {
          cb && cb( 500, { error: "Could not hash the user's password" } );
        }
      } else {
        // User already exists
        cb && cb( 400, { error: "User with phone already exists" } );
      }
    } );
  } else {
    cb && cb( 400, { error: "Missing/Incorrect required parameters" } )
  }
};

// Users - put method
// Required data: phone
// Optional data: firstName, lastName, password
// Note: Atleast one of the optional fields need to be specified
// Note: Only let an authenticated user access/update their own data, and not anyone else's
_users.put = ( data, cb ) => {
  // Check for the required field
  const { payload = {} } = data;
  const {
    firstName: fName,
    lastName: lName,
    phoneNumber: pNum,
    password: pwd,
  } = payload;
  const phoneNumber = typesHelper.isString( pNum ) && pNum.trim().length === 10 ? pNum : "";

  // Check for optional fields
  const firstName = ( typesHelper.isString( fName ) && fName.trim() ) ? fName.trim() : "";
  const lastName = ( typesHelper.isString( lName ) && lName.trim() ) ? lName.trim() : "";
  const password = ( typesHelper.isString( pwd ) && pwd.trim() ) ? pwd.trim() : "";

  // Error if the phone is invalid
  if ( phoneNumber ) {
    if ( firstName || lastName || password ) {
      // Lookup user
      _data.read( "users", phoneNumber, ( err, userData ) => {
        if ( !err && userData ) {
          // Update the firstName/lastName/password in user data
          firstName && ( userData.firstName = firstName );
          lastName && ( userData.lastName = lastName );
          password && ( userData.password = hashHelper.hash( password ) );

          _data.update( "users", phoneNumber, userData, err => {
            if ( !err ) {
              cb && cb( 200 );
            } else {
              console.log( "<--", err );
              cb && cb( 500, { error: "Could not update the user" } );
            }
          } )
        } else {
          cb && cb( 400, { error: "The specified user does not exist" } );
        }
      } );
    } else {
      cb && cb( 400, { error: "Missing fields to update" } );
    }
  } else {
    cb && cb( 400, { error: "Missing required field" } );
  }
};

// Users - delete method
// Required filed: phoneNumber
// Note: Only let an authenticated user delete their own data file.
// Note: Cleanup (delete)  any other data files associated with this user
_users.delete = ( data, cb ) => {
  // Check that the phone number is valid
  const { query = {} } = data;
  const { phone } = query;
  const phoneNumber = typesHelper.isString( phone ) && phone.trim().length === 10 ? phone : "";

  if ( phoneNumber ) {
    // Lookup phone number
    _data.read( "users", phone, ( err, _returnedData ) => {
      if ( !err && _returnedData ) {
        _data.delete( "users", phone, err => {
          if ( !err ) {
            cb && cb( 200 );
          } else {
            cb && cb( 500, { error: "Could not delete the specified user" } );
          }
        } );
      } else {
        cb && cb( 400, { error: "Could not find the specified user" } );
      }
    } );
  } else {
    cb && cb( 400, { error: "Missing required field" } );
  }
};

const users = ( data = {}, cb ) => {
  const methods = ["post", "get", "put", "delete"];

  if ( !typesHelper.isNullOrUndefinedOrEmpty( methods.indexOf( data.method ) ) ) {
    _users[data.method]( data, cb );
  } else {
    cb && cb( 200, data );
  }
};

module.exports = users;
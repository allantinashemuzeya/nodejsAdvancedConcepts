/*
 * Request handlers
 */

const { Z_DATA_ERROR } = require("zlib");

// Dependencies
var _data = require('./data');
const { hash } = require("./helpers");
var helpers = require('./helpers')
//  Define handlers
var handlers = {};

// Users
handlers.users = function (data, callback) {
	var acceptedMethods = ["post", "get", "put", "delete"];
	if (acceptedMethods.indexOf(data.method) > -1) {
		handlers._users[data.method](data, callback);
	} else {
		callback(405);
	}
};

// Container for the users submethods
handlers._users = {};

// Users - Post

// REQUIRED data : firstName, lastName, phone, password, tosAgreement
//Optional Data: none
handlers._users.post = function (data, callback) {

    //check that all the required fileds are filled out
    var firstName =
                typeof data.payload.firstName == "string" &&
                data.payload.firstName.trim().length > 0
                    ? data.payload.firstName.trim()
                    : false;

    var phone =
                typeof data.payload.phone == "string" &&
                data.payload.phone.trim().length == 10
                    ? data.payload.phone.trim()
                    : false;

    var lastName =
                    typeof data.payload.lastName == "string" &&
                    data.payload.lastName.trim().length > 0
                        ? data.payload.firstName.trim()
                        : false;

    var password =
					typeof data.payload.lastName == "string" &&
					data.payload.password.trim().length > 0
						? data.payload.password.trim()
                        : false;
    var tosAgreement =
                typeof data.payload.tosAgreement == "boolean" &&
                data.payload.tosAgreement == true ? true : false;

    if(firstName && lastName && phone && password && tosAgreement){
        // Make sure that the user doesn't already exist
        _data.read('users', phone, function(err, data){
            if(err){
                // Hash the passwords

                var hashedPassword = helpers.hash(password);


                // Create the user object
                if(hashedPassword){
                        var userObject = {
                        'firstName' : firstName,
                        'lastName' : lastName,
                        'phone' : phone,
                        'hashedPassword' : hashedPassword,
                        'tosAgreement' : true
                    }

                    // Store the user
                    _data.create('users',phone, userObject, function(err){
                        if(!err){
                            callback(200)
                        }else{
                            console.log(err);
                            callback(500, {'Error' : 'Could not create the new user'});
                        }
                    })
                }
                else{
                    callback(500, {'Error' : 'Could not hash the user\'s password'});
                }
                

            }else{
                callback(400, {'Error' : 'A User with that phone number already exist'})
            }
        });
    }else{
        callback(400, {'Error' :'Missing required fields'});
    }

};

// Users - get

//Required Data :: phone
// Optional Data :: none
// @TODO Only let an authenticated user access their object dont let them access anyone else's

handlers._users.get = function (data, callback) {
    //Check that the phone number is valid
    
	if(data.queryString.phone) {
        var phone =
					typeof data.queryString.phone == "string" &&
					data.queryString.phone.length == 10
						? data.queryString.phone.trim()
						: false;

				if (phone) {
					//Lookup the user
					_data.read("users", phone, function (err, data) {
						if (!err && data) {
							// Remove the hashedPassoword from the user object before returning it to the requester
							delete data.hashedPassword;
							callback(200, data);
						} else {
							callback(404);
						}
					});
				} else {
					callback(400, { Error: "Missing required Fields" });
				}
    }else{
        callback(404);
    }
};

   
// Users - Put
// Required Data :: phone
// Optional Data :: firstName, lastName, password, (at least one must be specified)
// @TOD only let an authenticated user update their own object , Don't let them update another person object
handlers._users.put = function (data, callback) {
    // Check for the required data
     var phone =
				typeof data.payload.phone == "string" &&
				data.payload.phone.length == 10
					? data.payload.phone.trim()
                    : false;
                    
    // Check for the optional Fields
    var firstName =
			typeof data.payload.firstName == "string" &&
			data.payload.firstName.trim().length > 0
				? data.payload.firstName.trim()
                : false;
                
    var lastName =
			typeof data.payload.lastName == "string" &&
			data.payload.lastName.trim().length > 0
				? data.payload.lastName.trim()
				: false;

		

		var password =
			typeof data.payload.password == "string" &&
			data.payload.password.trim().length > 0
				? data.payload.password.trim().length > 0
				: false;

        // Error if the phone is invalid
        if(phone){
            // Error if nothing is sent to update
            if(firstName || lastName || password){
                // Check if the user exists
                _data.read('users',phone, function(err,userData){
                    if(!err && userData){
                        //Update neccessry fields
                        if(firstName){
                            userData.firstName = firstName;
                        }
                        if(lastName){
                            userData.lastName = lastName;
                        }
                        if(password){
                            userData.hashedPassword = helpers.hash(password);
                        }

                        // Store the new data
                        _data.update('users', phone, userData, function(err){
                            if(!err){
                                callback(200)
                            }else{
                                console.log(err);
                                callback(500, {'Error': 'Could not update the user'})
                            }
                        })
                    }else{
                        callback(400, {'Error' : 'The spicified user does not exist'})
                    }
                })
            }else{
                callback(400, {'Error' : 'Missing fields to update'})
            }

        }else{
            callback(400, {'Error' : 'Missing required field'})
        }
};

// Users - Delete
// Required : phone
	// @TODO only let an authenticated user delete their own object , Don't let them delete another person object

handlers._users.delete = function (data, callback) {
	//Check that the phone number is valid

	if (data.queryString.phone) {
		var phone =
			typeof data.queryString.phone == "string" &&
			data.queryString.phone.length == 10
				? data.queryString.phone.trim()
				: false;

		if (phone) {
			//Lookup the user
			_data.read("users", phone, function (err, data) {
				if (!err && data) {
					// Remove the hashedPassoword from the user object before returning it to the requester
                    delete data.hashedPassword;
                    _data.delete('users', phone, function(err){
                        if(!err){
                            callback(200);
                        }else{
                            callback(400)
                        }
                    })
					callback(200, data);
				} else {
					callback(404);
				}
			});
		} else {
			callback(400, { Error: "Missing required Fields" });
		}
	} else {
		callback(404);
	}
};


// Tokens
// Users
handlers.tokens = function (data, callback) {
	var acceptedMethods = ["post", "get", "put", "delete"];
	if (acceptedMethods.indexOf(data.method) > -1) {
		handlers._tokens[data.method](data, callback);
	} else {
		callback(405);
	}
};

// Container
handlers._tokens = {};

// Tokens - post
// Required Data : phone, password
// Optional data : none
handlers._tokens.post = function(data, callback){
     var phone =
			typeof data.payload.phone == "string" &&
			data.payload.phone.trim().length == 10
				? data.payload.phone.trim()
                : false;

    var password =
			typeof data.payload.password == "string" &&
			data.payload.password.trim().length > 0
				? data.payload.password.trim()
                : false;
                
                console.log(phone, password)
                if(phone && password){
                    // Look up the user who matches that phone number
                    _data.read('users', phone, function(err, userData){
                        if(!err && userData){
                            // Hash the sent password and compare it to the password stored in the records.
                            var hashedPassword = helpers.hash(password)
                            if(hashedPassword == userData.hashedPassword){
                                // If valid create a new token with a random name. Set expiration data 1 hour in the future
                                var tokenId = helpers.createRandomString(20);
                                var expires = Date.now() + 1000 * 60 * 60;

                                console.log(tokenId)
                                var tokenObject = {
                                    'phone': phone,
                                    'id': tokenId,
                                    'expires': expires
                                }

                                // Store the token 
                                _data.create('tokens', tokenId, tokenObject, function(err){
                                    if(!err){
                                        callback(200, tokenObject)
                                    }else{
                                        callback(500, {'Error' : 'Could not create the new token'})
                                    }
                                })

                            }else{
                                callback(400, {'Error' : 'Password did not match the specified users stored password'})
                            }
                        }else{
                            callaback(400, {'Error':'Could not find the specified user'})
                        }
                    })

                }else{
                    callback(400, {'Error' : 'Missing required fields'})
                }
}

// Tokens - get
handlers._tokens.get = function(data, callback){
}

// Tokens - put
handlers._tokens.put = function(data, callback){
}

// Tokens - delete
handlers._tokens.delete = function(data, callback){
}











//Ping handler
handlers.ping = function (data, callback) {
	callback(200);
};

// Not found
handlers.notFound = function (data, callback) {
	callback(404);
};

module.exports = handlers;

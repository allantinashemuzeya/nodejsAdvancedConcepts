/*
* Helpers for various tests
*
*
*/

// Dependencies
const { SSL_OP_NO_TLSv1_1 } = require('constants');
var crypto = require('crypto');
var config = require('./config');


// Containter for all the helpers
var helpers = {};


// Create a SHA356 hash 
helpers.hash = function(str){
    if(typeof(str) == 'string' && str.length > 0){
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    }else {
        return false;
    }
}

// Parse a JSON string to an object in all cases without throwing

helpers.parseJsonToObject = function(str){
    try{
        var obj = JSON.parse(str);
        return obj;
    }catch(e){
        return {}
    }
}



// Create a string of random Alpha numeric chars

helpers.createRandomString = function(strLength){
   strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
   if(strLength){
        // Define all the possible characters that could go into a string
        var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        // Start the final string 
        var str = '';
            for(var i = 1; i <= strLength; i++){
                // Get random character from the possible characters
                var randomCharacter =possibleCharacters.charAt(Math.floor(Math.random() *
                 possibleCharacters.length));
                str+randomCharacter;

                console.log(str)
                // Append this character to the final string
            }

        // Return the final string 
        return str;
   }else{
       return false;
   }
}






// Export the container
module.exports = helpers;
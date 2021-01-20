/*
 * Primary file for the API
 *
 */

// Dependencies
var http = require("http");
var https = require("https");
var url = require("url");
var stringDecoder = require("string_decoder").StringDecoder;
var config = require("./lib/config");
var fs = require("fs");
var handlers = require("./lib/handlers");
var helpers = require("./lib/helpers");

// Instantiating the http server
var httpServer = http.createServer(function (req, res) {
	unifiedServer(req, res);
});

// Start the HTTP server.
httpServer.listen(config.httpPort, function () {
	console.log("The server is listening on port  " + config.httpPort);
});

//Instantiating the HTTPS server
var httpsServerOptions = {
	key: fs.readFileSync("./https/key.pem"),
	cert: fs.readFileSync("./https/cert.pem"),
	passphrase: "Kungfucool24",
};

var httpsServer = https.createServer(httpsServerOptions, function (req, res) {
	unifiedServer(req, res);
});

// Start the https server
httpsServer.listen(config.httpsPort, function () {
	console.log("The server is listening on port  " + config.httpsPort);
});

// All the serve logic for the http and https server
var unifiedServer = function (req, res) {
	// Get the URL and parse it
	var parsedUrl = url.parse(req.url, true);

	// Get the path from the url
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g, "");

	// Get the query string as an object
	var queryString = parsedUrl.query;

	// Get the http method
	var method = req.method.toLowerCase();

	// Get the headers as an object
	var headers = req.headers;

	// Get the payload of there is any
	var decoder = new stringDecoder("utf-8");
	var buffer = "";
	req.on("data", function (data) {
		buffer += decoder.write(data);
	});
	req.on("end", function () {
		buffer += decoder.end();

		// Choose the handler this req should go to
		var chosenHandler =
			typeof router[trimmedPath] !== "undefined"
				? router[trimmedPath]
				: handlers.notFound;

		// Construct the data obeject to send to the handler
		var data = {
			trimmedPath: trimmedPath,
			queryString: queryString,
			method: method,
			trimmedPath,
			headers: headers,
			payload: helpers.parseJsonToObject(buffer),
		};

		// Route the request to the handler in the router
		chosenHandler(data, function (statusCode, payload) {
			// Use the statusCode called by the handler, or default to 200
			statusCode = typeof statusCode == "number" ? statusCode : 200;

			// Use the payload called by the handler, or default to 404
			payload = typeof payload == "object" ? payload : {};

			// Convert to a String
			var payloadString = JSON.stringify(payload);

			// Return the response
			res.setHeader("Content-Type", "application/json");
			res.writeHead(statusCode);
			res.end(payloadString);
			// Log the request path
			console.log("Returning this response: ", statusCode, payloadString);
		});
	});

	

	//  Define a router
	var router = {
        ping: handlers.ping,
        users:handlers.users,
        tokens: handlers.tokens
	};
};

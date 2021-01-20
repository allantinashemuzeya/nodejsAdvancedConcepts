/*
 * Primary file for the hello world API
 *
 */

// Dependencies
var http = require("http");
// Instantiating the http server
var httpServer = http.createServer(function (req, res) {
	chosenUrl(res, req);
});

var router = {
    'hello': 'hello',
}

var handler = (res, req)=>{
  
}

var chosenUrl = function (res, req) {
    var successObject = { message: "welcome man wassup" };
    var resposeObject = { message: "Path Not found" };

	var url = req.url;
	var trimmerdUrl = url.replace("/", "");
	console.log(trimmerdUrl);
	  if (trimmerdUrl == router.hello) {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
		res.end(JSON.stringify(successObject));
	} else {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 404;
		res.end(JSON.stringify(resposeObject));
	}
};


var config = {
	port: 3000,
};

// Start the HTTP server.
httpServer.listen(config.port, function () {
	console.log("The server is listening on port  " + config.port);
});

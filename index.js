var http = require('http');
require('./nodedump');

signIn = function(username, password){
	// validate username and password
	if(!validate(username, password))
		return false;
	else 
		updateSession();
	
	// user is signedIn
	this.signedIn = true;
	return true;
}

var server = http.createServer(function(request, response) {
	console.log('Request received',new Date());
	console.log('url:',request.url);
	// skip requests for favicon
	if (request.url.indexOf('favicon.ico') > -1) {
		console.log('favicon requested');
		response.writeHead(500);
		response.end();
		console.log('Request ended');
		return;
	}
	
	// start output to the browser
	response.writeHead(200, {"Content-Type": "text/html"});
	
	var user = {
		firstName: 'Charles'
		,lastName: 'Teague'
		,age: 21
		,signedIn: false
		,signIn: signIn
		,projects: [
			{
				name: 'Allaire Spectra'
				, status: 'Horrible death'
			}
			,{
				name: 'ColdFusion 4.5'
				,status: 'Been there done that'
			}
		]
	};
	
	//capture dump
	console.log(user);
	var output = nodedump(user);
	
	// write response to the browser
	response.write(
		'<html>'
			+ '<head>'
				+ '<title>nodedump example!</title>'
			+ '</head>'
			+'<body>'
				+output
			+'</body>'
		+'</html>'
	);
	response.end();

	console.log('Request ended');
	//console.log('global.bnodedumpinited',global.bnodedumpinited);
}).listen(3000);

console.log("Server has started.");
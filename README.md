nodedump
========
Outputs variables in a visual, easy to read format based on Adobe ColdFusion's `CFDump` tag. Think of it as `console.log` on steroids.

For example, simply doing `nodedump(user)` gives us:

![Alt text](images_for_readme/user1.png "Optional title")

The above is a dump of the variable `user` created like so:
```javascript
var user = {
	firstName: 'Charles'
	,lastName: 'Teague'
	,age: 21
	,signedIn: false
	,projects: [
		{
			name: 'Allaire Spectra'
			,status: 'Horrible death'
		}
		,{
			name: 'ColdFusion 4.5'
			,status: 'Been there done that'
		}
	]
};
```
With `console.log(user)` we get:
```javascript
{ firstName: 'Charles',
	lastName: 'Teague',
	age: 21,
	signedIn: false,
	projects:
		[ { name: 'Allaire Spectra', status: 'Horrible death' },
			{ name: 'ColdFusion 4.5', status: 'Been there done that' } ] }
```
Which is the typical output we have to rely on usually to do our debugging. As our variables become more complicated this becomes a painful way to know what's going on within them.


nodedump is based on the `CFDump` tag of Adobe's ColdFusion which has long been a unique feature allowing developers to understand what's in any variable. Once you get accustomed to the color coding and layout of dumped output, your brain will be able to quickly see and understand what's in any variable you dump with just a glance. Pretty much all the options available for `CFDump` have been included in nodedump.


INSTALLATION
------------

Run this from your bash or command line:

```bash
$ [sudo] npm install -g nodedump
```


USAGE 
-----

First, `require` nodedump:
```javascript
require('nodedump');
```

Then in your view or wherever you output to the browser, whenever you want to dump the contents of a variable do:
```javascript
nodedump(vartodump);
```

EXAMPLE 
-------
The following example sets up a server, creates a test object and dumps it to the browser.
```javascript
var http = require('http');
require('nodedump');

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
```

OPTIONS
---------

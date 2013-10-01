var http = require('http');
var path = require("path");
var fs = require("fs");

var nd = require('./nodedump').init({
	dumpFunctionName:'dump'
	//,syntaxHighlight: false
});
//require('./nodedump');
//var nd = nodedump(http);
//nodedump(http);

var server = http.createServer(function(request, response) {
	console.log('Request received!');
	console.log('url:',request.url);
	if (request.url !== '/') {
		return serveStaticFiles(request, response);
	}
	response.writeHead(200, {"Content-Type": "text/html"});
	var obj = {
		test_string: 'hi'
		,test_string2:'this is the first'
		,test_wHTML:'this is a<br/>string<br />with<bold>HTML</bold><br/>here'
		,test_number:123
		,test_array_simple:[123, 'string member']
		,test_obj_with_array:{val:[123, 'string member'], val2:321}
		,test_nested_obj: {key1:'hi', key2:'there beautiful world, I\'m node.jsing'}
		,empty_array: []
		,empty_object: {}
		,null_test: null
		,undefined_test: undefined
		,test_regex: /^[A-Za-z0-9]$/gi
		,bool_test: true
		,bool_test_false: false
		,empty_string_test: ''
		,function_test2: serveStaticFiles
		,date_test: new Date()
		,math_obj: Math
		,process_obj: process
		,test_error: new Error('Whaaat!???')
		,string_object: new String
	};
	obj.circular_test = obj;
	obj.test_array_simple[2] = obj.test_array_simple;
	
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
	
	var output = '';
	//output += dump(Object.keys(obj).sort());
	//output += console.log(user);
	output += dump(user, {
					//label:'My Var'
					//,syntaxHighlight: false
					//,expand: false
					//,expand: ['process','global']
					//,expand: ['Object','Array','Function','RegExp'] // true (default) / false / Array of data types to expand keys for. E.g ['Object','Array']
					//,sortKeys: false
					//,show:['empty_string_test','test_array_simple']
					//,show:['val','val2']
					//,show:['bool_test_false', 'test_array_simplet','process_obj']
					//,hide:['test_array_simple', 'empty_string_test']
					//,hide:['val2']
					//,top:2
					//,levels:2
				});
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

serveStaticFiles = function(req, res){

	var filename = req.url || "index.html";
	var ext = path.extname(filename);
	var localPath = __dirname;
	var validExtensions = {
		".html" : "text/html",
		".js": "application/javascript",
		".css": "text/css",
		".txt": "text/plain",
		".jpg": "image/jpeg",
		".gif": "image/gif",
		".ico": "image/x-icon",
		".png": "image/png"
	};
	var isValidExt = validExtensions[ext];

	if (isValidExt) {

		localPath += filename;
		fs.exists(localPath, function(exists) {
			if(exists) {
				console.log("Serving file: " + localPath);
				getFile(localPath, res, ext);
			} else {
				console.log("File not found: " + localPath);
				res.writeHead(404);
				res.end();
			}
		});

	} else {
		console.log("Invalid file extension detected: " + ext);
	}
};


function getFile(localPath, res, mimeType) {
	fs.readFile(localPath, function(err, contents) {
		if(!err) {
			res.setHeader("Content-Length", contents.length);
			res.setHeader("Content-Type", mimeType);
			res.statusCode = 200;
			res.end(contents);
		} else {
			res.writeHead(500);
			res.end();
		}
	});
}
var http = require('http');
var path = require("path");
var fs = require("fs");
//var nd = require('./nodedump').nodedump(http);
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
//	if (request.url === '/favicon.ico') {
//		response.writeHead(200, {'Content-Type': 'image/x-icon'} );
//		response.end();
//		console.log('favicon requested');
//		return;
//	}
	//console.log('this:',typeof(this));
	//var toClass = {}.toString;
	//console.log('this:',toClass.call( this ));
	//console.log('this:',this instanceof http);
	//nodedump(http);
	//nodedump(this);
	//nodedump(request, response);
	//response.writeHead(200, {"Content-Type": "text/plain"});
	response.writeHead(200, {"Content-Type": "text/html"});
	//response.write("Hello World Yes!\n\n");
	//var output = nd.dump({test: 'hi', val:'this is the first'});
	//var output = nd.dump(['test','here']);
	//var output = nd.dump('here');
	//var output = nd.dump(123);
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
//		,function_test: function(arg1, arg2){
//			var xyz = 223;
//			var b = '<br><bold>Hi there</bold><i> beautiful world!</i><br /><br />Sweet!';
//			return xyz;
//		}
		,function_test2: serveStaticFiles
		,date_test: new Date()
		,math_obj: Math
		,process_obj: process
		,test_error: new Error('Whaaat!???')
		,string_object: new String
	};
	obj.circular_test = obj;
//	console.log('typeof process:',typeof process);
//	console.log('typeof date:',typeof obj.date_test);
//	console.log('typeof string:',typeof obj.test_string);
//	console.log('typeof regex:',typeof obj.test_regex);
//	console.log('typeof null:',typeof obj.null_test);
//	console.log('typeof undefined:',typeof obj.undefined_test);
//	console.log('typeof function:',typeof obj.function_test);
//	console.log('typeof Math:',typeof obj.math_obj);
//	console.log('typeof fs:',typeof fs);
	obj.test_array_simple[2] = obj.test_array_simple;
	var output = '';
	//output += dump(Object.keys(obj).sort());
	output += dump(global, {
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
				+ '<title>nodedump!</title>'
                //+ '<style type="text/css">table, tr, th, td { border-collapse: collapse; }</style>'
				//+ '<link href="assets/bootstrap.css" rel="stylesheet">'
				//+ '<link href="assets/tomorrow.css" rel="stylesheet">'
				//+ '<link href="assets/googlecode.css" rel="stylesheet">'
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
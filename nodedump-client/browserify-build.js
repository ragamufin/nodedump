// run by doing 
// node browserify-build
var fs = require('fs');
var file_name = 'nodedump-client.js';
var file_name_min = 'nodedump-client-min.js';
console.log('Building: ' + file_name + ' ...');
var uglify = require("uglify-js");
var browserify = require('browserify');
var b = browserify();
b.add('../nodedump.js');
// b.bundle().pipe(process.stdout);
var stream = b.bundle();
var fl = fs.createWriteStream(file_name);
stream.on('close', function(){
	console.log('Finished building: ' + file_name);
	console.log('Building: ' + file_name_min + ' ...');
	var result = uglify.minify(fl.path);
	fs.writeFile(file_name_min, result.code, function(err){
		if(err) console.log('Error:', err);
		else console.log('Finished building: ' + file_name_min);
	});
});

stream.pipe(fl);

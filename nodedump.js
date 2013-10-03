/*
 * @description nodedump - Outputs variables in a visual, easy to read format based on ColdFusion's CFDUMP tag
 * @author Andrew Hewitt <ragamufin@gmail.com>
 * 
 */

/*
* 
* REQUIRES
*/
var util = require('util');
var hljs = require('./lib/highlight.js/highlight');

/*
 * CONSTANTS
 */

// Default options
var DEFAULTOPTS = {
	expand: true
	,label:null
	,show:null
	,hide:null
	,top:null
	,levels: null
	,sortKeys: true
	,syntaxHighlight:true
	,dumpFunctionName: 'nodedump'
};

// used to figure out the datatype of a variable
var toClass = {}.toString;

// list of simple types
var SIMPLETYPES = ['String','Number','Boolean','Undefined','Null','Date','Math'];

// output related constants
var TABLE = '<table class="nodedump nodedump-%s"><tbody>%s</tbody></table>';
var ROWHEADER = '<tr><th colspan="2" class="nodedump-label nodedump-%s"%s onclick="nodedump.toggleTable(this);">%s</th></tr>';
var ROW = '<tr%s><td class="nodedump-label nodedump-%s"%s onclick="nodedump.toggleRow(this);">%s</td><td class="nodedump-data"%s>%s</td></tr>';
var ROWHEADER1COL = '<tr><th class="nodedump-label nodedump-%s"%s onclick="nodedump.toggleTable(this);">%s</th></tr>';
var ROW1COL = '<tr%s><td class="nodedump-data">%s</td></tr>';
var EMPTY = ' [empty]';
var ROWHEADEREMPTY = '<tr><th class="nodedump-%s">%s%s</th></tr>';
var ROWEMPTY = '<tr><td class="nodedump-%s">%s%s</td></tr>';
var ERRORDATATYPE = 'Error-thrown';
var TITLEEXPANDED = '';
var TITLECOLLAPSED = '';
var TITLEFILTERED = ' [Filtered - %s]';
var TITLEFILTEREDSHOWN = '%d of %d items shown';
var TITLEFILTEREDHIDDEN = '%d of %d items hidden';
var TITLEFILTEREDTOP = 'Top %d of %d items shown';
var TITLEFILTEREDLEVELS = '%d levels shown';
var EXPANDEDLABELSTYLE = ' title="' +  TITLEEXPANDED + '"';
var COLLAPSEDLABELSTYLE = ' style="font-style: italic;" title="' + TITLECOLLAPSED + '"';
var COLLAPSEDSTYLE = ' style="display:none"';
var CIRCULARREFERENCE = 'Circular-Reference';
var CIRCULARSPLITSTRING = ' &raquo; ';
var CIRCULARTOPSTRINGLIMIT = 12;
var TOP = '[TOP]';
var SYNTAXHIGHLIGHTCSS = '<style type="text/css">\n'
+'/* Google Code style (c) Aahan Krish <geekpanth3r@gmail.com>*/\n'
+'td.nodedump-data pre code{display:block;padding:.5em;background:#fff;color:#000}td.nodedump-data pre .comment,td.nodedump-data pre .template_comment,td.nodedump-data pre .javadoc,td.nodedump-data pre .comment *{color:#800}td.nodedump-data pre .keyword,td.nodedump-data pre .method,td.nodedump-data pre .list .title,td.nodedump-data pre .clojure .built_in,td.nodedump-data pre .nginx .title,td.nodedump-data pre .tag .title,td.nodedump-data pre .setting .value,td.nodedump-data pre .winutils,td.nodedump-data pre .tex .command,td.nodedump-data pre .http .title,td.nodedump-data pre .request,td.nodedump-data pre .status{color:#008}td.nodedump-data pre .envvar,td.nodedump-data pre .tex .special{color:#660}td.nodedump-data pre .string,td.nodedump-data pre .tag .value,td.nodedump-data pre .cdata,td.nodedump-data pre .filter .argument,td.nodedump-data pre .attr_selector,td.nodedump-data pre .apache .cbracket,td.nodedump-data pre .date,td.nodedump-data pre .regexp{color:#080}td.nodedump-data pre .sub .identifier,td.nodedump-data pre .pi,td.nodedump-data pre .tag,td.nodedump-data pre .tag .keyword,td.nodedump-data pre .decorator,td.nodedump-data pre .ini .title,td.nodedump-data pre .shebang,td.nodedump-data pre .prompt,td.nodedump-data pre .hexcolor,td.nodedump-data pre .rules .value,td.nodedump-data pre .css .value .number,td.nodedump-data pre .literal,td.nodedump-data pre .symbol,td.nodedump-data pre .ruby .symbol .string,td.nodedump-data pre .number,td.nodedump-data pre .css .function,td.nodedump-data pre .clojure .attribute{color:#066}td.nodedump-data pre .class .title,td.nodedump-data pre .haskell .type,td.nodedump-data pre .smalltalk .class,td.nodedump-data pre .javadoctag,td.nodedump-data pre .yardoctag,td.nodedump-data pre .phpdoc,td.nodedump-data pre .typename,td.nodedump-data pre .tag .attribute,td.nodedump-data pre .doctype,td.nodedump-data pre .class .id,td.nodedump-data pre .built_in,td.nodedump-data pre .setting,td.nodedump-data pre .params,td.nodedump-data pre .variable,td.nodedump-data pre .clojure .title{color:#606}td.nodedump-data pre .css .tag,td.nodedump-data pre .rules .property,td.nodedump-data pre .pseudo,td.nodedump-data pre .subst{color:#000}td.nodedump-data pre .css .class,td.nodedump-data pre .css .id{color:#9B703F}td.nodedump-data pre .value .important{color:#f70;font-weight:700}td.nodedump-data pre .rules .keyword{color:#C5AF75}td.nodedump-data pre .annotation,td.nodedump-data pre .apache .sqbracket,td.nodedump-data pre .nginx .built_in{color:#9B859D}td.nodedump-data pre .preprocessor,td.nodedump-data pre .preprocessor *{color:#444}td.nodedump-data pre .tex .formula{background-color:#EEE;font-style:italic}td.nodedump-data pre .diff .header,td.nodedump-data pre .chunk{color:gray;font-weight:700}td.nodedump-data pre .diff .change{background-color:#BCCFF9}td.nodedump-data pre .addition{background-color:#BAEEBA}td.nodedump-data pre .deletion{background-color:#FFC8BD}td.nodedump-data pre .comment .yardoctag{font-weight:700}'
+'</style>';
var CSS = '<style type="text/css">\n'
+'/* nodedump styles */\n'
+ 'table.nodedump, table.nodedump th, table.nodedump td { border-collapse: separate; border-spacing:2px; width: auto; line-height:normal; }\
table.nodedump {\
	font-size: x-small;\
	font-family: verdana, arial, helvetica, sans-serif;\
	border-spacing: 2px;\
	background-color: #dddddd;\
	color: #222222;\
}\
table.nodedump .nodedump-label { cursor:pointer; }\
table.nodedump { background-color: #707000; }\
table.nodedump th { text-align: left; color: white; padding: 5px; background-color: #ADAD00; }\
table.nodedump td { vertical-align : top; padding: 3px; background-color: #FFFF9E; }\
\n\
table.nodedump td.nodedump-data { background-color: #ffffff; }\
table.nodedump td.nodedump-data pre { line-height:normal; background-color: #ffffff; border:0; padding:0; }\n\
table.nodedump td.nodedump-data pre code { font-size: small; font-family: Consolas, Menlo, Monaco, Lucida Console, monospace, Courier New, monospace, serif; }\n\
\n\
table.nodedump-String { background-color: #888888; }\
table.nodedump-String td.nodedump-String { background-color: #dddddd; }\
table.nodedump-Number { background-color: #FF8833; }\
table.nodedump-Number td.nodedump-Number { background-color: #FFB885; }\
table.nodedump-Boolean { background-color : #eebb00; }\
table.nodedump-Boolean td.nodedump-Boolean { background-color: #FFDA75; }\
table.nodedump-Boolean td.nodedump-data span.nodedump-no { color: #aa0000; }\
table.nodedump-Boolean td.nodedump-data span.nodedump-yes { color: #008800; }\
table.nodedump-Date { background-color: #CE8D98; }\
table.nodedump-Date td.nodedump-Date { background-color: #ffcbd4; }\
table.nodedump-Math td.nodedump-data { color: white; font-weight: bold; background-color: #ADAD00; }\
table.nodedump-Null, table.nodedump-Undefined { background-color: #333333; }\
table.nodedump-Null td.nodedump-data, table.nodedump-Undefined td.nodedump-data { color:#ffffff; background-color: #333333; }\
\n\
table.nodedump-Object {	background-color: #0000cc; }\
table.nodedump-Object th.nodedump-Object { background-color: #4444cc; }\
table.nodedump-Object td.nodedump-Object { background-color: #ccddff; }\
\n\
table.nodedump-Array { background-color: #006600; }\
table.nodedump-Array th.nodedump-Array { background-color: #009900; }\
table.nodedump-Array td.nodedump-Array { background-color: #ccffcc; }\
table.nodedump-Function { background-color: #aa4400; }\
table.nodedump-Function th.nodedump-Function { background-color: #cc6600; }\
table.nodedump-RegExp { background-color: #884488; }\
table.nodedump-RegExp th.nodedump-RegExp { background-color: #aa66aa; }\
table.nodedump-RegExp td.nodedump-RegExp { background-color: #ffddff; }\
table.nodedump-Error { background-color: #CC3300; }\
table.nodedump-Error th.nodedump-Error { background-color: #CC3300; }\
table.nodedump-'+CIRCULARREFERENCE+', table.nodedump-'+ERRORDATATYPE+' { background-color: #333333; }\
table.nodedump-'+CIRCULARREFERENCE+' td.nodedump-'+CIRCULARREFERENCE+', table.nodedump-'+ERRORDATATYPE+' th.nodedump-'+ERRORDATATYPE+' { background-color: #333333; }\
table.nodedump-'+CIRCULARREFERENCE+' td.nodedump-label { color: #ffffff; }\n\
</style>';

var JS = "<script type=\"text/javascript\">\n\
	// based on CFDump's js\n\
	var nodedump;\n\
	nodedump = (function(){\n\
		var style;\n\
		return {\n\
			toggleRow: function(source){\n\
				var target = (document.all) ? source.parentElement.cells[1] : source.parentNode.lastChild;\n\
				this.toggleTarget(target,this.toggleSource(source));\n\
			} // end toggleRow\n\
\n\
			,toggleSource: function(source){\n\
				if (source.style.fontStyle=='italic') {\n\
					source.style.fontStyle='normal';\n\
					source.title='" + TITLEEXPANDED + "';\n\
					return 'open';\n\
				} else {\n\
					source.style.fontStyle='italic';\n\
					source.title='" + TITLECOLLAPSED + "';\n\
					return 'closed';\n\
				}\n\
			} // end toggleSource\n\
\n\
			,toggleTable: function(source){\n\
				var switchToState=this.toggleSource(source);\n\
				if(document.all) {\n\
					var table=source.parentElement.parentElement;\n\
					for(var i=1;i<table.rows.length;i++) {\n\
						target=table.rows[i];\n\
						this.toggleTarget(target,switchToState);\n\
					}\n\
				}\n\
				else {\n\
					var table=source.parentNode.parentNode;\n\
					for (var i=1;i<table.childNodes.length;i++) {\n\
						target=table.childNodes[i];\n\
						if(target.style) {\n\
							this.toggleTarget(target,switchToState);\n\
						}\n\
					}\n\
				}\n\
			} // end toggleTable\n\
\n\
			,toggleTarget: function(target,switchToState){\n\
				target.style.display = (switchToState=='open') ? '' : 'none';\n\
			} // end toggleTarget\n\
		};\n\
\n\
	})();\n\
</script>";

/*
 * FUNCTIONS
 */

/*
 * Creates tables
 *
 * @param {string} dataType
 * @param {string} data body for the table
 * @returns the output for the table
 */
function doTable(dataType, data){
    return util.format(TABLE, dataType, data);
}

/*
 * Checks if the current row is expanded or not
 * 
 * @param {object} options
 * @param {boolean} isSimpleTypeMember
 * @returns {isRowExpanded.options|Boolean}
 */
function isRowExpanded(options, isSimpleTypeMember){
	return (!isSimpleTypeMember || (options && options.expand == true));
}

/*
 * Builds the style tag for the headers of tables
 * 
 * @param {string} dataType
 * @param {object} options
 * @returns {String|EXPANDEDLABELSTYLE|COLLAPSEDLABELSTYLE}
 */
function doHeaderStyle(dataType, options){
	var style = EXPANDEDLABELSTYLE;
	if(options.expand==false || (typeof options.expand=='object' && options.expand.indexOf(dataType) < 0))
		style = COLLAPSEDLABELSTYLE;

	return style;
}

/*
 * Builds the style tag for a row
 * 
 * @param {string} dataType
 * @param {object} options
 * @param {boolean} isSimpleTypeMember
 * @returns {COLLAPSEDSTYLE|String}
 */
function doRowStyle(dataType, options, isSimpleTypeMember){
	return ((
			isRowExpanded(options, isSimpleTypeMember)
			|| (typeof options.expand=='object' && options.expand.indexOf(dataType) > -1)
			) ? '' : COLLAPSEDSTYLE
	);
}

/*
 * Builds the style tag for the label cell
 * 
 * @param {string} options
 * @param {boolean} isSimpleTypeMember
 * @returns {String|COLLAPSEDLABELSTYLE|EXPANDEDLABELSTYLE}
 */
function doCellLabelStyle(options, isSimpleTypeMember){
	return isRowExpanded(options, isSimpleTypeMember) ? EXPANDEDLABELSTYLE : COLLAPSEDLABELSTYLE;
}

/*
 * Builds the style tag for the data cell
 * 
 * @param {object} options
 * @param {boolean} isSimpleTypeMember
 * @returns {String|COLLAPSEDSTYLE}
 */
function doCellStyle(options, isSimpleTypeMember){
	return isRowExpanded(options, isSimpleTypeMember) ? '' : COLLAPSEDSTYLE;
}

/*
 * Builds the header row of a table
 * 
 * @param {string} dataType
 * @param {string} data
 * @param {object} options
 * @returns {string}
 */
function doRowHeader(dataType, data, options){
	return util.format(ROWHEADER, dataType, doHeaderStyle(dataType, options), data);
}

/*
 * Builds a regular two column row
 * 
 * @param {string} dataType
 * @param {string} key
 * @param {string} data
 * @param {object} options
 * @param {boolean} isSimpleTypeMember
 * @returns {string}
 */
function doRow(dataType, key, data, options, isSimpleTypeMember){
    return util.format(
		ROW
		, doRowStyle(dataType, options, isSimpleTypeMember)
		, dataType
		, doCellLabelStyle(options, isSimpleTypeMember)
		, key
		, doCellStyle(options, isSimpleTypeMember)
		, data
	);
}

/*
 * Builds the header row for a 1 column table
 * 
 * @param {string} dataType
 * @param {string} data
 * @param {object} options
 * @returns {string}
 */
function doRowHeader1Col(dataType, data, options){
    return util.format(ROWHEADER1COL, dataType, doHeaderStyle(dataType, options), data);
}

/*
 * Builds the 1 column row
 * @param {string} dataType
 * @param {string} data
 * @param {object} options
 * @param {boolean} isSimpleTypeMember
 * @returns {string}
 */
function doRow1Col(dataType, data, options, isSimpleTypeMember){
    return util.format(ROW1COL, doRowStyle(dataType, options, isSimpleTypeMember), data);
}

/*
 * Builds the empty row
 * 
 * @param {string} dataType
 * @param {string} data
 * @returns {string}
 */
function doRowEmpty(dataType, data){
    return util.format(ROWEMPTY, dataType, data, EMPTY);
}

/*
 * Builds the header row for empty vars
 * 
 * @param {string} dataType
 * @param {string} data
 * @returns {string}
 */
function doRowHeaderEmpty(dataType, data){
    return util.format(ROWHEADEREMPTY, dataType, data, EMPTY);
}

/*
 * Outputs the initial markup necessary
 * @param {object} options
 * @returns {CSS|JS|SYNTAXHIGHLIGHTCSS|String}
 */
function doInitialOutput(options){
    return (options.syntaxHighlight? SYNTAXHIGHLIGHTCSS : '') + CSS + JS;
}

/*
 * Encodes HTML strings so they are displayed as such
 * 
 * @param {string} html
 * @returns {string}
 */
function escapeHtml(html){
    return String(html)
			.replace(/&(?!\w+;)/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
};

/*
 * Figures out the datatype of a variable
 * @param {any} obj
 * @returns {string|getDataType.dataType}
 */
function getDataType(obj){
	var dataType = toClass.call( obj );
	//console.log('dataType:',dataType);
	dataType = dataType.split(' ')[1];
	dataType = dataType.substring(0, dataType.length-1);

	return dataType;
}

/*
 * Clones variables to avoid pass by reference issues
 * 
 * @param {any} orig
 * @param {optional|string} dataType
 * @returns {clone.newArray|Array|clone.orig}
 */
function clone(orig, dataType){
	if(!dataType)
		dataType = getDataType(orig);

	if(dataType == 'Array'){
		var newArray = [];
		for(var i = 0; i < orig.length; i++)
			newArray.push(orig[i]);

		return newArray;

	} else if(dataType == 'Object') {
		var newObject = {};
		for(var key in orig)
			newObject[key] = clone(orig[key]);

		return newObject;

	} else
		return orig;
}

/*
 * Returns a path to the original variable if the current one is a circular reference
 * 
 * @param {any} obj
 * @param {object} cache
 * @param {array} currentPath
 * @returns {Array}
 */
function getPathToCircularRef(obj, cache, currentPath){
	var circPath = [];
	if(typeof obj != 'object')
		return circPath;

	if(!cache.objects){
		cache.objects = [];
		cache.paths = [];
	}
	var pos = cache.objects.indexOf(obj);
	if(pos >= 0)
		circPath = cache.paths[pos];

	cache.objects.push(obj);
	cache.paths.push(currentPath);

	return circPath;
}

/*
 * Does all the dirty laundry of capturing variable output, recursively
 * 
 * @param {any} obj
 * @param {objects} cache
 * @param {array} currentPath
 * @param {objects} options
 * @returns {string}
 */
function dumpObject(obj, cache, currentPath, options){
    //console.log('Dumping');
	//console.log(obj);
	// do this on the first call
	var data = '';
	var dataType = getDataType(obj);
	var isSimpleType = (SIMPLETYPES.indexOf(dataType) >= 0);
	var bFirstCall = (currentPath.length == 0);
	var label = dataType;
	if(bFirstCall){
		var topPath = TOP;
		cache.bFilteredLevel = false;
		if(options.label){
			label = options.label + ' - ' + label;
			/*topPath += ' ' + options.label;
			if(topPath.length > CIRCULARTOPSTRINGLIMIT)
				topPath = topPath.substr(0, CIRCULARTOPSTRINGLIMIT) + '...';
			topPath += ' - ' + dataType;*/
		}
		currentPath = [topPath];
	}

	//console.log('dataType2:',dataType);
	var bEmpty = false;
	var bHeader = !isSimpleType;

	if(isSimpleType){ // Simple types

		switch(dataType){
			case 'Boolean':
				var val = '<span class="'+(obj ? 'nodedump-yes' : 'nodedump-no')+'">' + obj + '</span>';
				data = doRow(dataType, label, val, options);
			break;
			case 'String':
				if(obj.length === 0)
					bEmpty = true;
				else {
					var val = escapeHtml(obj);
					//var val = '<pre><code class="lang-html">' + hljs.highlight('xml', obj).value + '</code></pre>';
					data = doRow(dataType, label, val, options);
				}
			break;
			case 'Math':
			case 'Undefined':
			case 'Null':
				data = doRow1Col(dataType, label, options, false);
			break;
			default:
				data = doRow(dataType, label, obj.toString(), options);
			break;
		}

	} else { // Non-Object types

		switch(dataType){
			case 'RegExp':
			case 'Error':
				data += doRowHeader1Col(dataType, label, options);
				data += doRow1Col(dataType, obj.toString(), options, true);
			break;
			case 'Function':
				bHeader = true;
				data += doRowHeader1Col(dataType, label, options);
				var txt = obj.toString();
				if(options.syntaxHighlight){
					var purtyText = hljs.highlight('javascript', txt);
					//var purtyText = hljs.highlightAuto(txt);
					txt = purtyText.value;
				} else {
					var txt = escapeHtml(obj.toString());
				}

				data += doRow1Col(dataType, '<pre><code class="lang-javascript">'+txt+'</code></pre>', options, true);
				//data += doRow1Col(dataType, '<pre><code>'+escapeHtml(obj.toString())+'</code></pre>', options, true);
			break;
			case 'Array':
			case 'Object':
			default:
				// check for circular references
				var circPath = getPathToCircularRef(obj, cache, currentPath);
				if(circPath.length > 0){
					//console.log('circular reference found', currentPath);
					dataType = CIRCULARREFERENCE;
					data = doRow(dataType, dataType, circPath.join(CIRCULARSPLITSTRING), options);
				} else {
					var subPath;
					var loopObj;
					if(dataType === 'Array')
						loopObj = obj;
					else {
						loopObj = [];
						for(var key in obj)
							loopObj.push(key);
						if(options.sortKeys){
							loopObj.sort(function (a, b) {
								return a.toLowerCase().localeCompare(b.toLowerCase());
							});
						}
					}

					cache.level++;
					var filtered = [];
					var bFilteredTop = false;
					var numTotalKeys = loopObj.length;
					var key, val;
					var numKeysShown = 0;
					var numKeysHidden = 0;
					var errThrown;
					for (var i = 0; i < loopObj.length; i++) {
						errThrown = '';
						try{
							if(dataType === 'Array'){
								key = i;
								val = loopObj[i];
							} else {
								key = loopObj[i];
								val = obj[key];
							}
						} catch(err){
							errThrown = err.toString();
						}
						if(bFirstCall){
							if(!(!options.show || (options.show.length && options.show.indexOf(key) >= 0))){
								numKeysHidden++;
								continue;
							} else if(options.hide && options.hide.length && options.hide.indexOf(key) >= 0){
								numKeysHidden++;
								continue;
							}
							if(options.top > 0 && numKeysShown === options.top){
								bFilteredTop = true;
								break;
							}
						}

						numKeysShown++;
						if(options.levels !== null && currentPath.length > options.levels){
							cache.bFilteredLevel = true;
							data += doRow(dataType, key, '', options, true);
							continue;
						}
						
						if(errThrown.length > 0){
							var errorRow = doRowHeader1Col(ERRORDATATYPE, ERRORDATATYPE, options)
											+ doRow1Col(ERRORDATATYPE, '<pre><code class="lang-javascript">'+hljs.highlight('javascript', errThrown).value+'</code></pre>', options, true);
											//+ doRow1Col(ERRORDATATYPE, errThrown, options, true);
							data += doRow(dataType, key, doTable(ERRORDATATYPE, errorRow), options, false);
							continue;
						}
						subPath = clone(currentPath, 'Array');
						subPath.push(key);
						data += doRow(dataType, key, dumpObject(val, cache, subPath, options), options, true);
					}
					
					if(numTotalKeys === 0)
						bEmpty = true;
					else {
						if(bFirstCall){
							if(numKeysShown !== numTotalKeys){
								if(options.show){
									filtered.push(util.format(TITLEFILTEREDSHOWN, numKeysShown, numTotalKeys));
								} else if(options.hide){
									filtered.push(util.format(TITLEFILTEREDHIDDEN, numKeysHidden, numTotalKeys));
									numTotalKeys = numTotalKeys - numKeysHidden;
								}
								if(!options.show && bFilteredTop)
									filtered.push(util.format(TITLEFILTEREDTOP, numKeysShown, numTotalKeys));
							}
							if(cache.bFilteredLevel)
								filtered.push(util.format(TITLEFILTEREDLEVELS, options.levels));

							if(filtered.length > 0)
								label += util.format(TITLEFILTERED, filtered.join(', '));
						}
						data = doRowHeader(dataType, label, options) + data;
					}
				}
			break;
		}

	}

    if(bEmpty)
            data = bHeader ? doRowHeaderEmpty(dataType, label) : doRowEmpty(dataType, label);

    return doTable(dataType, data);
}

/*
 * Function called to start the dump of a variable
 * 
 * @param {object} obj
 * @param {object} currentOptions
 * @returns {JS|CSS|SYNTAXHIGHLIGHTCSS|String}
 */
function dump(obj, currentOptions){
	var options = clone(DEFAULTOPTS);
	for(var opt in currentOptions){
		options[opt] = currentOptions[opt];
	}

    return doInitialOutput(options) + dumpObject(obj, {}, [], options);
}
/*
 * Optional initialization of nodedump
 * 
 * @param {object} options
 * @returns {this}
 */
function init(options){
	for(var opt in options){
		DEFAULTOPTS[opt] = options[opt];
	}

	setDumpFunctionName();

	return this;
}

/*
 * Sets the name of the global function that can be used to nodedump vars
 * 
 * @param {string} fnName
  */
function setDumpFunctionName(fnName){
	if(fnName)
		DEFAULTOPTS.dumpFunctionName = fnName;

	global[DEFAULTOPTS.dumpFunctionName] = dump;
}

setDumpFunctionName(); // set the name of the global nodedump function to the default
// exports
exports.dump = dump;
exports.init = init;

﻿




/*********************************************
 XMLLib.jsx
 */
/************************************************************************************************************
General XML Functions
    **/

function getXMLObject(property, value) {
	var xml = "<object>";
	xml += convertToXML(value, property);
	xml += "</object>"
	return xml;
}


function getClassName (object) { 
   var funcNameRegex = /function (.{1,})\(/;
   var results = (funcNameRegex).exec((object).constructor.toString());
   return (results && results.length > 1) ? results[1] : "";
}


function convertObjectToXMLValue(property) {
	xml="";
	var className=getClassName(property);
	
	switch(className){
		case "Date":
			xml += "<date>";
			xml += property.toString();
			xml += "</date>";
			break;
		default:
			alert("XMLLib.jsxinc: convertObjectToXML: Object class " + className + " is unknown.");
			return "";
	}
	return xml;
}

function convertToXMLValue(property) {
	var xml="";
	var type = typeof property;
	switch(type){
		case "number":
			xml += "<number>";
			xml += property.toString();
			xml += "</number>";
			break;
		case "boolean":
			xml += "<" + property.toString() + "/>";
			break;
		case "string":
			xml += "<string>";
			xml += property.toString();
			xml += "</string>";
			break;
		case "object":
			xml += convertObjectToXMLValue(property);
			break;
		case "undefined":
			xml += "<string>undefined</string>";
			break;
		default:
			alert("Type " + type + " is unknown.");
			return "";
	}
	return xml;
}

/**
	John Huan Vu
	In order to communicate to the SWF file, it must be written as an XML
		containing the property and identifier. This utility is very helpful for
		a two-way communication between the JSX and SWF.
	@param {String} property The property or value for the identifier
	@param {String} identifier The unique identifier for the property
	@returns An xml containing the property and identifier
	@type String
*/
function convertToXML(property, identifier){
	var xml = '<property id="' + identifier + '">';
	xml+=convertToXMLValue(property);

	xml += '</property>';
	return xml;
}
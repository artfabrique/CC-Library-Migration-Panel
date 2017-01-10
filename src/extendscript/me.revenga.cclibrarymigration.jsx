//  json2.js
//  2016-05-01
//  Public Domain.
//  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
//  See http://www.JSON.org/js.html
//  This code should be minified before deployment.
//  See http://javascript.crockford.com/jsmin.html

//  USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
//  NOT CONTROL.

//  This file creates a global JSON object containing two methods: stringify
//  and parse. This file is provides the ES5 JSON capability to ES3 systems.
//  If a project might run on IE8 or earlier, then this file should be included.
//  This file does nothing on ES5 systems.

//      JSON.stringify(value, replacer, space)
//          value       any JavaScript value, usually an object or array.
//          replacer    an optional parameter that determines how object
//                      values are stringified for objects. It can be a
//                      function or an array of strings.
//          space       an optional parameter that specifies the indentation
//                      of nested structures. If it is omitted, the text will
//                      be packed without extra whitespace. If it is a number,
//                      it will specify the number of spaces to indent at each
//                      level. If it is a string (such as "\t" or "&nbsp;"),
//                      it contains the characters used to indent at each level.
//          This method produces a JSON text from a JavaScript value.
//          When an object value is found, if the object contains a toJSON
//          method, its toJSON method will be called and the result will be
//          stringified. A toJSON method does not serialize: it returns the
//          value represented by the name/value pair that should be serialized,
//          or undefined if nothing should be serialized. The toJSON method
//          will be passed the key associated with the value, and this will be
//          bound to the value.

//          For example, this would serialize Dates as ISO strings.

//              Date.prototype.toJSON = function (key) {
//                  function f(n) {
//                      // Format integers to have at least two digits.
//                      return (n < 10)
//                          ? "0" + n
//                          : n;
//                  }
//                  return this.getUTCFullYear()   + "-" +
//                       f(this.getUTCMonth() + 1) + "-" +
//                       f(this.getUTCDate())      + "T" +
//                       f(this.getUTCHours())     + ":" +
//                       f(this.getUTCMinutes())   + ":" +
//                       f(this.getUTCSeconds())   + "Z";
//              };

//          You can provide an optional replacer method. It will be passed the
//          key and value of each member, with this bound to the containing
//          object. The value that is returned from your method will be
//          serialized. If your method returns undefined, then the member will
//          be excluded from the serialization.

//          If the replacer parameter is an array of strings, then it will be
//          used to select the members to be serialized. It filters the results
//          such that only members with keys listed in the replacer array are
//          stringified.

//          Values that do not have JSON representations, such as undefined or
//          functions, will not be serialized. Such values in objects will be
//          dropped; in arrays they will be replaced with null. You can use
//          a replacer function to replace those with JSON values.

//          JSON.stringify(undefined) returns undefined.

//          The optional space parameter produces a stringification of the
//          value that is filled with line breaks and indentation to make it
//          easier to read.

//          If the space parameter is a non-empty string, then that string will
//          be used for indentation. If the space parameter is a number, then
//          the indentation will be that many spaces.

//          Example:

//          text = JSON.stringify(["e", {pluribus: "unum"}]);
//          // text is '["e",{"pluribus":"unum"}]'

//          text = JSON.stringify(["e", {pluribus: "unum"}], null, "\t");
//          // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

//          text = JSON.stringify([new Date()], function (key, value) {
//              return this[key] instanceof Date
//                  ? "Date(" + this[key] + ")"
//                  : value;
//          });
//          // text is '["Date(---current time---)"]'

//      JSON.parse(text, reviver)
//          This method parses a JSON text to produce an object or array.
//          It can throw a SyntaxError exception.

//          The optional reviver parameter is a function that can filter and
//          transform the results. It receives each of the keys and values,
//          and its return value is used instead of the original value.
//          If it returns what it received, then the structure is not modified.
//          If it returns undefined then the member is deleted.

//          Example:

//          // Parse the text. Values that look like ISO date strings will
//          // be converted to Date objects.

//          myData = JSON.parse(text, function (key, value) {
//              var a;
//              if (typeof value === "string") {
//                  a =
//   /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
//                  if (a) {
//                      return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
//                          +a[5], +a[6]));
//                  }
//              }
//              return value;
//          });

//          myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
//              var d;
//              if (typeof value === "string" &&
//                      value.slice(0, 5) === "Date(" &&
//                      value.slice(-1) === ")") {
//                  d = new Date(value.slice(5, -1));
//                  if (d) {
//                      return d;
//                  }
//              }
//              return value;
//          });

//  This is a reference implementation. You are free to copy, modify, or
//  redistribute.

/*jslint
    eval, for, this
*/

/*property
    JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== "object") {
    JSON = {};
}

(function () {
    "use strict";

    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10
            ? "0" + n
            : n;
    }

    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== "function") {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + "-" +
                        f(this.getUTCMonth() + 1) + "-" +
                        f(this.getUTCDate()) + "T" +
                        f(this.getUTCHours()) + ":" +
                        f(this.getUTCMinutes()) + ":" +
                        f(this.getUTCSeconds()) + "Z"
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap;
    var indent;
    var meta;
    var rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string)
            ? "\"" + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === "string"
                    ? c
                    : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
            }) + "\""
            : "\"" + string + "\"";
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i;          // The loop counter.
        var k;          // The member key.
        var v;          // The member value.
        var length;
        var mind = gap;
        var partial;
        var value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === "object" &&
                typeof value.toJSON === "function") {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case "string":
            return quote(value);

        case "number":

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value)
                ? String(value)
                : "null";

        case "boolean":
        case "null":

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce "null". The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is "object", we might be dealing with an object or an array or
// null.

        case "object":

// Due to a specification blunder in ECMAScript, typeof null is "object",
// so watch out for that case.

            if (!value) {
                return "null";
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === "[object Array]") {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || "null";
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? "[]"
                    : gap
                        ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]"
                        : "[" + partial.join(",") + "]";
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === "object") {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === "string") {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? "{}"
                : gap
                    ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                    : "{" + partial.join(",") + "}";
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== "function") {
        meta = {    // table of character substitutions
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = "";
            indent = "";

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === "string") {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== "function" &&
                    (typeof replacer !== "object" ||
                    typeof replacer.length !== "number")) {
                throw new Error("JSON.stringify");
            }

// Make a fake root object containing our value under the key of "".
// Return the result of stringifying the value.

            return str("", {"": value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== "function") {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k;
                var v;
                var value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return "\\u" +
                            ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with "()" and "new"
// because they can cause invocation, and "=" because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
// replace all simple value tokens with "]" characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or "]" or
// "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

            if (
                rx_one.test(
                    text
                        .replace(rx_two, "@")
                        .replace(rx_three, "]")
                        .replace(rx_four, "")
                )
            ) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The "{" operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval("(" + text + ")");

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return (typeof reviver === "function")
                    ? walk({"": j}, "")
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError("JSON.parse");
        };
    }
}());

//Shims from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference
Array.prototype.indexOf = function (searchElement, fromIndex) {
    'use strict';
    var k;
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }

    var O = Object(this);

    var len = O.length >>> 0;

    // 4. If len is 0, return -1.
    if (len === 0) {
      return -1;
    }


    var n = +fromIndex || 0;

    if (Math.abs(n) === Infinity) {
      n = 0;
    }

    if (n >= len) {
      return -1;
    }


    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    // 9. Repeat, while k < len
    while (k < len) {
      var kValue;

      if (k in O && O[k] === searchElement) {
        return k;
      }
      k++;
    }
    return -1;
  };


Array.isArray = function (arg) {
    'use strict';
    return Object.prototype.toString.call(arg) === '[object Array]';
};

Array.prototype.filter = function (fun /*, thisArg */ ) {
    "use strict";

    if (this === void 0 || this === null)
        throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
        throw new TypeError();

    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
        if (i in t) {
            var val = t[i];
            if (fun.call(thisArg, val, i, t))
                res.push(val);
        }
    }

    return res;
};


Array.prototype.map = function (callback, thisArg) {
    'use strict';
    var T, A, k;

    if (this == null) {
        throw new TypeError(" this is null or not defined");
    }

    var O = Object(this);
    var len = O.length >>> 0;
    if (typeof callback !== "function") {
        throw new TypeError(callback + " is not a function");
    }
    if (arguments.length > 1) {
        T = thisArg;
    }
    A = new Array(len);
    k = 0;
    while (k < len) {
        var kValue, mappedValue;
        if (k in O) {
            kValue = O[k];
            mappedValue = callback.call(T, kValue, k, O);
            A[k] = mappedValue;
        }

        k++;
    }

    return A;
};
/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2013 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50, sloppy: true*/
/*global $, Folder, app, SaveOptions, File, JSXGlobals, BridgeTalk*/

$._ADBE_LIBS_CORE = {
    //Evaluate a file and catch the exception.
    evalFile: function (path) {
        try {
            $.evalFile(path);
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('core.jsx-evalFile()', ex);
        }
    },
    // Evaluate all the files in the given folder
    evalFiles: function (jsxFolderPath) {
        try {
            var folder = new Folder(jsxFolderPath);
            if (folder.exists) {
                var jsxFiles = folder.getFiles("*.jsx");
                var i, jsxFile;
                for (i = 0; i < jsxFiles.length; i++) {
                    jsxFile = jsxFiles[i];
                    $.evalFile(jsxFile);
                }
            }
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('core.jsx-evalFiles()', ex);
        }
    },
    findFont: function (allFonts, fontName, fontStyle) {
        try {
            if (fontStyle === "normal") {
                fontStyle = "Regular";
            }
            var i;
            for (i = 0; i < allFonts.length; i++) {
                //We must test against the name of the font and not the family since the family might differ from the name we are storing
                //this is especially true with international fonts. Some fonts are stored with their name concatentated with the style so we
                //test an exact match of the name and also the name concatenated with the style just in case.
                if ((allFonts[i].name === fontName && allFonts[i].style.toLowerCase() === fontStyle.toLowerCase()) ||
                        allFonts[i].name === fontName + ' ' + fontStyle) {
                    return allFonts[i];
                }
            }
            return undefined;
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('core.jsx-findFont()', ex);
        }
    },
    showError: function (msg) {
        msg = typeof msg === 'string' ? msg : msg.join('\n');
        alert(msg);
    },
    cleanupUnits: function (value) {
        var values = value.split(" ");
        if (values.length > 1) {
            return values[0];
        }
        return value;
    },
    cleanupFileName: function (value) {
        if (value.indexOf('.') > 0) {
            value = value.substr(0, value.lastIndexOf('.') - 1);
        }
        return value;
    },
    unitToPixels: function (value, resolution) {
        if (value.indexOf("px") > 0) {
            return value;
        }
        if (value.indexOf("in") > 0) {
            return $._ADBE_LIBS_CORE.inToPixels(value);
        }
        if (value.indexOf("cm") > 0) {
            return $._ADBE_LIBS_CORE.cmToPixels(value);
        }
        if (value.indexOf("mm") > 0) {
            return $._ADBE_LIBS_CORE.mmToPixels(value, resolution);
        }
        if (value.indexOf("pt") > 0) {
            return $._ADBE_LIBS_CORE.pointsToPixels(value, resolution);
        }
        if (value.indexOf("pc") > 0) {
            return $._ADBE_LIBS_CORE.picasToPixels(value);
        }
        if (value.indexOf("%") > 0) {
            return $._ADBE_LIBS_CORE.picasToPixels(value);
        }
    },
    //http://www.translatorscafe.com/cafe/EN/units-converter/typography/c/
    picasToPixels: function (picas) {
        return Math.round(picas * 16);
    },
    cmToPixels: function (cms) {
        return Math.round(cms * 37.79527559055);
    },
    inToPixels: function (inches) {
        return Math.round(inches * 96.0000000000011);
    },
    mmToPixels: function (mm, resolution) {
        var pt = mm * 2.83464566929134;
        return $._ADBE_LIBS_CORE.pointsToPixels(pt, resolution);
    },
    pointsToPixels: function (pt, resolution) {
        return Math.round((pt / 72) * resolution);
    },
    pixelsToPoints: function (px, resolution) {
        return (px * 72) / resolution;
    },
    getTempFolder: function () {
        return Folder.temp.fsName;
    },
    getDocument: function (docName) {
        try {
            var i;
            for (i = 0; i < app.documents.length; i++) {
                if (app.documents[i].name === docName) {
                    return app.documents[i];
                }
            }
            return undefined;
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('core.jsx-getDocument()', ex);
        }
    },
    closeDocument: function (docName) {
        try {
            var i;
            for (i = 0; i < app.documents.length; i++) {
                if (app.documents[i].name === docName) {
                    app.documents[i].close(SaveOptions.DONOTSAVECHANGES);
                }
            }
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('core.jsx-closeDocument()', ex);
        }
    },
    isDocumentOpen: function (docName) {
        try {
            if ($.os.indexOf('Windows') > -1) {
                docName = docName.split('/').join('\\');
            }
            var i;
            for (i = 0; i < app.documents.length; i++) {
                try {
                    if (app.documents[i].fullName.fsName === docName) {
                        return 'true';
                    }
                } catch (ignore) {
                    // do nothing; just enables us to skip and move past unsaved docs
                }
            }
            return 'false';
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('core.jsx-isDocumentOpen()', ex);
        }
    },
    saveDocumentWithName: function (docName) {
        try {
            var i;
            for (i = 0; i < app.documents.length; i++) {
                if (app.documents[i].name === docName) {
                    app.documents[i].save();
                    return;
                }
            }
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('core.jsx-saveDocumentWithName()', ex);
        }
    },
    rgbColorToHex: function (color) {
        return $._ADBE_LIBS_CORE.intToHex(color.red) + $._ADBE_LIBS_CORE.intToHex(color.green) + $._ADBE_LIBS_CORE.intToHex(color.blue);
    },
    intToHex: function (intVal) {
        var hex = intVal.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    },
    hexToR: function (h) {
        return parseInt(($._ADBE_LIBS_CORE.cutHex(h)).substring(0, 2), 16);
    },
    hexToG: function (h) {
        return parseInt(($._ADBE_LIBS_CORE.cutHex(h)).substring(2, 4), 16);
    },
    hexToB: function (h) {
        return parseInt(($._ADBE_LIBS_CORE.cutHex(h)).substring(4, 6), 16);
    },
    cutHex: function (h) {
        return (h.charAt(0) === "#") ? h.substring(1, 7) : h;
    },
    shortenString: function (str, withDots, length) {
        str = str.replace(/(<|>|:|"|\/|\\|\||\?|\*|[\x00-\x1F])|\(|\)|\{|\}|\,/g, '');

        length = length || 10;

        if (str.length > length) {
            str = str.substr(0, length - 1);
            if (withDots) {
                str = str + "...";
            }
        }

        return str;
    },
    setLogPath: function (path) {
        JSXGlobals.logFilePath = path;
    },
    writeToLog: function (source, msg) {
        if (JSXGlobals.logFilePath !== "") {
            var date = new Date();
            var logFile = new File(JSXGlobals.logFilePath);
            logFile.open("a");
            logFile.writeln(date.toString() + " : " + source + " - " + msg);
        }
    },
    pushUniqueValue: function (array, object, property) {
        if (!array) {
            array = [];
        }
        var itemB = object;
        if (property) {
            itemB = object[property];
        }

        var i, itemA;
        for (i = 0; i < array.length; i++) {
            itemA = array[i];

            if (property) {
                itemA = array[i][property];
            }
            if (itemA === itemB) {
                return;
            }
        }
        array.push(object);
    },
    getApplicationVersion: function () {
        return app.version;
    },
    chooseFolder: function () {
        var folder = Folder.desktop;
        var promptStr = "Choose a folder";
        var result = folder.selectDlg(promptStr);
        return result;
    },
    getHostAppPathViaBridgeTalk: function () {
        var path = "<No path acquired. BridgeTalk not available in host app?>";
        try {
            path = BridgeTalk.getAppPath(BridgeTalk.appSpecifier);
        } catch (ignore) {
        }
        return path;
    }
};

var JSXGlobals = {};
JSXGlobals.logFilePath = "";
JSXGlobals.colorModifiedByUser = "";

JSXGlobals.contentTypes = {};
JSXGlobals.contentTypes.rgb = "application/vnd.adobe.color.rgb+json";
JSXGlobals.contentTypes.hsb = "application/vnd.adobe.color.hsb+json";
JSXGlobals.contentTypes.cmyk = "application/vnd.adobe.color.cmyk+json";
JSXGlobals.contentTypes.lab = "application/vnd.adobe.color.lab+json";
JSXGlobals.contentTypes.gray = "application/vnd.adobe.color.gray+json";

JSXGlobals.textPreviewString = "Aa";
JSXGlobals.textPreviewFontSize = 32;

JSXGlobals.previewMaxWidth = 248;
JSXGlobals.previewMaxHeight = 188;
JSXGlobals.maxNameLength = 248; // 256 - buffer for extensions

// Color types used to generate Tooltips
JSXGlobals.FILL = 'FILL';
JSXGlobals.STROKE = 'STROKE';

// Photoshop specific color types
JSXGlobals.PS_FOREGROUND = 'PS_FOREGROUND';
JSXGlobals.PS_TEXT = 'PS_TEXT';
JSXGlobals.PS_EFFECT_FILL = 'PS_EFFECT_FILL';
JSXGlobals.PS_EFFECT_STROKE = 'PS_EFFECT_STROKE';

// Illustrator specific color types
JSXGlobals.AI_TEXT_FILL = 'AI_TEXT_FILL';
JSXGlobals.AI_TEXT_STROKE = 'AI_TEXT_STROKE';

// InDesign specific color types
JSXGlobals.ID_TEXT_FILL = 'ID_TEXT_FILL';
JSXGlobals.ID_TEXT_STROKE = 'ID_TEXT_STROKE';

// Required to load getLayerSVG.jsx properly
var runGetLayerSVGfromScript = true;

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50, sloppy: true, continue: true, unparam: true */
/*global $, Folder, app, DocumentFill, ActionDescriptor, ActionReference, DialogModes, File, UnitValue,
 TypeUnits, ActionList, SolidColor, executeAction, executeActionGet, PhotoshopSaveOptions, SaveOptions, PNGSaveOptions,
 LayerKind, DescValueType, cssToClip, svg, ColorModel, JSXGlobals, TEXT, COLOR, BRUSH, LAYERSTYLE, UTIL, PSClass, PSEnum, PSType,
 PSForm, PSUnit, PSString, PSKey, PSEvent, PurgeTarget, DocumentMode */

///////////////////////////////////////////////////////////////////////////////
// Object: Logger
// Usage: Log information to a text file
// Input: String to full path of file to create or append, if no file is given
//        then output file Logger.log is created on the users desktop
// Return: Logger object
// Example:
//
//   var a = new Logger();
//   a.print( 'hello' );
//   a.print( 'hello2\n\n\nHi\n' ) ;
//   a.remove();
//   a.log( Date() );
//   a.print( Date() );
//   a.display();
//
///////////////////////////////////////////////////////////////////////////////
function Logger( inFile ) {

    // member properties

    // the file we are currently logging to
    if ( undefined == inFile ) {
        this.file = new File( Folder.desktop + "/NineSlicer.log" );
    } else {
        this.file = new File( inFile );
    }

    // member methods

    // output to the ESTK console
    // note that it behaves a bit differently
    // when using the BridgeTalk section
    this.print = function( inMessage ) {
        if ( app.name == "ExtendScript Toolkit" ) {
            print (inMessage);
        } else {
            var btMessage = new BridgeTalk();
            btMessage.target = "estoolkit";
            btMessage.body = "print(" + inMessage.toSource() + ")";
            btMessage.send ();
        }
    };

    // write out a message to the log file
    this.log = function( inMessage ) {
        //console.log(inMessage);
        if ( this.file.exists ) {
            this.file.open( 'e' );
            this.file.seek( 0, 2 ); // end of file
        } else {
            this.file.open( 'w' );
        }
        this.file.write( inMessage );
        this.file.close();
    };

    // show the contents with the execute method
    this.display = function() {
        this.file.execute();
    };

    // remove the file
    this.remove = function() {
        this.file.remove();
    }
}

function LogIt( inMessage ) {
    try {
        var a = new Logger();
        var b = inMessage;
        a.log( b + "\n");

    }
    catch(e) {
        alert("LogIt catch : " + e + ":" + e.line);
    }
}


if(typeof($)=='undefined') {
    $ = {};
    LogIt("$ was not defined...");
}

$._ext = {
    //Evaluate a file and catch the exception.
    evalFile : function(path) {
        LogIt("Evaluating file:"+path);
        try {

            $.evalFile(path);
        } catch (e) {alert("Exception:" + e);}
    },
    // Evaluate all the files in the given folder
    evalFiles: function(jsxFolderPath) {
        var folder = new Folder(jsxFolderPath);
        if (folder.exists) {
            var jsxFiles = folder.getFiles("*.jsx");
            for (var i = 0; i < jsxFiles.length; i++) {
                var jsxFile = jsxFiles[i];
                $._ext.evalFile(jsxFile);
            }
        }
    }
};

var params = {};


var cTID = function (s) {
    if (app.charIDToTypeID) {
        return app.charIDToTypeID(s);
    }
};
var sTID = function (s) {
    if (app.stringIDToTypeID) {
        return app.stringIDToTypeID(s);
    }
};

var tTSID = function (tid) {
    if (app.typeIDToStringID) {
        return app.typeIDToStringID(tid);
    }
};



/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50, sloppy: true, continue: true */
/*global $, Folder, app, DocumentFill, ActionDescriptor, ActionReference, DialogModes, File,
         TypeUnits, ActionList, SolidColor, executeAction, executeActionGet, PhotoshopSaveOptions, SaveOptions, PNGSaveOptions, WarpStyle,
         AntiAlias, Direction, AutoKernType, UnderlineType, StrikeThruType, TextCase,
         LayerKind, cssToClip, svg, ColorModel, JSXGlobals, PSString, PSType, descriptorToColorData, cTID, sTID */
var PSClass = function () {
    return undefined;
};
var PSEnum = function () {
    return undefined;
};
var PSEvent = function () {
    return undefined;
};
var PSForm = function () {
    return undefined;
};
var PSKey = function () {
    return undefined;
};
var PSType = function () {
    return undefined;
};
var PSUnit = function () {
    return undefined;
};
var PSString = function () {
    return undefined;
};

PSClass.Document = cTID('Dcmn');
PSClass.Version = cTID('Vrsn');

PSClass.RGBColor = cTID('RGBC');
PSClass.CMYKColor = cTID('CMYC');
PSClass.HSBColor = cTID('HSBC');
PSClass.Grayscale = cTID('Grsc');
PSClass.LabColor = cTID('LbCl');

PSUnit.Angle = cTID('#Ang');

PSKey.Gray = cTID('Gry ');

PSKey.Red = cTID('Rd  ');
PSKey.Green = cTID('Grn ');
PSKey.Blue = cTID('Bl  ');

PSKey.Cyan = cTID('Cyn ');
PSKey.Magenta = cTID('Mgnt');
PSKey.Yellow = cTID('Ylw ');
PSKey.Black = cTID('Blck');

PSKey.Hue = cTID('H   ');
PSKey.Start = cTID('Strt');
PSKey.Brightness = cTID('Brgh');

PSKey.Luminance = cTID('Lmnc');
PSKey.A = cTID('A   ');
PSKey.B = cTID('B   ');

PSClass.Color = sTID('color'); // DEPRECATE: Use PSKey.Color
PSClass.ColorStop = cTID('Clrt');
PSClass.Gradient = cTID('Grdn');
PSClass.Layer = cTID('Lyr ');
PSClass.LayerEffects = cTID('Lefx');
PSClass.Point = sTID('point'); // 'Pnt '
PSClass.Property = sTID('property'); // 'Prpr'

PSClass.Application = cTID('capp');
PSClass.PaintbrushTool = cTID('PbTl');
PSKey.Append = cTID('Appe');
PSEvent.Select = cTID('slct'); // DEPRECATE: Use PSKey.Select

PSClass.TransparencyStop = cTID('TrnS');
PSEnum.CustomStops = cTID('CstS');
PSEnum.GradientFill = cTID('GrFl');
PSEnum.Linear = cTID('Lnr ');
PSEnum.Normal = cTID('Nrml');
PSEnum.Target = sTID('targetEnum'); // 'Trgt'
PSEnum.UserStop = cTID('UsrS');
PSEnum.QCSAverage = cTID('Qcsa');

PSEvent.Set = sTID('set'); // 'setd'
PSEvent.Place = cTID('Plc ');

PSKey.FrameFX = cTID('FrFX');
PSKey.Using = cTID('Usng');
PSEvent.Make = cTID('Mk  '); // 'make'
PSKey.Alignment = cTID('Algn');
PSKey.Angle = cTID('Angl');
PSKey.Color = sTID('color'); // 'Clr '
PSKey.Colors = cTID('Clrs');
PSKey.Dither = cTID('Dthr');
PSKey.Enabled = cTID('enab');
PSKey.FreeTransformCenterState = cTID('FTcs');
PSKey.Gradient = cTID('Grad');
PSKey.Horizontal = cTID('Hrzn');
PSKey.Interpolation = cTID('Intr');
PSKey.Location = cTID('Lctn');
PSKey.Merge = sTID('merge');
PSKey.Midpoint = cTID('Mdpn');
PSKey.Mode = cTID('Md  '); // 'mode'
PSKey.Name = sTID('name'); // 'Nm  '
PSKey.Offset = cTID('Ofst');
PSKey.Opacity = cTID('Opct');
PSKey.Reverse = cTID('Rvrs');
PSKey.Scale = cTID('Scl '); // 'scale'
PSKey.SolidFill = cTID('SoFi');
PSKey.To = sTID('to'); // 'T   '
PSKey.Transparency = cTID('Trns');
PSKey.Type = cTID('Type'); // 'type'
PSKey.Vertical = cTID('Vrtc');
PSKey.Text = sTID('textKey'); // 'Txt '

PSKey.Transform = sTID('transform');
PSKey.Xx = sTID('xx');
PSKey.Xy = sTID('xy');
PSKey.Yx = sTID('yx');
PSKey.Yy = sTID('yy');
PSKey.Tx = sTID('tx');
PSKey.Ty = sTID('ty');

PSString.Null = sTID('null'); // DEPRECATE: Use PSKey.Target
PSString.contentLayer = sTID('contentLayer');
PSString.fillEnabled = sTID('fillEnabled');
PSString.shapeStyle = sTID('shapeStyle');
PSString.solidColorLayer = sTID('solidColorLayer');
PSString.strokeStyle = sTID('strokeStyle');
PSString.strokeStyleVersion = sTID('strokeStyleVersion');
PSString.strokeEnabled = sTID('strokeEnabled');
PSString.strokeStyleContent = sTID('strokeStyleContent');

PSType.BlendMode = cTID('BlnM'); // 'blendMode'
PSType.ColorStopType = cTID('Clry');
PSType.FillContents = cTID('FlCn');
PSType.GradientForm = cTID('GrdF');
PSType.GradientType = cTID('GrdT');
PSType.Ordinal = sTID('ordinal'); // 'Ordn'
PSType.QuadCenterState = cTID('QCSt');

PSUnit.Angle = cTID('#Ang');
PSUnit.Percent = cTID('#Prc'); // 'percentUnit'
PSUnit.Pixels = cTID('#Pxl');
PSUnit.Points = sTID('pointsUnit'); // '#Pnt'
PSUnit.Millimeters = sTID('millimetersUnit'); // '#Mlm'

//Text Style Values
PSClass.TextStyleRange = sTID('textStyleRange'); // 'Txtt' // RENAME: PSKey.TextStyleRange
PSClass.TextStyle = sTID('textStyle'); // 'TxtS' // RENAME: PSKey.TextStyle
PSClass.TextLayer = sTID('textLayer'); // 'TxLr' // RENAME: PSKey.TextLayer
PSType.AntiAlias = cTID('Annt');
PSKey.Bounds = sTID('bounds');
PSKey.Char = sTID('char');
PSKey.CurrentToolOptions = sTID('currentToolOptions');
PSKey.FontCaps = sTID('fontCaps');
PSKey.AltLigature = sTID('altligature');
PSKey.Flow = sTID('flow');
PSKey.FontName = cTID('FntN');
PSKey.FontStyleName = cTID('FntS');
PSKey.Fractions = sTID('fractions');
PSKey.Leading = sTID('leading'); // 'Ldng'
PSKey.Ligature = sTID('ligature');
PSKey.ImpliedLeading = sTID('impliedLeading');
PSKey.NoBreak = sTID('noBreak');
PSKey.OldStyle = sTID('oldStyle');
PSKey.Ordinals = sTID('ordinals');
PSKey.Ornaments = sTID('ornaments');
PSKey.Titling = sTID('titling');
PSKey.Tracking = sTID('tracking'); // 'Trck'
PSKey.HorizontalScale = sTID('horizontalScale'); // 'HrzS'
PSKey.VerticalScale = sTID('verticalScale'); // 'VrtS'
PSKey.Size = sTID('size'); // 'Sz  '
PSKey.ImpliedFontSize = sTID('impliedFontSize');
PSKey.Orientation = cTID('Ornt');
PSKey.SubScript = sTID('subScript');
PSKey.SuperScript = sTID('superScript');
PSKey.BaselineNormal = sTID('normal');
PSKey.StylisticAlternates = sTID('stylisticAlternates');
PSKey.ContextualLigatures = sTID('contextualLigatures');
PSKey.Swash = sTID('swash');
PSKey.SyntheticBold = sTID('syntheticBold');
PSKey.SyntheticItalic = sTID('syntheticItalic');
PSKey.TextClickPoint = sTID('textClickPoint'); // 'TxtC'
PSKey.TextShape = sTID('textShape');
PSKey.Tool = sTID('tool');
PSKey.Underline = sTID('underline'); // 'Undl'
PSKey.AutoKerning = sTID('autoKern'); // 'AtKr'
PSEnum.Box = sTID('box');
PSEnum.Horizontal = cTID('Hrzn');
PSEnum.Vertical = cTID('Vrtc');
PSEnum.AntiAliasNone = cTID('Anno');
PSEnum.AntiAliasLow = cTID('AnLo');
PSEnum.AntiAliasMedium = cTID('AnMd');
PSEnum.AntiAliasHigh = cTID('AnHi');
PSEnum.AntiAliasCrisp = cTID('AnCr');
PSEnum.AntiAliasStrong = cTID('AnSt');
PSEnum.AntiAliasSmooth = cTID('AnSm');
PSString.AutoLeading = sTID('autoLeading');
PSString.strikethrough = sTID('strikethrough');
PSString.fontPostScriptName = sTID('fontPostScriptName');
PSString.underlineOnLeftInVertical = sTID('underlineOnLeftInVertical');
PSString.underlineOnRightInVertical = sTID('underlineOnRightInVertical');
PSString.xHeightStrikethroughOn = sTID('xHeightStrikethroughOn');
PSString.opticalKern = sTID('opticalKern');
PSString.metricsKern = sTID('metricsKern');
PSString.manual = sTID('manual');
PSKey.Baseline = sTID('baseline');
PSKey.BaselineShift = sTID('baselineShift'); // 'Bsln'
PSKey.ImpliedBaselineShift = sTID('impliedBaselineShift');

PSKey.FileOpenContext = sTID("fileOpenContext");
PSEnum.FileOpenContextCCLibraries = sTID("fileOpenContextCCLibrariesAsset");


PSString.FROM = sTID('from');
PSString.TO = sTID('to'); // DEPRECATE: Use PSKey.To

PSString.TEXT_STYLE = sTID('textStyle'); // DEPRECATE: PSClass.TextStyle
PSString.TEXT_STYLE_RANGE = sTID('textStyleRange'); // DEPRECATE: PSClass.TextStyleRange

PSString.ORIENTATION = sTID('orientation');

PSString.ANTI_ALIAS = sTID('antiAlias');
PSString.ANTI_ALIAS_TYPE = sTID('antiAliasType');
PSString.ANTI_ALIAS_IDS = {};
PSString.ANTI_ALIAS_IDS[AntiAlias.CRISP] = sTID('antiAliasCrisp');
PSString.ANTI_ALIAS_IDS[AntiAlias.NONE] = sTID('antiAliasNone');
PSString.ANTI_ALIAS_IDS[AntiAlias.SHARP] = sTID('antiAliasSharp');
PSString.ANTI_ALIAS_IDS[AntiAlias.SMOOTH] = sTID('antiAliasSmooth');
PSString.ANTI_ALIAS_IDS[AntiAlias.STRONG] = sTID('antiAliasStrong');
PSString.ANTI_ALIAS_IDS['AntiAlias.PLATFORM_GRAY'] = sTID('antiAliasPlatformGray');
PSString.ANTI_ALIAS_IDS['AntiAlias.PLATFORM_LCD'] = sTID('antiAliasPlatformLCD');

PSString.WARP = sTID('warp');
PSString.WARP_ROTATE = sTID('warpRotate');
PSString.WARP_STYLE = sTID('warpStyle');
PSString.WARP_STYLE_IDS = {};
PSString.WARP_STYLE_IDS[WarpStyle.ARC] = sTID('warpArc');
PSString.WARP_STYLE_IDS[WarpStyle.ARCH] = sTID('warpArch');
PSString.WARP_STYLE_IDS[WarpStyle.ARCLOWER] = sTID('warpArcLower');
PSString.WARP_STYLE_IDS[WarpStyle.ARCUPPER] = sTID('warpArcUpper');
PSString.WARP_STYLE_IDS[WarpStyle.BULGE] = sTID('warpBulge');
PSString.WARP_STYLE_IDS[WarpStyle.FISH] = sTID('warpFish');
PSString.WARP_STYLE_IDS[WarpStyle.FISHEYE] = sTID('warpFisheye');
PSString.WARP_STYLE_IDS[WarpStyle.FLAG] = sTID('warpFlag');
PSString.WARP_STYLE_IDS[WarpStyle.INFLATE] = sTID('warpInflate');
PSString.WARP_STYLE_IDS[WarpStyle.NONE] = sTID('warpNone');
PSString.WARP_STYLE_IDS[WarpStyle.RISE] = sTID('warpRise');
PSString.WARP_STYLE_IDS[WarpStyle.SHELLLOWER] = sTID('warpShellLower');
PSString.WARP_STYLE_IDS[WarpStyle.SHELLUPPER] = sTID('warpShellUpper');
PSString.WARP_STYLE_IDS[WarpStyle.SQUEEZE] = sTID('warpSqueeze');
PSString.WARP_STYLE_IDS[WarpStyle.TWIST] = sTID('warpTwist');
PSString.WARP_STYLE_IDS[WarpStyle.WAVE] = sTID('warpWave');

PSString.DIRECTION_IDS = {};
PSString.DIRECTION_IDS[Direction.HORIZONTAL] = sTID('horizontal');
PSString.DIRECTION_IDS[Direction.VERTICAL] = sTID('vertical');


PSString.AUTO_KERN_IDS = {};
PSString.AUTO_KERN_IDS[AutoKernType.MANUAL] = sTID('manual');
PSString.AUTO_KERN_IDS[AutoKernType.METRICS] = sTID('metricsKern');
PSString.AUTO_KERN_IDS[AutoKernType.OPTICAL] = sTID('opticalKern');

PSString.UNDERLINE_TYPE_IDS = {};
PSString.UNDERLINE_TYPE_IDS[UnderlineType.UNDERLINEOFF] = sTID('underlineOff');
PSString.UNDERLINE_TYPE_IDS[UnderlineType.UNDERLINERIGHT] = sTID('underlineOnRightInVertical');
PSString.UNDERLINE_TYPE_IDS[UnderlineType.UNDERLINELEFT] = sTID('underlineOnLeftInVertical');


PSString.STRIKETHRU_TYPE_IDS = {};
PSString.STRIKETHRU_TYPE_IDS[StrikeThruType.STRIKEOFF] = sTID('strikethroughOff');
PSString.STRIKETHRU_TYPE_IDS[StrikeThruType.STRIKEHEIGHT] = sTID('xHeightStrikethroughOn');
PSString.STRIKETHRU_TYPE_IDS[StrikeThruType.STRIKEBOX] = sTID('eMBoxStrikethroughOn');

PSString.TEXT_CASE_IDS = {};
PSString.TEXT_CASE_IDS[TextCase.ALLCAPS] = sTID('allCaps');
PSString.TEXT_CASE_IDS[TextCase.NORMAL] = sTID('normal');
PSString.TEXT_CASE_IDS[TextCase.SMALLCAPS] = sTID('smallCaps');


PSEvent.Crop = cTID('Crop');
PSKey.Top = cTID('Top ');
PSKey.Left = cTID('Left');
PSKey.Right = sTID('right'); // 'Rght'
PSKey.Bottom = sTID('bottom'); // 'Btom'
PSClass.Rectangle = cTID('Rctn');
PSEvent.Delete = cTID('Dlt '); // 'delete'
PSKey.ConstrainProportions = cTID('CnsP');

PSKey.CCLibrariesConfig = cTID('CCLc');

PSKey.Adjustment = sTID('adjustment');
PSKey.AdjustmentLayer = sTID('adjustmentLayer');
PSKey.Brush = sTID('brush'); // 'Brsh'
PSKey.ColorLookup = sTID('colorLookup');
PSKey.File = sTID('file');
PSKey.FileFormats = sTID('FileFormats');
PSKey.Get = sTID('get'); // 'getd'
PSKey.HasMatchingOpenDoc = sTID('hasMatchingOpenDoc');
PSKey.LargeDocumentFormat = sTID('largeDocumentFormat');
PSKey.Photoshop35Format = sTID('photoshop35Format');
PSKey.HasVectorMask = sTID('hasVectorMask');
PSKey.ID = sTID('ID');
PSKey.LayerKey = sTID('layer');
PSKey.OrdinalKey = sTID('ordinal'); // DEPRECATE: Use PSType.Ordinal
PSKey.Pattern = sTID('pattern');
PSKey.PatternLayer = sTID('patternLayer');
PSKey.Select = sTID('select'); // 'slct'
PSKey.SelectionModifier = sTID('selectionModifier');
PSKey.SelectionModifierType = sTID('selectionModifierType');
PSKey.AddToSelection = sTID('addToSelection');
PSKey.Target = sTID('target'); // 'null'
PSKey.TargetEnum = sTID('targetEnum'); // DEPRECATE: Use PSEnum.Target
PSKey.MaximizeCompatibility = sTID('maximizeCompatibility');
PSKey.Save = sTID('save');
PSKey.Export = sTID('export');
PSKey.OverrideOpen = sTID('overrideOpen');
PSKey.ReadableFileExtensions = sTID("readableFileExtensions");
PSKey.Representation = sTID('representation');
PSKey.ResolveAllStyles = sTID('resolveAllStyles');
PSKey.SaveForCCLibrariesElement = sTID('saveForCCLibrariesElement');
PSKey.SmartObject = sTID('smartObject');
PSKey.Style = sTID('style');
PSKey.Template = sTID('template');
PSKey.Thumbnail = sTID('thumbnail');
PSKey.As = sTID('as');
PSKey.LowerCase = sTID('lowerCase');
PSKey.IN = sTID('in');
PSKey.PLACE_EVENT = sTID('placeEvent');
PSKey.PLACED_REPLACELINKED2LIBRARY = sTID('placedLayerRelinkToLibraries');
PSKey.LINK = sTID('link');
PSKey.LINKED = sTID('linked');
PSKey.UNWRAP_LAYERS = sTID('unwrapLayers');
PSKey.LAYER_NAME = sTID('layerName');
PSKey.LIBRARY_NAME = sTID('libraryName');
PSKey.LIB_ELEMENT = sTID('ccLibrariesElement');
PSKey.ELEMENT_REF = sTID('elementReference');
PSKey.DATE_MODIFIED = sTID('dateModified');
PSKey.ADOBE_STOCK_ID = sTID('adobeStockId');
PSKey.ADOBE_STOCK_LICENSE_STATE = sTID('adobeStockLicenseState');
PSKey.Licensed = sTID('licensed');
PSKey.Unlicensed = sTID('unlicensed');

PSString.interfacePrefs = sTID('interfacePrefs');
PSKey.ShowToolTips = cTID('ShwT');

PSString.Open = sTID('open');
PSString.IN = sTID('in');
PSString.PixelWidth = sTID('pixelWidth');
PSString.PixelHeight = sTID('pixelHeight');
PSString.ExternalPreview = sTID('externalPreviewParams');

PSEvent.Duplicate = cTID('Dplc');

// These are needed for Highbeam analytics reporting. The PSKey entries are custom, not defined by PS.
PSEvent.HeadlightsInfo = sTID('headlightsInfo');
PSEvent.Record = sTID('eventRecord');

// These are custom keys that we pass through as headlights data.
// Per Headlights documentation:
// Avoid using the following key names:
// GroupID, docID, sequenceNum, time, sessionId are illegal for data record name.
// Because they will lead to failure of pivot operation. The illegal names are case insensitive.
// We will add prefix "HL_validataion_error_" before the illegal name. The modified name will occur in database.
// e.g. GroupID will be modified to HL_validataion_error_groupID.
PSKey.HighbeamEventName = sTID("eventName");
PSKey.HighbeamLibraryID = sTID("libraryID");
PSKey.HighbeamLibraryElementCount = sTID("libraryElemCount");
PSKey.HighbeamElementID = sTID("elementID");
PSKey.HighbeamElementType = sTID("elementType");
PSKey.HighbeamRepresentationType = sTID("representationType");
PSKey.HighbeamOpType = sTID("opType");
PSKey.HighbeamDetails = sTID("details");

//Patterns
PSString.makePatternLayerFromFile = sTID("makePatternLayerFromFile");
PSString.definePatternFile = sTID("definePatternFile");

//Looks
PSString.makeColorLookupLayerFromFile = sTID("makerColorLookupLayerFromFile");
/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2013 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50, sloppy: true, continue: true */
/*global $, Folder, app, DocumentFill, ActionDescriptor, ActionReference, DialogModes, File, sTID,
         TypeUnits, ActionList, SolidColor, executeAction, executeActionGet, PhotoshopSaveOptions, SaveOptions, PNGSaveOptions, ReferenceFormType, DescValueType,
         LayerKind, cssToClip, svg, ColorModel, JSXGlobals, TEXT, COLOR, BRUSH, PSClass, PSEnum, PSType, PSForm, PSUnit, PSString, PSKey, PSEvent, getSelectedLayerIndices */
var UTIL = {};

UTIL.unitToString = function (key) {
    if (key === PSUnit.Points) {
        return 'pt';
    }

    if (key === PSUnit.Pixels) {
        return 'px';
    }

    if (key === PSUnit.Millimeters) {
        return 'mm';
    }

    if (key === PSUnit.Angle) {
        return 'ang';
    }

    if (key === PSUnit.Percent) {
        return '%';
    }

    return '';
};

UTIL.stringToUnit = function (key) {
    if (key === 'pt') {
        return PSUnit.Points;
    }

    if (key === 'px') {
        return PSUnit.Pixels;
    }

    if (key === 'mm') {
        return PSUnit.Millimeters;
    }

    if (key === 'ang') {
        return PSUnit.Angle;
    }

    if (key === '%') {
        return PSUnit.Percent;
    }

    return PSUnit.Pixels; // fallback to something that won't fail completely
};


UTIL.idToConstant = function (id, idObject) {
    var attr;
    for (attr in idObject) {
        if (idObject.hasOwnProperty(attr)) {
            if (idObject[attr] === id) {
                return attr;
            }
        }
    }
};

UTIL.selectLayerByIndex = function (layerIndex, addToSelection) {
    var layerIndexRef = new ActionReference();
    layerIndexRef.putIndex(PSKey.LayerKey, layerIndex);

    var selectDesc = new ActionDescriptor();
    selectDesc.putReference(PSKey.Target, layerIndexRef);

    if (addToSelection) {
        selectDesc.putEnumerated(PSKey.SelectionModifier, PSKey.SelectionModifierType, PSKey.AddToSelection);
    }

    executeAction(PSKey.Select, selectDesc, DialogModes.NO);
};

function getPropertyFromDesc(propertykey, desc) {
    if (desc && desc.hasKey(propertykey)) {
        switch (desc.getType(propertykey)) {
            // Add handling of new types here as needed
        case DescValueType.OBJECTTYPE:
            return desc.getObjectValue(propertykey);
        case DescValueType.BOOLEANTYPE:
            return desc.getBoolean(propertykey);
        case DescValueType.LISTTYPE:
            return desc.getList(propertykey);
        }
    }
    return undefined;
}

UTIL.getAppProperty = function (propertyKey, argsDesc) {
    // Use the passed in desc if provided so the caller can supply additional params
    if (!argsDesc) {
        argsDesc = new ActionDescriptor();
    }

    var ref = new ActionReference();
    ref.putProperty(PSClass.Property, propertyKey);
    ref.putEnumerated(PSClass.Application, PSType.Ordinal, PSEnum.Target);
    argsDesc.putReference(PSKey.Target, ref);
    var appDesc = executeAction(PSKey.Get, argsDesc, DialogModes.NO);
    return getPropertyFromDesc(propertyKey, appDesc);
};

UTIL.getLayerProperty = function (propertyKey, argsDesc) {
    // Use the passed in desc if provided so the caller can supply additional params
    if (!argsDesc) {
        argsDesc = new ActionDescriptor();
    }

    var ref = new ActionReference();
    ref.putProperty(PSClass.Property, propertyKey);
    ref.putEnumerated(PSClass.Layer, PSType.Ordinal, PSEnum.Target);
    argsDesc.putReference(PSKey.Target, ref);
    var layerDesc = executeAction(PSKey.Get, argsDesc, DialogModes.NO);

    return getPropertyFromDesc(propertyKey, layerDesc);
};

// Selects each layer one at a time, calling aFunction for each, and then
// restores the original selection.
UTIL.forEachSelectedLayer = function (aFunction) {
    if (typeof aFunction !== 'function') {
        return;
    }

    var index, layerIndex;
    var layerIndexes = getSelectedLayerIndices();

    for (index = 0; index < layerIndexes.length; ++index) {
        layerIndex = layerIndexes[index];
        UTIL.selectLayerByIndex(layerIndex);

        try {
            aFunction();
        } catch (ignore) {
            // eat exception to ensure we reset the original layer selection below.
        }
    }

    for (index = 0; index < layerIndexes.length - 1; ++index) {
        UTIL.selectLayerByIndex(layerIndexes[index], true);
    }
};

ActionDescriptor.prototype.eraseIfExists = function (key) {
    if (this.hasKey(key)) {
        this.erase(key);
    }
};

// Deep copy ActionReference
ActionReference.prototype.copy = function () {
    var r = new ActionReference();
    var c = this.getDesiredClass();

    switch (this.getForm()) {
    case ReferenceFormType.ENUMERATED:
        r.putEnumerated(c, this.getEnumeratedType(), this.getEnumeratedValue());
        break;
    case ReferenceFormType.CLASSTYPE:
        r.putClass(c);
        break;
    case ReferenceFormType.IDENTIFIER:
        r.putIdentifier(c, this.getIdentifier());
        break;
    case ReferenceFormType.INDEX:
        r.putIndex(c, this.getIndex());
        break;
    case ReferenceFormType.NAME:
        r.putName(c, this.getName());
        break;
    case ReferenceFormType.OFFSET:
        r.putOffset(c, this.getOffset());
        break;
    case ReferenceFormType.PROPERTY:
        r.putProperty(c, this.getProperty());
        break;
        // Container???
    default:
        $.writeln("Unknown ref type");
        break;
    }
    return r;
};

// Deep copy ActionDescriptor
ActionDescriptor.prototype.copy = function () {
    var key, i, r = new ActionDescriptor();
    for (i = 0; i < this.count; ++i) {
        key = this.getKey(i);
        switch (this.getType(key)) {
        case DescValueType.BOOLEANTYPE:
            r.putBoolean(key, this.getBoolean(key));
            break;
        case DescValueType.CLASSTYPE:
            r.putClass(key, this.getClass(key));
            break;
        case DescValueType.RAWTYPE:
            r.putData(key, this.getData(key));
            break;
        case DescValueType.DOUBLETYPE:
            r.putDouble(key, this.getDouble(key));
            break;
        case DescValueType.ENUMERATEDTYPE:
            r.putEnumerated(key, this.getEnumerationType(key),
                this.getEnumerationValue(key));
            break;
        case DescValueType.INTEGERTYPE:
            r.putInteger(key, this.getInteger(key));
            break;
        case DescValueType.LARGEINTEGERTYPE:
            r.putLargeInteger(key, this.getLargeInteger(key));
            break;
        case DescValueType.OBJECTTYPE:
            r.putObject(key, this.getObjectType(key),
                this.getObjectValue(key).copy());
            break;
        case DescValueType.ALIASTYPE:
            r.putPath(key, this.getPath(key));
            break;
        case DescValueType.REFERENCETYPE:
            r.putReference(key, this.getReference(key).copy());
            break;
        case DescValueType.STRINGTYPE:
            r.putString(key, this.getString(key));
            break;
        case DescValueType.UNITDOUBLE:
            r.putUnitDouble(key, this.getUnitDoubleType(key),
                this.getUnitDoubleValue(key));
            break;
        case DescValueType.LISTTYPE:
            r.putList(key, this.getList(key).copy());
            break;
        default:
            $.writeln("Unknown descriptor type");
            break;
        }
    }
    return r;
};


// Deep copy ActionList
ActionList.prototype.copy = function () {
    var i, r = new ActionList();
    for (i = 0; i < this.count; ++i) {
        switch (this.getType(i)) {
        case DescValueType.BOOLEANTYPE:
            r.putBoolean(this.getBoolean(i));
            break;
        case DescValueType.CLASSTYPE:
            r.putClass(this.getClass(i));
            break;
        case DescValueType.RAWTYPE:
            r.putData(this.getData(i));
            break;
        case DescValueType.DOUBLETYPE:
            r.putDouble(this.getDouble(i));
            break;
        case DescValueType.ENUMERATEDTYPE:
            r.putEnumerated(this.getEnumerationType(i),
                this.getEnumerationValue(i));
            break;
        case DescValueType.INTEGERTYPE:
            r.putInteger(this.getInteger(i));
            break;
        case DescValueType.LARGEINTEGERTYPE:
            r.putLargeInteger(this.getLargeInteger(i));
            break;
        case DescValueType.OBJECTTYPE:
            r.putObject(this.getObjectType(i),
                this.getObjectValue(i).copy());
            break;
        case DescValueType.ALIASTYPE:
            r.putPath(this.getPath(i));
            break;
        case DescValueType.REFERENCETYPE:
            r.putReference(this.getReference(i).copy());
            break;
        case DescValueType.STRINGTYPE:
            r.putString(this.getString(i));
            break;
        case DescValueType.UNITDOUBLE:
            r.putUnitDouble(this.getUnitDoubleType(i),
                this.getUnitDoubleValue(i));
            break;
        case DescValueType.LISTTYPE:
            r.putList(this.getList(i).copy());
            break;
        default:
            $.writeln("Unknown descriptor type");
            break;
        }
    }
    return r;
};

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50, sloppy: true, continue: true, unparam: true */
/*global $, Folder, app, DocumentFill, ActionDescriptor, ActionReference, DialogModes, File, DocumentMode,
         TypeUnits, ActionList, SolidColor, executeAction, executeActionGet, PhotoshopSaveOptions, SaveOptions, PNGSaveOptions, UTIL,
         LayerKind, cssToClip, svg, ColorModel, JSXGlobals, PSKey, PSClass, PSString, PSType, PSEnum, PSEvent, PSUnit, descriptorToColorData, sTID, cTID */

var COLOR = {};

COLOR.dataToSolidColor = function dataToSolidColor(data) {
    //If passed an array of representations then first select
    //the best representation
    if (Array.isArray(data)) {
        data = COLOR.getBestColorRepresentation(data);
    }
    var finalColor = new SolidColor();
    if (data) {
        switch (data.mode) {
        case 'RGB':
            finalColor.rgb.red = data.value.r;
            finalColor.rgb.green = data.value.g;
            finalColor.rgb.blue = data.value.b;
            finalColor.model = ColorModel.RGB;
            break;
        case 'CMYK':
            finalColor.cmyk.cyan = data.value.c;
            finalColor.cmyk.magenta = data.value.m;
            finalColor.cmyk.yellow = data.value.y;
            finalColor.cmyk.black = data.value.k;
            finalColor.model = ColorModel.CMYK;
            break;
        case 'Lab':
            finalColor.lab.l = data.value.l;
            finalColor.lab.a = data.value.a;
            finalColor.lab.b = data.value.b;
            finalColor.model = ColorModel.LAB;
            break;
        case 'Gray':
            finalColor.gray.gray = data.value;
            finalColor.model = ColorModel.GRAYSCALE;
            break;
        case 'HSB':
            finalColor.hsb.hue = data.value.h;
            finalColor.hsb.saturation = data.value.s;
            finalColor.hsb.brightness = data.value.b;
            finalColor.model = ColorModel.HSB;
            break;
        }
    }

    return finalColor;
};

COLOR.isModeSupported = function (colorData) {
    return colorData && (colorData.mode === 'RGB' || colorData.mode === 'CMYK' || colorData.mode === 'Gray' || colorData.mode === 'Lab' || colorData.mode === 'HSB');
};



COLOR.findRepWithMode = function (reps, mode) {
    var filteredReps = reps.filter(function (item) {
        return item.mode === mode;
    });
    if (filteredReps.length > 0) {
        return filteredReps[0];
    }
};


COLOR.getBestColorRepresentation = function (data) {
    var color = data[0];

    if (COLOR.isModeSupported(color)) {
        return color;
    }
    //Default to RGB if the primary color is not supported
    return COLOR.findRepWithMode(data, 'RGB');
};

COLOR.solidColorToData = function solidColorToData(color) {
    var representations = [];
    var profileName;

    function addProfileName(obj) {
        if (profileName) {
            obj.profileName = profileName;
        }
        return obj;
    }
    // If we don't have a color profile we have to use a try catch
    // Photoshop reports hasOwnProperty and the in operator as true
    // regardless
    try {
        profileName = app.activeDocument.colorProfileName;
    } catch (ignore) {}

    //Always add RGB representation
    representations.push(addProfileName({
        mode: 'RGB',
        value: {
            r: color.rgb.red,
            g: color.rgb.green,
            b: color.rgb.blue
        },
        type: 'process'
    }));
    switch (color.model) {
    case ColorModel.CMYK:
        representations.unshift(addProfileName({
            mode: 'CMYK',
            value: {
                c: color.cmyk.cyan,
                m: color.cmyk.magenta,
                y: color.cmyk.yellow,
                k: color.cmyk.black
            },
            type: 'process'
        }));
        break;
    case ColorModel.LAB:
        representations.unshift(addProfileName({
            mode: 'Lab',
            value: {
                l: color.lab.l,
                a: color.lab.a,
                b: color.lab.b
            },
            type: 'process'
        }));
        break;
    case ColorModel.GRAYSCALE:
        representations.unshift(addProfileName({
            mode: 'Gray',
            value: color.gray.gray,
            type: 'process'
        }));
        break;
    case ColorModel.HSB:
        representations.unshift(addProfileName({
            mode: 'HSB',
            value: {
                h: color.hsb.hue,
                s: color.hsb.saturation,
                b: color.hsb.brightness
            },
            type: 'process'
        }));
        break;
    }
    return representations;
};

COLOR.solidColorToDescriptor = function solidColorToDescriptor(color) {
    var colorType;

    var colorDesc = new ActionDescriptor();
    if (color.model === ColorModel.RGB) {
        colorDesc.putDouble(PSKey.Red, color.rgb.red);
        colorDesc.putDouble(PSKey.Green, color.rgb.green);
        colorDesc.putDouble(PSKey.Blue, color.rgb.blue);
        colorType = PSClass.RGBColor;
    }
    if (color.model === ColorModel.CMYK) {
        colorDesc.putDouble(PSKey.Cyan, color.cmyk.cyan);
        colorDesc.putDouble(PSKey.Magenta, color.cmyk.magenta);
        colorDesc.putDouble(PSKey.Yellow, color.cmyk.yellow);
        colorDesc.putDouble(PSKey.Black, color.cmyk.black);
        colorType = PSClass.CMYKColor;
    }
    if (color.model === ColorModel.LAB) {
        colorDesc.putDouble(PSKey.Luminance, color.lab.l);
        colorDesc.putDouble(PSKey.A, color.lab.a);
        colorDesc.putDouble(PSKey.B, color.lab.b);
        colorType = PSClass.LabColor;
    }
    if (color.model === ColorModel.HSB) {
        colorDesc.putUnitDouble(PSKey.Hue, PSUnit.Angle, color.hsb.hue);
        colorDesc.putDouble(PSKey.Start, color.hsb.saturation);
        colorDesc.putDouble(PSKey.Brightness, color.hsb.brightness);
        colorType = PSClass.HSBColor;
    }
    if (color.model === ColorModel.GRAYSCALE) {
        colorDesc.putDouble(PSKey.Gray, color.gray.gray);
        colorType = PSClass.Grayscale;
    }
    return {
        'type': colorType,
        'descriptor': colorDesc
    };
};

COLOR.descriptorToColorData = function descriptorToColorData(descriptor) {

    if (!descriptor) {
        return "";
    }
    var fillcolor = new SolidColor();

    // RGB color mode
    if (descriptor && descriptor.hasKey(PSKey.Red)) {
        fillcolor.rgb.red = descriptor.getDouble(PSKey.Red);
        fillcolor.rgb.green = descriptor.getDouble(PSKey.Green);
        fillcolor.rgb.blue = descriptor.getDouble(PSKey.Blue);
    }

    // CMYK color mode
    if (descriptor && descriptor.hasKey(PSKey.Cyan)) {
        fillcolor.cmyk.cyan = descriptor.getDouble(PSKey.Cyan);
        fillcolor.cmyk.magenta = descriptor.getDouble(PSKey.Magenta);
        fillcolor.cmyk.yellow = descriptor.getDouble(PSKey.Yellow);
        fillcolor.cmyk.black = descriptor.getDouble(PSKey.Black);
    }

    // HSB color mode
    if (descriptor && descriptor.hasKey(PSKey.Hue)) {
        fillcolor.hsb.hue = descriptor.getUnitDouble(PSKey.Cyan, PSUnit.Angle);
        fillcolor.hsb.saturation = descriptor.getDouble(PSKey.Start);
        fillcolor.hsb.brightness = descriptor.getDouble(PSKey.Brightness);
    }

    // LAB color mode
    if (descriptor && descriptor.hasKey(PSKey.Luminance)) {
        fillcolor.lab.l = descriptor.getDouble(PSKey.Luminance);
        fillcolor.lab.a = descriptor.getDouble(PSKey.A);
        fillcolor.lab.b = descriptor.getDouble(PSKey.B);
    }

    // Grayscale color mode
    if (descriptor && descriptor.hasKey(PSKey.Gray)) {
        fillcolor.gray.gray = descriptor.getDouble(PSKey.Gray);
    }

    return COLOR.solidColorToData(fillcolor);
};

COLOR.getLayerEffectColor = function (forEffect) {
    try {
        var layerEffects = UTIL.getLayerProperty(PSClass.LayerEffects);
        var colorFill = layerEffects.getObjectValue(forEffect);
        var color = colorFill.getObjectValue(PSKey.Color);

        return COLOR.descriptorToColorData(color);
    } catch (ignore) {}
};

COLOR.getSolidFillColor = function () {
    try {
        var adjList = UTIL.getLayerProperty(PSKey.Adjustment); // sTID('adjustment')
        var color = adjList.getObjectValue(0).getObjectValue(PSKey.Color);
        return COLOR.descriptorToColorData(color);
    } catch (ignore) {}
};

COLOR.getSolidStrokeColor = function () {
    try {
        var strokeObj = UTIL.getLayerProperty(sTID('AGMStrokeStyleInfo'));
        var strokeStyle = strokeObj.getObjectValue(sTID('strokeStyleContent'));
        var strokeColor = strokeStyle.getObjectValue(PSKey.Color);

        return COLOR.descriptorToColorData(strokeColor);
    } catch (ignore) {}
};

COLOR.addSolidFillFilter = function (newColor) {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putProperty(PSClass.Property, PSClass.LayerEffects);
    ref1.putEnumerated(PSClass.Layer, PSType.Ordinal, PSEnum.Target);
    desc1.putReference(PSString.Null, ref1);
    var desc2 = new ActionDescriptor();
    desc2.putUnitDouble(PSKey.Scale, PSUnit.Percent, 100);
    var desc3 = new ActionDescriptor();
    desc3.putBoolean(PSKey.Enabled, true);
    desc3.putEnumerated(PSKey.Mode, PSType.BlendMode, PSEnum.Normal);
    desc3.putUnitDouble(PSKey.Opacity, PSUnit.Percent, 100);

    var colorObject = COLOR.solidColorToDescriptor(newColor);
    desc3.putObject(PSKey.Color, colorObject.type, colorObject.descriptor);
    desc2.putObject(PSKey.SolidFill, PSKey.SolidFill, desc3);
    desc1.putObject(PSKey.To, PSClass.LayerEffects, desc2);
    desc1.putBoolean(PSKey.Merge, true);
    executeAction(PSEvent.Set, desc1, DialogModes.NO);
};

COLOR.setCurrentSolidFillOrShapeLayerColor = function (newColor) {
    var layerDesc = new ActionDescriptor();
    var refDesc = new ActionReference();
    refDesc.putEnumerated(PSString.contentLayer, PSType.Ordinal, PSEnum.Target);
    layerDesc.putReference(PSString.Null, refDesc);
    var colorDesc = new ActionDescriptor();

    var colorObject = COLOR.solidColorToDescriptor(newColor);
    colorDesc.putObject(PSKey.Color, colorObject.type, colorObject.descriptor);

    layerDesc.putObject(PSKey.To, PSString.solidColorLayer, colorDesc);
    executeAction(PSEvent.Set, layerDesc, DialogModes.NO);
};

COLOR.setCurrentShapeStrokeColor = function (newColor) {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(PSString.contentLayer, PSType.Ordinal, PSEnum.Target);
    desc1.putReference(PSString.Null, ref1);
    var desc2 = new ActionDescriptor();
    var desc3 = new ActionDescriptor();
    var desc4 = new ActionDescriptor();

    var colorObject = COLOR.solidColorToDescriptor(newColor);
    desc4.putObject(PSKey.Color, colorObject.type, colorObject.descriptor);

    desc3.putObject(PSString.strokeStyleContent, PSString.solidColorLayer, desc4);
    desc3.putInteger(PSString.strokeStyleVersion, 2);
    desc3.putBoolean(PSString.strokeEnabled, true);

    desc2.putObject(PSString.strokeStyle, PSString.strokeStyle, desc3);
    desc1.putObject(PSKey.To, PSString.shapeStyle, desc2);
    executeAction(PSEvent.Set, desc1, DialogModes.NO);
};

COLOR.replaceColor = function (colorData) {
    try {
        var newColor = COLOR.dataToSolidColor(colorData);
        app.foregroundColor = newColor;
        var colorWasChanged = app.showColorPicker();
        return colorWasChanged;
    } catch (ex) {
        $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-replaceColor()', ex);
    }
};

COLOR.getLayerColor = function () {
    try {
        var docColor = COLOR.solidColorToData(app.foregroundColor);
        return JSON.stringify(docColor);
    } catch (ex) {
        $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-getLayerColor()', ex);
    }
};

COLOR.setColorForSinglySelectedLayer = function (color) {
    var selectedLayer = app.activeDocument.activeLayer;

    if (selectedLayer && selectedLayer.kind === LayerKind.SOLIDFILL) {
        // This handles both Shape layers and Solid Color Fill layers
        COLOR.setCurrentSolidFillOrShapeLayerColor(color);
    } else if (selectedLayer && selectedLayer.kind === LayerKind.TEXT) {
        COLOR.setTextColor(color);
    }
};

COLOR.setColor = function (color, historyName) {
    try {
        var newColor = COLOR.dataToSolidColor(color);

        app.foregroundColor = newColor;

        if (app.documents.length === 0) {
            return;
        }

        var doSetColorFunc = function () {
            COLOR.setColorForSinglySelectedLayer(newColor);
        };

        // Placate JSLint ('not used' error)
        if (!doSetColorFunc) {
            return;
        }

        // The only way to successfully change Shape layer fill color, Solid Color Fill
        // layer color, and Text layer color in a multi-layer selection seems to be to
        // change the color of each layer one at a time.
        app.activeDocument.suspendHistory(historyName, "UTIL.forEachSelectedLayer(doSetColorFunc);");

    } catch (ex) {
        $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-setColor()', ex);
    }
};
COLOR.setFillColor = COLOR.setColor;

COLOR.setStrokeColor = function (color, historyName) {
    try {
        if (app.documents.length === 0) {
            return;
        }

        var newColor = COLOR.dataToSolidColor(color);
        app.foregroundColor = newColor;

        COLOR.setCurrentShapeStrokeColor(newColor);
    } catch (ex) {
        $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-setStrokeColor()', ex);
    }
};

COLOR.setTextColor = function (color) {
    // Accept either a SolidColor object or our color data representation
    color = color && color.typename ? color : COLOR.dataToSolidColor(color);
    var colorDesc = COLOR.solidColorToDescriptor(color);
    var selectedLayer = app.activeDocument.activeLayer;
    if (selectedLayer && selectedLayer.kind === LayerKind.TEXT) {
        var idset = sTID("set");
        var desc12 = new ActionDescriptor();
        var idnull = sTID("null");
        var ref4 = new ActionReference();
        var idproperty = sTID("property");
        var idtextStyle = sTID("textStyle");
        ref4.putProperty(idproperty, idtextStyle);
        var idtextLayer = sTID("textLayer");
        var idordinal = sTID("ordinal");
        var idtargetEnum = sTID("targetEnum");
        ref4.putEnumerated(idtextLayer, idordinal, idtargetEnum);
        desc12.putReference(idnull, ref4);
        var idto = sTID("to");
        var desc13 = new ActionDescriptor();
        var idtextOverrideFeatureName = sTID("textOverrideFeatureName");
        desc13.putInteger(idtextOverrideFeatureName, 808466226);
        var idtypeStyleOperationType = sTID("typeStyleOperationType");
        desc13.putInteger(idtypeStyleOperationType, 3);
        desc13.putObject(sTID('color'), colorDesc.type, colorDesc.descriptor);
        desc12.putObject(idto, idtextStyle, desc13);
        executeAction(idset, desc12, DialogModes.NO);
    }
};

COLOR.setColorOverlay = function (color, historyName) {
    try {
        if (app.documents.length === 0) {
            return;
        }

        var newColor = COLOR.dataToSolidColor(color);
        app.foregroundColor = newColor;

        var doSetColorOverlayFunc = function () {
            COLOR.addSolidFillFilter(newColor);
        };

        // Placate JSLint ('not used' error)
        if (!doSetColorOverlayFunc) {
            return;
        }

        app.activeDocument.suspendHistory(historyName, "UTIL.forEachSelectedLayer(doSetColorOverlayFunc);");

    } catch (ex) {
        $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-setColorOverlay()', ex);
    }
};

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50, sloppy: true, continue: true, todo: true, unparam: true */
/*global $, Folder, app, DocumentFill, ActionDescriptor, ActionReference, DialogModes, File,
         TypeUnits, ActionList, SolidColor, executeAction, executeActionGet, PhotoshopSaveOptions, SaveOptions, PNGSaveOptions,
         LayerKind, cssToClip, svg, ColorModel, JSXGlobals, PSKey, PSClass, PSString, PSType, PSEnum, PSEvent, PSUnit, sTID, COLOR */

var BRUSH = {};
BRUSH.loadBrushFromFile = function (filePath) {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putProperty(PSClass.Property, PSKey.Brush);
    ref1.putEnumerated(PSClass.Application, PSType.Ordinal, PSEnum.Target);
    desc1.putReference(PSString.Null, ref1);
    desc1.putPath(PSKey.To, new File(filePath));
    desc1.putBoolean(PSKey.Append, true);
    executeAction(PSEvent.Set, desc1, DialogModes.NO);
};
BRUSH.selectBrush = function (brushName) {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putName(PSKey.Brush, brushName);
    desc1.putReference(PSString.Null, ref1);
    executeAction(PSEvent.Select, desc1, DialogModes.NO);
};
BRUSH.activateTool = function () {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putClass(PSClass.PaintbrushTool);
    desc1.putReference(PSString.Null, ref1);
    executeAction(PSEvent.Select, desc1, DialogModes.NO);
};
BRUSH.loadAndSelectBrush = function (filePath, brushName, brushSettings) {
    try {
        if (brushSettings && brushSettings.tool) {
            app.currentTool = brushSettings.tool;
        }

        var tool_name = app.currentTool;
        // if tool_name is not undefined that means that
        // current version of Photoshop supports new Brush API
        if (tool_name) {
            if (!app.toolSupportsBrushes(tool_name)) {
                app.currentTool = "paintbrushTool";
            }
            app.applyToolBrushFromFile(new File(filePath));
        } else {
            BRUSH.activateTool();
            BRUSH.loadBrushFromFile(filePath);
            // TODO: Brushes iOS app always exports ABR file with brush name as "SampledBrush"
            // So, change this once the issue gets fixed
            BRUSH.selectBrush("SampledBrush"); //brushName
        }

        BRUSH.applySettings(brushSettings);

    } catch (ex) {
        $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-loadAndSelectBrush()', ex);
    }
};

BRUSH.saveBrushByIndex = function (brushIndex) {
    var result = {};
    try {
        var saveDesc = new ActionDescriptor();

        var refDesc = new ActionReference();
        refDesc.putIndex(PSKey.Brush, brushIndex);
        saveDesc.putReference(PSKey.Target, refDesc);

        var randomNum = $.hiresTimer;
        var abrPath = Folder.temp.fsName + "/Brush" + randomNum + ".abr";
        var pngPath = Folder.temp.fsName + "/Brush" + randomNum + ".png";
        var abrFile = new File(abrPath);
        var pngFile = new File(pngPath);

        saveDesc.putPath(PSKey.To, abrFile);
        saveDesc.putPath(PSKey.Thumbnail, pngFile);

        executeAction(PSKey.Save, saveDesc, DialogModes.ERROR);

        result.abrPath = abrPath;
        result.previewPath = pngPath;
    } catch (ignore) {}

    return JSON.stringify(result);
};

BRUSH.applySettings = function (brushSettings) {
    if (brushSettings) {

        if (brushSettings.blendMode || brushSettings.opacity || brushSettings.flow) {

            // Start with the current tool options because unspecified options may get reset to defaults.
            // Can't use UTIL.getAppProperty because PS returns result under different key.
            var ref = new ActionReference();
            ref.putProperty(PSClass.Property, PSKey.Tool);
            ref.putEnumerated(PSClass.Application, PSType.Ordinal, PSEnum.Target);

            var argsDesc = new ActionDescriptor();
            argsDesc.putReference(PSKey.Target, ref);

            var appDesc = executeAction(PSKey.Get, argsDesc, DialogModes.NO);

            var settingsDesc = appDesc.getObjectValue(PSKey.CurrentToolOptions);

            // Override the provided settings
            if (brushSettings.blendMode) {
                settingsDesc.putEnumerated(PSKey.Mode, PSType.BlendMode, sTID(brushSettings.blendMode));
            }

            if (brushSettings.opacity) {
                settingsDesc.putUnitDouble(PSKey.Opacity, PSUnit.Percent, brushSettings.opacity * 100);
            }

            if (brushSettings.flow) {
                settingsDesc.putUnitDouble(PSKey.Flow, PSUnit.Percent, brushSettings.flow * 100);
            }

            var targetRef = new ActionReference();
            targetRef.putClass(sTID(app.currentTool));

            var setDesc = new ActionDescriptor();
            setDesc.putReference(PSKey.Target, targetRef);
            setDesc.putObject(PSKey.To, PSKey.Target, settingsDesc);

            executeAction(PSEvent.Set, setDesc, DialogModes.NO);
        }

        // Set foreground color used by brush
        if (brushSettings.color) {
            var newColor = COLOR.dataToSolidColor(brushSettings.color);
            app.foregroundColor = newColor;
        }
    }
};

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50, sloppy: true, continue: true, unparam: true */
/*global $, Folder, app, DocumentFill, ActionDescriptor, ActionReference, DialogModes, File, sTID, cTID,
         TypeUnits, ActionList, SolidColor, executeAction, executeActionGet, PhotoshopSaveOptions, SaveOptions, PNGSaveOptions,
         LayerKind, cssToClip, svg, ColorModel, JSXGlobals, PSKey, PSClass, PSString, PSType, PSEnum, UnderlineType, StrikeThruType, UnitValue, COLOR, UTIL,
         WarpStyle, Direction, TextComposer, Language, TextType, Justification, TextCase, AutoKernType, AntiAlias, ElementPlacement, PSUnit, PSEvent,
         hasLayerStyles, tTSID, getSelectedLayerIndices    */

var TEXT = {};

function getOrientationFromDesc(desc) {
    var orientation;
    if (desc.hasKey(PSKey.Orientation)) {
        orientation = desc.getEnumerationValue(PSKey.Orientation) === PSKey.Horizontal ? Direction.HORIZONTAL.toString() : Direction.VERTICAL.toString();
    }
    return orientation;
}

function getAntiAliasFromDesc(desc) {
    var antiAlias;
    if (desc.hasKey(PSString.ANTI_ALIAS)) {
        var antiAliasValue = UTIL.idToConstant(desc.getEnumerationValue(PSString.ANTI_ALIAS), PSString.ANTI_ALIAS_IDS);
        antiAlias = antiAliasValue.toString();
    }
    return antiAlias;
}

/* Gets current layer text info and returns the properties as an object*/
TEXT.getLayerTextItemObject = function () {
    app.refreshFonts();

    // Get the descriptor for the text layer with all styles resolved
    var argsDesc = new ActionDescriptor();
    argsDesc.putBoolean(PSKey.ResolveAllStyles, true);
    var textDesc = UTIL.getLayerProperty(PSKey.Text, argsDesc);

    // get the style descriptor for the first range in the layer.
    var tsr = textDesc.getList(PSClass.TextStyleRange);
    var tsr0 = tsr.getObjectValue(0);
    var textStyleDesc = tsr0.getObjectValue(PSClass.TextStyle);

    // Orientation and antiAlias are in the top-level descriptor
    return TEXT.makeTextItemObjectFromDesc(textStyleDesc, getOrientationFromDesc(textDesc), getAntiAliasFromDesc(textDesc));
};

// Makes a text item object based on a descriptor ID pushed from Photoshop. The descriptor
// contains a text style descriptor, orientation, and antialias.
TEXT.makeTextItemObjectJSONFromPushDescID = function (descID) {
    var returnValue;
    try {
        var pushDesc = new ActionDescriptor();
        pushDesc.fromID(descID);
        var textStyleDesc = pushDesc.getObjectValue(PSClass.TextStyle);

        var textItemObject = TEXT.makeTextItemObjectFromDesc(textStyleDesc, getOrientationFromDesc(pushDesc), getAntiAliasFromDesc(pushDesc));
        returnValue = JSON.stringify(textItemObject);
    } catch (ex) {
        $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-makeTextItemObjectJSONFromPushDescID()', ex);
    }

    return returnValue;
};

// The orientation and anti alias are passed in separately because they are not part of
// the style descriptor (they're in the text descriptor at the layer level).

TEXT.makeTextItemObjectFromDesc = function (textStyleDesc, orientation, antiAlias) {

    var obj = {};

    // The postscript name for a font is available for all text items even with fonts which are unavailabe. It is only unreported when the
    // font is set to the default font e.g. MyriadPro-Regular.
    var fontPS = textStyleDesc.hasKey(PSString.fontPostScriptName) ? textStyleDesc.getString(PSString.fontPostScriptName) : 'MyriadPro-Regular',
        fontObj;
    try {
        fontObj = app.fonts.getByName(fontPS); // If the font is unavailabe this call throws an exception
    } catch (e) {
        return false; // Return false to indicate there is no font information IE unavailable font
    }

    obj.adbeFont = {
        family: fontObj.family,
        name: fontObj.name,
        postScriptName: fontObj.postScriptName,
        style: fontObj.style
    };

    obj.fontFamily = fontObj.family;

    var style = fontObj.style.toLowerCase();
    if (style.indexOf('italic') !== -1) {
        obj.fontStyle = 'italic';
    } else if (style.indexOf('oblique') !== -1) {
        obj.fontStyle = 'oblique';
    }

    if (style.indexOf('bold') !== -1) {
        obj.fontWeight = 'bold';
    }

    if (style.indexOf('light') !== -1 || style.indexOf('thin') !== -1) {
        obj.fontWeight = 'lighter';
    }

    var uv;
    if (textStyleDesc.hasKey(PSKey.ImpliedFontSize)) {
        var sizeValue = textStyleDesc.getUnitDoubleValue(PSKey.ImpliedFontSize),
            sizeUnitType = textStyleDesc.getUnitDoubleType(PSKey.ImpliedFontSize);
        uv = new UnitValue(sizeValue.toString() + " " + tTSID(sizeUnitType).replace("Unit", ""));
        obj.fontSize = {
            type: uv.type,
            value: uv.value
        };
    } else {
        uv = new UnitValue("12", "pt");
        obj.fontSize = {
            type: uv.type,
            value: uv.value
        };
    }

    if (textStyleDesc.hasKey(PSString.AutoLeading) && textStyleDesc.getBoolean(PSString.AutoLeading)) {
        obj.adbeAutoLeading = true;
    }

    if (textStyleDesc.hasKey(PSKey.ImpliedLeading)) {
        var leadingValue = textStyleDesc.getUnitDoubleValue(PSKey.ImpliedLeading),
            leadingUnitType = textStyleDesc.getUnitDoubleType(PSKey.ImpliedLeading),
            leadingUV = new UnitValue(leadingValue.toString() + " " + tTSID(leadingUnitType).replace("Unit", ""));
        obj.lineHeight = {
            type: leadingUV.type,
            value: leadingUV.value
        };
    }

    if (textStyleDesc.hasKey(PSKey.ImpliedBaselineShift)) {
        var baselineValue = textStyleDesc.getUnitDoubleValue(PSKey.ImpliedBaselineShift),
            baselineUnitType = textStyleDesc.getUnitDoubleType(PSKey.ImpliedBaselineShift),
            bUv = new UnitValue(baselineValue.toString() + " " + tTSID(baselineUnitType).replace("Unit", ""));
        obj.baselineShift = {
            type: bUv.type,
            value: bUv.value
        };
    }

    if (textStyleDesc.hasKey(PSClass.Color)) {
        var color = textStyleDesc.getObjectValue(PSClass.Color);
        obj.color = COLOR.descriptorToColorData(color);
    } else {
        var tmpColor = new SolidColor();
        tmpColor.rgb.red = 0;
        tmpColor.rgb.green = 0;
        tmpColor.rgb.blue = 0;
        obj.color = COLOR.solidColorToData(tmpColor); //If Photoshop messes up and gives us no color create a new color object (defaults to black)
    }


    if (textStyleDesc.hasKey(PSKey.Tracking)) {
        obj.adbeTracking = textStyleDesc.getInteger(PSKey.Tracking);
        // Adobe tracking is a value of thousandths of an em so store that value for CSS letter-spacing
        obj.letterSpacing = {
            type: 'em',
            value: (obj.adbeTracking / 1000.0).toFixed(2)
        };
    }


    if (textStyleDesc.hasKey(PSKey.NoBreak) && textStyleDesc.getBoolean(PSKey.NoBreak)) {
        obj.whiteSpace = 'nowrap';
    }

    if (textStyleDesc.hasKey(PSKey.HorizontalScale)) {
        obj.adbeHorizontalScale = textStyleDesc.getDouble(PSKey.HorizontalScale);
    }

    if (textStyleDesc.hasKey(PSKey.VerticalScale)) {
        obj.adbeVerticalScale = textStyleDesc.getDouble(PSKey.VerticalScale);
    }

    if (textStyleDesc.hasKey(PSKey.SyntheticBold) && textStyleDesc.getBoolean(PSKey.SyntheticBold)) {
        obj.adbePhxsFauxBold = true;
    } else {
        obj.adbePhxsFauxBold = false;
    }

    if (textStyleDesc.hasKey(PSKey.SyntheticItalic) && textStyleDesc.getBoolean(PSKey.SyntheticItalic)) {
        obj.adbePhxsFauxItalic = true;
    } else {
        obj.adbePhxsFauxItalic = false;
    }

    if (orientation) {
        obj.adbePhxsDirection = orientation;
    }


    if (textStyleDesc.hasKey(PSKey.Underline) && textStyleDesc.getEnumerationValue(PSKey.Underline) !== PSString.UNDERLINE_TYPE_IDS[UnderlineType.UNDERLINEOFF]) {
        if (obj.textDecoration) {
            obj.textDecoration.push('underline');
        } else {
            obj.textDecoration = ['underline'];
        }
        obj.adbePhxsUnderline = textStyleDesc.getEnumerationValue(PSKey.Underline) === PSString.underlineOnLeftInVertical ? UnderlineType.UNDERLINELEFT.toString() : UnderlineType.UNDERLINERIGHT.toString();
    }


    if (textStyleDesc.hasKey(PSString.strikethrough) && textStyleDesc.getEnumerationValue(PSString.strikethrough) !== PSString.STRIKETHRU_TYPE_IDS[StrikeThruType.STRIKEOFF]) {
        if (obj.textDecoration) {
            obj.textDecoration.push('line-through');
        } else {
            obj.textDecoration = ['line-through'];
        }
        obj.adbePhxsStrikethru = textStyleDesc.getEnumerationValue(PSString.strikethrough) === PSString.STRIKETHRU_TYPE_IDS[StrikeThruType.STRIKEHEIGHT] ? StrikeThruType.STRIKEHEIGHT.toString() : StrikeThruType.STRIKEBOX.toString();
    }

    obj.fontFeatureSettings = [];
    if (textStyleDesc.hasKey(PSKey.OldStyle) && textStyleDesc.getBoolean(PSKey.OldStyle)) {
        obj.fontFeatureSettings.push('onum');
    }

    if (textStyleDesc.hasKey(PSKey.AltLigature) && textStyleDesc.getBoolean(PSKey.AltLigature)) {
        obj.fontFeatureSettings.push('dlig');
    }

    if (textStyleDesc.hasKey(PSKey.Ligature) && textStyleDesc.getBoolean(PSKey.Ligature)) {
        obj.fontFeatureSettings.push('liga');
    }

    if (textStyleDesc.hasKey(PSKey.StylisticAlternates) && textStyleDesc.getBoolean(PSKey.StylisticAlternates)) {
        obj.fontFeatureSettings.push('salt');
    }

    if (textStyleDesc.hasKey(PSKey.Swash) && textStyleDesc.getBoolean(PSKey.Swash)) {
        obj.fontFeatureSettings.push('swsh');
    }

    if (textStyleDesc.hasKey(PSKey.Fractions) && textStyleDesc.getBoolean(PSKey.Fractions)) {
        obj.fontFeatureSettings.push('frac');
    }

    if (textStyleDesc.hasKey(PSKey.Titling) && textStyleDesc.getBoolean(PSKey.Titling)) {
        obj.fontFeatureSettings.push('titl');
    }

    if (textStyleDesc.hasKey(PSKey.ContextualLigatures) && textStyleDesc.getBoolean(PSKey.ContextualLigatures)) {
        obj.fontFeatureSettings.push('clig');
    }

    if (textStyleDesc.hasKey(PSKey.Ordinals) && textStyleDesc.getBoolean(PSKey.Ordinals)) {
        obj.fontFeatureSettings.push('ordn');
    }

    if (textStyleDesc.hasKey(PSKey.Ornaments) && textStyleDesc.getBoolean(PSKey.Ornaments)) {
        obj.fontFeatureSettings.push('ornm');
    }

    if (textStyleDesc.hasKey(PSKey.FontCaps)) {
        var id = UTIL.idToConstant(textStyleDesc.getEnumerationValue(PSKey.FontCaps), PSString.TEXT_CASE_IDS);
        if (id === TextCase.SMALLCAPS.toString()) {
            obj.fontFeatureSettings.push('smcp');
        } else if (id === TextCase.ALLCAPS.toString()) {
            obj.textTransform = 'capitalize';
        }
    }

    if (textStyleDesc.hasKey(PSKey.Baseline)) {
        var superSubValue = textStyleDesc.getEnumerationValue(PSKey.Baseline);
        if (superSubValue === PSKey.SuperScript) {
            obj.fontFeatureSettings.push('sups');
        } else if (superSubValue === PSKey.SubScript) {
            obj.fontFeatureSettings.push('subs');
        }
    }

    //If we have no open type settings delete the empty array
    if (obj.fontFeatureSettings.length === 0) {
        delete obj.fontFeatureSettings;
    }

    // Set Auto Kerning
    if (textStyleDesc.hasKey(PSKey.AutoKerning)) {
        var autoKernValue = UTIL.idToConstant(textStyleDesc.getEnumerationValue(PSKey.AutoKerning), PSString.AUTO_KERN_IDS);
        obj.adbePhxsAutoKerning = autoKernValue.toString();
    }

    // Set Anti Alias Method
    if (antiAlias) {
        obj.adbePhxsAntiAliasMethod = antiAlias;
    }


    return obj;
};


TEXT.getStylePostScriptName = function (style) {
    app.refreshFonts();
    var i;
    var fontPostScriptName = false;
    if (style.adbeFont) {
        try {
            //If the font is not available then getByName throws an exception
            app.fonts.getByName(style.adbeFont.postScriptName);
            fontPostScriptName = style.adbeFont.postScriptName;
        } catch (ignore) {}
    } else if (style.fontFamily) {
        //If all we have is the font-family then try to use that
        var font;
        for (i = 0; i < app.fonts.length; i++) {
            font = app.fonts[i];
            if (font.family === style.fontFamily) {
                fontPostScriptName = font.postScriptName;
                break;
            }
        }
    }
    return fontPostScriptName;
};


TEXT.isFontAvailable = function (style) {
    return TEXT.getStylePostScriptName(style) !== false;
};


TEXT.applyStyleToText = function (layerIndex, style, fontPostScriptName) {
    var i;
    // Get the text descriptor for the current layer
    var ref = new ActionReference();
    ref.putProperty(PSClass.Property, PSKey.Text); // only retrieve text info
    ref.putIndex(PSClass.Layer, layerIndex);
    var resultDesc = executeActionGet(ref);

    // If the resultDesc does not contain any text information we
    // are looking at a non text layer and should abort
    if (!resultDesc.hasKey(PSKey.Text)) {
        return;
    }

    //Retrieve Font Information once for all applications of the
    if (fontPostScriptName === undefined) {
        fontPostScriptName = TEXT.getStylePostScriptName(style);
    }

    // Get the text information descriptor
    var textDesc = resultDesc.getObjectValue(PSKey.Text);

    // Rather than round-tripping the descriptor with our mods, we start with
    // an empty descriptor and only fill in what we need, thereby providing a
    // "sparse" descriptor.
    //
    // Given recent optimizations to Photoshop, this isn't critical anymore,
    // but it does provide marginal gains in some cases. Omitting the paragraph
    // style ranges, which we do not modify, is definitelly still important.
    var newTextDesc = new ActionDescriptor();

    // Tell PS that we want to merge the style attributes we are providing with
    // the layer's existing style, rather than having un-specified attributes get
    // changed to their default values. Necessary when not round-tripping.
    newTextDesc.putBoolean(PSKey.Merge, true);

    // If there is a transform that has scaling, remove the scaling from the
    // transform. This will result in copy/paste and PS native char/paragraph
    // styles capturing the values that the user sees, rather than the internal
    // values prior to the transform-scaling.
    if (textDesc.hasKey(PSKey.Transform)) {
        var xformYScale = 1.0;
        var sx = 0;
        var sy = 0;

        var xformDesc = textDesc.getObjectValue(PSKey.Transform);

        var xfm = function (key) {
            return xformDesc.getDouble(key);
        };
        var sqr = function (x) {
            return x * x;
        };

        // Re-construct the rotate parameters from the matrix
        var r1 = Math.atan2(xfm(PSKey.Yx), xfm(PSKey.Yy));
        var r2 = Math.atan2(-xfm(PSKey.Xy), xfm(PSKey.Xx));

        // Reset the matrix to account for the new scale.

        // If both rotates are the "same", treat it as a rotate + scale
        // matrix, Otherwise, treat it as a skew matrix, taking
        // the skew values (vx, vy) from the source matrix
        var treatAsRotate = (Math.abs(r1 - r2) < 0.0001);

        // Re-construct the scale values
        if (treatAsRotate) {
            sx = Math.sqrt(sqr(xfm(PSKey.Xx)) + sqr(xfm(PSKey.Xy)));
            sy = Math.sqrt(sqr(xfm(PSKey.Yx)) + sqr(xfm(PSKey.Yy)));
        } else {
            sx = xfm(PSKey.Xx);
            sy = xfm(PSKey.Yy);
        }

        // remember our scaling so we can scale the box
        xformYScale = sy;

        if (xformYScale !== 1.0) {

            // Factor out the y scaling from the transform
            sx = sx / xformYScale;
            sy = 1;

            // Now that we have calculated all the new values, update the desc
            if (treatAsRotate) {
                xformDesc.putDouble(PSKey.Xx, sx * Math.cos(r1));
                xformDesc.putDouble(PSKey.Xy, -sx * Math.sin(r1));
                xformDesc.putDouble(PSKey.Yx, sy * Math.sin(r1));
                xformDesc.putDouble(PSKey.Yy, sy * Math.cos(r1));
            } else {
                // Factor out the scale matrix to get the original skew values.
                var vx = xfm(PSKey.Yx) / sy;
                var vy = xfm(PSKey.Xy) / sx;

                xformDesc.putDouble(PSKey.Xx, sx);
                xformDesc.putDouble(PSKey.Xy, sx * vy);
                xformDesc.putDouble(PSKey.Yx, sy * vx);
                xformDesc.putDouble(PSKey.Yy, sy);
            }

            // put the modified xform desc back into the text desc
            newTextDesc.putObject(PSKey.Transform, PSKey.Transform, xformDesc);

            // If we set the transform, then we need to propagate the click point
            // which controls the position of point type layers.
            if (textDesc.hasKey(PSKey.TextClickPoint)) {
                newTextDesc.putObject(PSKey.TextClickPoint, PSClass.Point, textDesc.getObjectValue(PSKey.TextClickPoint));
            }

            // We can't modify nested descriptor values in-place, so here we loop through
            // the text shape list, modify each style descriptor, and build up a
            // new range list to put back in the master descriptor.
            var newShapeList = new ActionList();

            var shapeList = textDesc.getList(PSKey.TextShape);
            var shapeDesc, boundDesc;

            for (i = 0; i < shapeList.count; i++) {

                shapeDesc = shapeList.getObjectValue(i);

                if (shapeDesc.getEnumerationValue(PSKey.Char) === PSEnum.Box) {
                    //  modify box bounds
                    boundDesc = shapeDesc.getObjectValue(PSKey.Bounds);
                    boundDesc.putDouble(PSKey.Bottom, boundDesc.getDouble(PSKey.Bottom) * xformYScale);
                    boundDesc.putDouble(PSKey.Right, boundDesc.getDouble(PSKey.Right) * xformYScale);

                    // Update the shape with the new bounds
                    shapeDesc.putObject(PSKey.Bounds, PSKey.Bounds, boundDesc);
                }

                // Add the shape to our new list
                newShapeList.putObject(PSKey.TextShape, shapeDesc);
            }

            // Replace the text style range list with our new one
            newTextDesc.putList(PSKey.TextShape, newShapeList);

        } // xformYScale != 1.0
    }

    // Preserve warps
    if (textDesc.hasKey(PSString.WARP)) {
        var warpDesc = textDesc.getObjectValue(PSString.WARP);
        newTextDesc.putObject(PSString.WARP, PSString.WARP, warpDesc);
    }

    // Set the text direction orientation Vertical | Horizontal
    newTextDesc.putEnumerated(PSString.ORIENTATION, PSString.ORIENTATION,
        style.adbePhxsDirection ? PSString.DIRECTION_IDS[Direction[style.adbePhxsDirection.split('.', 2)[1]]] : PSString.DIRECTION_IDS[Direction.HORIZONTAL]);

    // Set the Anti alias method
    if (style.adbePhxsAntiAliasMethod) {
        //This try catch is ugly but there is no good way to test whether the AntiAlias constants is defined or undefined in JSX
        try {
            if (AntiAlias[style.adbePhxsAntiAliasMethod.split('.', 2)[1]]) {
                newTextDesc.putEnumerated(PSString.ANTI_ALIAS, PSString.ANTI_ALIAS_TYPE, PSString.ANTI_ALIAS_IDS[AntiAlias[style.adbePhxsAntiAliasMethod.split('.', 2)[1]]]);
            }
        } catch (err) {
            newTextDesc.putEnumerated(PSString.ANTI_ALIAS, PSString.ANTI_ALIAS_TYPE, PSString.ANTI_ALIAS_IDS[style.adbePhxsAntiAliasMethod]);
        }
    }

    // We can't modify nested descriptor values in-place, so here we loop through the
    // text style range list, updating each range descriptor with a new style descriptor,
    // and build up a new range list to put back in the master descriptor.
    var newTsrList = new ActionList();

    var currTextRange, solidColor, colorDesc;
    var size, leading, baselineShift, newTextStyle;

    var tsrList = textDesc.getList(PSClass.TextStyleRange);

    var hasFontFeatureSettings = style.fontFeatureSettings !== undefined && style.fontFeatureSettings.length > 0;

    for (i = 0; i < tsrList.count; i++) {

        // REVISIT (TBL): Construction of newTextStyle can be moved outside the loop
        // now that are are buildng a sparse descriptor, although the performance gains
        // are not perceptible.

        // Create a new text style descriptor which will contain the attributes
        // we need to modify.
        newTextStyle = new ActionDescriptor();

        if (fontPostScriptName) {
            newTextStyle.putString(PSString.fontPostScriptName, fontPostScriptName);
        }

        //Font Size
        if (style.fontSize !== undefined) {
            size = new UnitValue(style.fontSize.value, style.fontSize.type);
            newTextStyle.putUnitDouble(PSKey.Size, UTIL.stringToUnit(size.type), size.value);
        }

        // Set Horizontal Scale
        if (style.adbeHorizontalScale !== undefined) {
            newTextStyle.putDouble(PSKey.HorizontalScale, style.adbeHorizontalScale);
        }

        // Set Vertical Scale
        if (style.adbeVerticalScale !== undefined) {
            newTextStyle.putDouble(PSKey.VerticalScale, style.adbeVerticalScale);
        }

        // Set Faux/Synthetic Bold
        if (style.adbePhxsFauxBold !== undefined) {
            newTextStyle.putBoolean(PSKey.SyntheticBold, style.adbePhxsFauxBold ? true : false);
        }

        // Set Faux/Synthetic Italics
        if (style.adbePhxsFauxItalic !== undefined) {
            newTextStyle.putBoolean(PSKey.SyntheticItalic, style.adbePhxsFauxItalic ? true : false);
        }

        //Set auto leading
        if (style.adbeAutoLeading !== undefined) {
            newTextStyle.putBoolean(PSString.AutoLeading, style.adbeAutoLeading ? true : false);
        }

        // Set Leading
        if (style.lineHeight !== undefined) {
            newTextStyle.putBoolean(PSString.AutoLeading, false);
            leading = new UnitValue(style.lineHeight.value, style.lineHeight.type);
            newTextStyle.putUnitDouble(PSKey.Leading, UTIL.stringToUnit(leading.type), leading.value);
        }

        // Set Tracking
        if (style.adbeTracking !== undefined) {
            newTextStyle.putInteger(PSKey.Tracking, style.adbeTracking);
        } else if (style.letterSpacing) {
            newTextStyle.putInteger(PSKey.Tracking, style.letterSpacing.value * 1000);
        }

        // Set Baseline shift
        if (style.baselineShift !== undefined) {
            baselineShift = new UnitValue(style.baselineShift.value, style.baselineShift.type);
            newTextStyle.putUnitDouble(PSKey.BaselineShift, UTIL.stringToUnit(baselineShift.type), baselineShift.value);
        }

        // Set Auto Kerning
        if (style.adbePhxsAutoKerning) {
            newTextStyle.putEnumerated(PSKey.AutoKerning, PSKey.AutoKerning, PSString.AUTO_KERN_IDS[AutoKernType[style.adbePhxsAutoKerning.split('.', 2)[1]]]);
        }

        // Set no break
        if (style.whiteSpace && style.whiteSpace === 'nowrap') {
            newTextStyle.putBoolean(PSKey.NoBreak, false);
        }

        //Underline - use PHXS underline if it exists or text-decoration property otherwise
        if (style.adbePhxsUnderline) {
            newTextStyle.putEnumerated(PSKey.Underline, PSKey.Underline, PSString.UNDERLINE_TYPE_IDS[UnderlineType[style.adbePhxsUnderline.split('.', 2)[1]]]);
        } else if (style.textDecoration && style.textDecoration.indexOf('underline') !== -1) {
            newTextStyle.putEnumerated(PSKey.Underline, PSKey.Underline, PSString.UNDERLINE_TYPE_IDS[UnderlineType.UNDERLINELEFT]);
        } else {
            newTextStyle.putEnumerated(PSKey.Underline, PSKey.Underline, PSString.UNDERLINE_TYPE_IDS[UnderlineType.UNDERLINEOFF]);
        }

        //StrikeThru - use PHXS strikeThru if it exists or text-decoration property otherwise
        if (style.adbePhxsStrikethru) {
            newTextStyle.putEnumerated(PSString.strikethrough, PSString.strikethrough, PSString.STRIKETHRU_TYPE_IDS[StrikeThruType[style.adbePhxsStrikethru.split('.', 2)[1]]]);
        } else if (style.textDecoration && style.textDecoration.indexOf('line-through') !== -1) {
            newTextStyle.putEnumerated(PSString.strikethrough, PSString.strikethrough, PSString.STRIKETHRU_TYPE_IDS[StrikeThruType.STRIKEHEIGHT]);
        } else {
            newTextStyle.putEnumerated(PSString.strikethrough, PSString.strikethrough, PSString.STRIKETHRU_TYPE_IDS[StrikeThruType.STRIKEOFF]);
        }

        // Set capitalization (SmallCaps/AllCaps/Normal)
        if (hasFontFeatureSettings && style.fontFeatureSettings.indexOf('smcp') !== -1) {
            newTextStyle.putEnumerated(PSKey.FontCaps, PSKey.FontCaps, PSString.TEXT_CASE_IDS[TextCase.SMALLCAPS]);
        } else if (style.textTransform === 'capitalize') {
            newTextStyle.putEnumerated(PSKey.FontCaps, PSKey.FontCaps, PSString.TEXT_CASE_IDS[TextCase.ALLCAPS]);
        } else {
            newTextStyle.putEnumerated(PSKey.FontCaps, PSKey.FontCaps, PSString.TEXT_CASE_IDS[TextCase.NORMAL]);
        }

        newTextStyle.putBoolean(PSKey.OldStyle, hasFontFeatureSettings && style.fontFeatureSettings.indexOf('onum') !== -1);

        newTextStyle.putBoolean(PSKey.AltLigature, hasFontFeatureSettings && style.fontFeatureSettings.indexOf('dlig') !== -1);

        newTextStyle.putBoolean(PSKey.Ligature, hasFontFeatureSettings && style.fontFeatureSettings.indexOf('liga') !== -1);

        newTextStyle.putBoolean(PSKey.StylisticAlternates, hasFontFeatureSettings && style.fontFeatureSettings.indexOf('salt') !== -1);

        newTextStyle.putBoolean(PSKey.Swash, hasFontFeatureSettings && style.fontFeatureSettings.indexOf('swsh') !== -1);

        newTextStyle.putBoolean(PSKey.Fractions, hasFontFeatureSettings && style.fontFeatureSettings.indexOf('frac') !== -1);

        newTextStyle.putBoolean(PSKey.Titling, hasFontFeatureSettings && style.fontFeatureSettings.indexOf('titl') !== -1);

        newTextStyle.putBoolean(PSKey.Ordinals, hasFontFeatureSettings && style.fontFeatureSettings.indexOf('ordn') !== -1);

        newTextStyle.putBoolean(PSKey.Ornaments, hasFontFeatureSettings && style.fontFeatureSettings.indexOf('ornm') !== -1);

        newTextStyle.putBoolean(PSKey.ContextualLigatures, hasFontFeatureSettings && style.fontFeatureSettings.indexOf('clig') !== -1);

        if (hasFontFeatureSettings && style.fontFeatureSettings.indexOf('subs') !== -1) {
            newTextStyle.putEnumerated(PSKey.Baseline, PSKey.Baseline, PSKey.SubScript);
        } else if (hasFontFeatureSettings && style.fontFeatureSettings.indexOf('sups') !== -1) {
            newTextStyle.putEnumerated(PSKey.Baseline, PSKey.Baseline, PSKey.SuperScript);
        } else {
            newTextStyle.putEnumerated(PSKey.Baseline, PSKey.Baseline, PSKey.BaselineNormal);
        }


        if (style.color) {
            solidColor = COLOR.dataToSolidColor(style.color);
            colorDesc = COLOR.solidColorToDescriptor(solidColor);
            newTextStyle.putObject(PSKey.Color, colorDesc.type, colorDesc.descriptor);
        }

        // Replace the current range desc's style desc with the modified one and add the
        // modified range desc to our new text style range list
        currTextRange = tsrList.getObjectValue(i);
        currTextRange.putObject(PSClass.TextStyle, PSClass.TextStyle, newTextStyle);
        newTsrList.putObject(PSClass.TextStyleRange, currTextRange);
    }

    // Replace the text style range list with our new one
    newTextDesc.putList(PSClass.TextStyleRange, newTsrList);

    // Put together a "set text" descriptor with our modified text desc
    // and execute it.

    var eventDesc = new ActionDescriptor();
    var sheetRef = new ActionReference();
    sheetRef.putIndex(PSKey.LayerKey, layerIndex);
    eventDesc.putReference(PSKey.Target, sheetRef);
    eventDesc.putObject(PSKey.To, PSClass.TextLayer, newTextDesc);
    executeAction(PSEvent.Set, eventDesc, DialogModes.NO);
};

TEXT.getLayerFont = function () {
    return TEXT.getLayerTextItemObject();
};


TEXT.setFont = function (typography, historyName) {
    JSXGlobals.styleToApply = typography;

    if (!historyName) {
        historyName = "<Missing History Name>";
    }

    function doSetFont() {
        var currentTypography = JSXGlobals.styleToApply;
        try {

            //Retrieve Font Information once for all applications of the
            var fontPostScriptName = TEXT.getStylePostScriptName(currentTypography);

            var layers = [];
            try {
                layers = getSelectedLayerIndices();
            } catch (e) {
                return;
            }
            var layerIndex;
            for (layerIndex = 0; layerIndex < layers.length; layerIndex++) {
                TEXT.applyStyleToText(layers[layerIndex], currentTypography, fontPostScriptName);
            }
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-doSetFont()', ex);
        }
    }

    // Placate JSLint ('not used' error)
    if (!doSetFont) {
        return;
    }

    app.activeDocument.suspendHistory(historyName, 'doSetFont();');
};

TEXT.createFontLayer = function (typography, historyName) {
    try {
        function doCreateFontLayer(typography) {
            var selectedLayer = app.activeDocument.artLayers.add();
            selectedLayer.name = typography.adbeFont.family;
            selectedLayer.kind = LayerKind.TEXT;
            selectedLayer.textItem.contents = typography.adbeFont.family;

            //TEXT.applyStyleToText(selectedLayer.textItem, typography);
            TEXT.setFont(typography);
        }
        // Placate JSLint ('not used' error)
        if (!doCreateFontLayer) {
            return;
        }
        app.activeDocument.suspendHistory(historyName, "doCreateFontLayer(typography);");
    } catch (ex) {
        $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-createFontLayer()', ex);
    }
};

TEXT.saveTextStylePreview = function (fontInfo) {
    try {
        var selectedLayer = app.activeDocument.activeLayer;
        if (selectedLayer && selectedLayer.kind === LayerKind.TEXT) {

            var previewPath = Folder.temp.fsName + "/TextPreview" + $.hiresTimer + ".png";
            var textColor = new SolidColor();
            textColor.rgb.red = 0; // a light yellow-ish orange, so we can check the channel values
            textColor.rgb.green = 0;
            textColor.rgb.blue = 0;

            var postScriptName = 'MyriadPro-Regular';
            try {
                postScriptName = fontInfo.adbeFont.postScriptName;
            } catch (ignore) {}

            app.thumbnailText(new File(previewPath), JSXGlobals.textPreviewString, postScriptName, JSXGlobals.textPreviewFontSize, textColor);

            return previewPath;
        }

    } catch (ex) {
        $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-saveTextStylePreview()', ex);
    }
};

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50, sloppy: true, continue: true */
/*global $, Folder, app, DocumentFill, ActionDescriptor, ActionReference, DialogModes, File, UTIL,
         TypeUnits, ActionList, SolidColor, executeAction, executeActionGet, PhotoshopSaveOptions, SaveOptions, PNGSaveOptions,
         LayerKind, cssToClip, svg, ColorModel, JSXGlobals, PSKey, PSClass, PSString, PSType, PSEnum, PSEvent */

var LAYERSTYLE = {};

LAYERSTYLE.hasLayerStyles = function () {
    return (UTIL.getLayerProperty(PSClass.LayerEffects) !== undefined);
};

LAYERSTYLE.saveLayerStyle = function () {
    var strLayerName = $._ADBE_LIBS_PHXS.getLayerName();
    var fileData = {
        'layerName': strLayerName,
        files: []
    };

    if (LAYERSTYLE.hasLayerStyles()) {
        try {
            var randomNum = $.hiresTimer;
            var aslPath = Folder.temp.fsName + "/LayerStyle" + randomNum + ".asl";
            var aslFile = new File(aslPath);
            app.activeDocument.activeLayer.saveStyleFile(aslFile);
            fileData.files.push(aslPath);

            var pngPath = Folder.temp.fsName + "/LayerStyle" + randomNum + ".png";
            app.thumbnailStyleFile(aslFile, new File(pngPath));
            fileData.rendition = pngPath;
        } catch (ignore) {}
    }

    return JSON.stringify(fileData);
};

LAYERSTYLE.saveLayerStyleByIndex = function (styleIndex) {
    var result = {};
    try {
        var saveDesc = new ActionDescriptor();

        var refDesc = new ActionReference();
        refDesc.putIndex(PSKey.Style, styleIndex);
        saveDesc.putReference(PSKey.Target, refDesc);

        var randomNum = $.hiresTimer;
        var aslPath = Folder.temp.fsName + "/LayerStyle" + randomNum + ".asl";
        var aslFile = new File(aslPath);
        saveDesc.putPath(PSKey.To, aslFile);

        executeAction(PSKey.Save, saveDesc, DialogModes.ERROR);

        result.aslPath = aslPath;

        // The preview can be saved as part of the save action, but the size and
        // bg color params are ignored, so just use the separate thumbnailStyleFile()
        // API like we do elsewhere.
        var pngPath = Folder.temp.fsName + "/LayerStyle" + randomNum + ".png";
        app.thumbnailStyleFile(aslFile, new File(pngPath));
        result.previewPath = pngPath;
    } catch (ignore) {}

    return JSON.stringify(result);
};

LAYERSTYLE.applyLayerStyle = function (filePath) {
    app.activeDocument.activeLayer.applyStyleFile(new File(filePath));
};






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





/*********************************************
 XMPLib.jsx
 */
/************************************************************************************************************
General XMP Functions
    **/

function XMPHelper(namespace) {
	this.namespace=namespace;
	// load the library. This is a one-time thing.
	if (ExternalObject.AdobeXMPScript == undefined) {
		ExternalObject.AdobeXMPScript = new ExternalObject("lib:AdobeXMPScript");
	}

	// We need to simulate the same namespace as the links panel did before. So
	var namespaceObj = new Namespace ('link', this.namespace);
	XMPMeta.registerNamespace(this.namespace, 'NineSlicer');
}



/***************************
	* XMPHelper.getXMPFor
	*
	* Gets the XMP metadata for the passed in layer
	*
	*/
XMPHelper.prototype.getXMPFrom = function(object) {
	try{
		return new XMPMeta(object.xmpMetadata.rawData);
	} catch(error) {
		// The exception means the xmp does not exist. So we need to create it.
		LogIt("XMPHelper.prototype.getXMPFrom Error: No XMPMetadata for this object: "+object.toString());
		return new XMPMeta();
	}
};

/***************************
	* XMPHelper.getXMPFor
	*
	* Gets the XMP metadata for the passed in layer
	*
	*/
XMPHelper.prototype.saveXMP = function(object, xmp) {
	object.xmpMetadata.rawData = xmp.serialize();
};

/*******************
	* getDateFileModified
	*
	* Inputs: file -- the file to check
	* Output: A string, in XMPDateTime format, from when the file was last modified
	*
	*/
XMPHelper.prototype.getDateFileModified=function (file) {
	// Note: The original links panel used a date from the XMP metadata using XMPFile. Not sure why, because it only works for files that support XMP data, not regular files like images.
	// Would there be some benefit to using that information when it's available?
	var date = file.modified;
	if (date==null) // unlikely, perhaps impossible, but why not have a fall back here?
		date = file.created;
	// This is a good text date format for us to use.
	date = new XMPDateTime(date);
	return date.toString();
};

/**
 * @param {XMPMeta} xmp
 * @param {string} namespace
 * @param {string} property
 * @return {*}
 */
XMPHelper.prototype.getStringProperty = function(xmp,namespace, property) {
	var prop = xmp.getProperty(namespace, property);
	if(prop != null && prop!= undefined) {
		return prop.value;
	}else {
		return null;
	}
};






/*********************************************
 PsdLib.jsx
 */
try {
	PsdLib = function PsdLib() {

	};

	PsdLib.getSelectedLayersIndex = function () {
		var selectedLayers = new Array;
		var ref = new ActionReference();
		ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
		var desc = executeActionGet(ref);
		if (desc.hasKey(stringIDToTypeID('targetLayers'))) {
			desc = desc.getList(stringIDToTypeID('targetLayers'));
			var c = desc.count;
			var selectedLayers = new Array();
			for (var i = 0; i < c; i++) {
				try {
					activeDocument.backgroundLayer;
					selectedLayers.push(desc.getReference(i).getIndex());
				} catch (e) {
					selectedLayers.push(desc.getReference(i).getIndex() + 1);
				}
			}
		} else {
			var ref = new ActionReference();
			ref.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("ItmI"));
			ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
			try {
				activeDocument.backgroundLayer;
				selectedLayers.push(executeActionGet(ref).getInteger(charIDToTypeID("ItmI")) - 1);
			} catch (e) {
				selectedLayers.push(executeActionGet(ref).getInteger(charIDToTypeID("ItmI")));
			}
		}
		return selectedLayers;
	};


// Credits to Mike Hale for coming up with this. It's posted on his PS-scripts board.
	PsdLib.makeActiveByIndex = function (index, forceVisible) {
		try {
			var desc = new ActionDescriptor();
			var ref = new ActionReference();
			ref.putIndex(charIDToTypeID("Lyr "), index);
			desc.putReference(charIDToTypeID("null"), ref);
			desc.putBoolean(charIDToTypeID("MkVs"), forceVisible);
			executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
		} catch (e) {
			LogIt("PsdLib.makeActiveByIndex: index=" + index + ", could not make active due to Error:" + e.toString());
			return -1;
		}
	};

	PsdLib.getNumberOfLayers = function () {
		// Ask photoshop how many layers there are in the document:
		var ref = new ActionReference();
		ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
		var desc = executeActionGet(ref);
		return desc.getInteger(charIDToTypeID("NmbL"));
	};

	PsdLib.isValidActiveLayer = function (index) {
		try {
			var propName = stringIDToTypeID('layerSection');// can't replace
			var ref = new ActionReference();
			ref.putProperty(1349677170, propName);// TypeID for "Prpr"
			// 'Lyr ", index
			ref.putIndex(1283027488, index);
			var desc = executeActionGet(ref);
			var type = desc.getEnumerationValue(propName);
			var res = typeIDToStringID(type);
			return res != 'layerSectionEnd';
		} catch (e) {
			// The one time I got this during production (just now), it was my Empty.psd file that has only one layer -- a background layer which wasn't a valid target.
			LogIt("PsdLib.isValidActiveLayer: got an exception when trying to check, so we'll say it's not a valid layer.");
			return false;
		}
	};


	PsdLib.isDocumentStillOpen = function (docRef) {
		try {
			docRef.layers;
			return true;
		} catch (e) {
			// If it's closed, it would through a "ReferenceError: Object is invalid" at the above line. If you want to see it in the JavaScript console, uncomment the following line.
			//$.writeln("e="+e);
			return false;
		}
	};

	PsdLib.getLayerBounds = function () {
		var bounds = {};
		bounds.left = app.activeDocument.activeLayer.bounds[0].as("pixels");
		bounds.top = app.activeDocument.activeLayer.bounds[1].as("pixels");
		bounds.right = app.activeDocument.activeLayer.bounds[2].as("pixels");
		bounds.bottom = app.activeDocument.activeLayer.bounds[3].as("pixels");
		bounds.width = bounds.right - bounds.left;
		bounds.height = bounds.bottom - bounds.top;
		return bounds;
	};

	PsdLib.getLayerBoundsByID = function (_id) {
		var myObj = {};
		var ref = new ActionReference();
		ref.putIdentifier(charIDToTypeID('Lyr '), _id);
		var bounds = executeActionGet(ref).getObjectValue(stringIDToTypeID("bounds"));
		myObj.top = bounds.getDouble(stringIDToTypeID("top"));
		myObj.left = bounds.getDouble(stringIDToTypeID("left"));
		myObj.right = bounds.getDouble(stringIDToTypeID("right"));
		myObj.bottom = bounds.getDouble(stringIDToTypeID("bottom"));
		return myObj;
	};

	PsdLib.getLayerById = function(id) {
		var ref = new ActionReference();
		ref.putIdentifier(charIDToTypeID('Lyr '), id);
		return executeActionGet(ref);
	};

	PsdLib.getDocumentById = function (id) {
		var ref = new ActionReference();
		ref.putIdentifier(charIDToTypeID('Dcmn'), id);
		return executeActionGet(ref);
	};


	PsdLib.getSmartObjectInternalSize = function () {
		// =======================================================
		var desc17 = new ActionDescriptor();
		executeAction(stringIDToTypeID("placedLayerEditContents"), desc17, DialogModes.NO);

		var size = {};
		size.width = app.activeDocument.width.as("pixels");
		size.height = app.activeDocument.height.as("pixels");

		app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
		return size;
	};


	PsdLib.getLargerNumberOf = function (num1, num2) {
		if (num1 > num2)
			return num1;
		return num2;
	};

	PsdLib.getSmallerNumberOf = function (num1, num2) {
		if (num1 < num2)
			return num1;
		return num2;
	};


	PsdLib.getBoundsOfTheseLayers = function (layersToSearch) {
		//var originalActiveLayer=activeDocument.activeLayer;
		var bounds = {};
		bounds.left = null;
		bounds.right = null;
		bounds.top = null;
		bounds.bottom = null;

		for (var i = 0; i < layersToSearch.length; i++) {
			// next variable is for debugging use only:
			if (!layersToSearch[i].visible)
				continue; // it's invisible, so it doesn't count towards the bounds.

			//activeDocument.activeLayer=layersToSearch[i];
			if (bounds.left == null) {
				bounds.left = layersToSearch[i].bounds[0].as("pixels");
				bounds.top = layersToSearch[i].bounds[1].as("pixels");
				bounds.right = layersToSearch[i].bounds[2].as("pixels");
				bounds.bottom = layersToSearch[i].bounds[3].as("pixels");
				continue;
			}

			bounds.left = PsdLib.getSmallerNumberOf(bounds.left, layersToSearch[i].bounds[0].as("pixels"));
			bounds.top = PsdLib.getSmallerNumberOf(bounds.top, layersToSearch[i].bounds[1].as("pixels"));
			bounds.right = PsdLib.getLargerNumberOf(bounds.right, layersToSearch[i].bounds[2].as("pixels"));
			bounds.bottom = PsdLib.getLargerNumberOf(bounds.bottom, layersToSearch[i].bounds[3].as("pixels"));
		}

		// We can get bounds that are bigger than the size of the document. This is unfortunate since it's not true once trimmed to the document (the way we're using it).
		// So, limit the size the the size of the document.
		if (bounds.left < 0)
			bounds.left = 0;
		if (bounds.top < 0)
			bounds.top = 0;
		if (bounds.bottom > activeDocument.height.as("pixels"))
			bounds.bottom = activeDocument.height.as("pixels");
		if (bounds.right > activeDocument.width.as("pixels"))
			bounds.right = activeDocument.width.as("pixels");

		bounds.width = bounds.right - bounds.left;
		bounds.height = bounds.bottom - bounds.top;

		// Reset to the original active layer.
		//activeDocument.activeLayer=originalActiveLayer;
		return bounds;
	};

	PsdLib.getBoundsOfAllLayers = function () {
		var wasMerged = false;
		// Merge visible layers so that it will rasterize all effects all in one go. (Rasterize would have to be applied and undone to every single layer, whereas flatten includes invisible layers like the background).
		if (activeDocument.layers.length > 1) {
			activeDocument.mergeVisibleLayers();
			wasMerged = true;
		}
		var bounds = PsdLib.getBoundsOfTheseLayers(activeDocument.layers);

		// Undo that merge of visible layers from above.
		if (wasMerged)
			app.activeDocument.activeHistoryState = app.activeDocument.historyStates[app.activeDocument.historyStates.length - 2];

		return bounds;
	};


	PsdLib.getSmartObjectInternalBounds = function () {
		// We can't ask the user whether they want to edit the original when we make this action happen! So we turn that off:
		debug_EditedSOHelper_autoAnswerOpenSO = false;


		// =======================================================
		var idplacedLayerEditContents = stringIDToTypeID("placedLayerEditContents");
		var desc17 = new ActionDescriptor();
		executeAction(idplacedLayerEditContents, desc17, DialogModes.NO);

		var bounds = PsdLib.getBoundsOfAllLayers();
		bounds.docWidth = app.activeDocument.width.as("pixels");
		bounds.docHeight = app.activeDocument.height.as("pixels");

		app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
		debug_EditedSOHelper_autoAnswerOpenSO = null;
		return bounds;
	};

	PsdLib.placeLinked = function(filePath) {
		var idPlc = charIDToTypeID( "Plc " );
		var desc19 = new ActionDescriptor();
		var idIdnt = charIDToTypeID( "Idnt" );
		desc19.putInteger( idIdnt, 271 );
		var idnull = charIDToTypeID( "null" );
		desc19.putPath( idnull, new File( filePath ) );
		var idLnkd = charIDToTypeID( "Lnkd" );
		desc19.putBoolean( idLnkd, true );
		var idFTcs = charIDToTypeID( "FTcs" );
		var idQCSt = charIDToTypeID( "QCSt" );
		var idQcsa = charIDToTypeID( "Qcsa" );
		desc19.putEnumerated( idFTcs, idQCSt, idQcsa );
		var idOfst = charIDToTypeID( "Ofst" );
		var desc20 = new ActionDescriptor();
		var idHrzn = charIDToTypeID( "Hrzn" );
		var idPxl = charIDToTypeID( "#Pxl" );
		desc20.putUnitDouble( idHrzn, idPxl, 0.000000 );
		var idVrtc = charIDToTypeID( "Vrtc" );
		var idPxl = charIDToTypeID( "#Pxl" );
		desc20.putUnitDouble( idVrtc, idPxl, 0.000000 );
		var idOfst = charIDToTypeID( "Ofst" );
		desc19.putObject( idOfst, idOfst, desc20 );
		executeAction( idPlc, desc19, DialogModes.NO );
		return app.activeDocument.activeLayer;
	};

	PsdLib.replaceSOContents = function(layerRef, filePath, resetSize) {
		var bounds = this.getLayerBoundsByID(layerRef.id);

		var idplacedLayerReplaceContents = stringIDToTypeID("placedLayerReplaceContents");
		var desc52 = new ActionDescriptor();
		var idnull = charIDToTypeID("null");
		desc52.putPath(idnull, new File(filePath));
		executeAction(idplacedLayerReplaceContents, desc52, DialogModes.NO);

		if (resetSize) {
			rulerUnits = preferences.rulerUnits;
			preferences.rulerUnits = Units.PIXELS;
			this.resizeToBounds(bounds.right - bounds.left, bounds.bottom - bounds.top);
		}
	};

	PsdLib.replaceSOContentsOfActiveLayer = function (filePath, resetSize) {
		var layerRef = app.activeDocument.activeLayer;
		this.replaceSOContents(layerRef, filePath, resetSize);
	};

	PsdLib.getSmartObjectRelativePath = function(document) {
		try {
			var ref = new ActionReference();
			ref.putEnumerated( 1283027488, 1332896878, 1416783732 );
			var smartDesc = executeActionGet(ref).getObjectValue(stringIDToTypeID( "smartObject" )) ;
			var file = new File(smartDesc.getPath("1282304800"));
			if(document!=undefined && document!=null)
				return file.getRelativeURI(document.path);
			else
				return file.getRelativeURI(app.activeDocument.path);
		} catch (e) {
			return null;
		}
	};

	PsdLib.getActiveDoc = function() {
		try{
			return app.activeDocument;
		}catch(e){
			return null;
		}
	};

	PsdLib.hasActiveDoc = function() {
		try{
			var doc = app.activeDocument;
			return true;
		}catch(e){
			return false;
		}
	};

	PsdLib.getActiveLayer = function() {
		try{
			return app.activeDocument.activeLayer;
		}catch(e){
			return null;
		}
	};

	PsdLib.hasActiveLayer = function() {
		try{
			var layer = app.activeDocument.activeLayer;
			return true;
		}catch(e){
			return false;
		}
	};

	PsdLib.getLayerFullIdPath = function() {
		try{
			if(!PsdLib.hasActiveDoc()) return null;
			if(!PsdLib.hasActiveLayer()) return null;

			var result = {
				docAndLayerIDs : PsdLib.getActiveDoc().id + "/" + PsdLib.getActiveLayer().id
			};
			return result;
		}catch(e) {
			return null;
		}
	};

	PsdLib.resizeToBounds = function (width, height) {

		var layerBounds;

		var layerWidth;


		var layerHeight;

		var scaleWidth;
		var scaleHeight;
		var scale;
		var newWidth;
		var newHeight;
		//app.activeDocument.suspendHistory("Resize NineSlice sprite", )
		layerBounds = activeDocument.activeLayer.bounds;
		layerWidth = layerBounds[2].value - layerBounds[0].value;
		layerHeight = layerBounds[3].value - layerBounds[1].value;

		// Resizing scales... At least those which we can calculate...
		if (width) {
			scaleWidth = width / layerWidth;
		}
		if (height) {
			scaleHeight = height / layerHeight;
		}

		// No aspect ratio constrains set - resizing by width and height (both values are percentages!).
		newWidth = scaleWidth * 100;
		newHeight = scaleHeight * 100;


		// Performing the resize.
		activeDocument.activeLayer.resize(newWidth, newHeight, AnchorPosition.MIDDLECENTER);

	};

}catch (e){
	//console.log(e);
	LogIt(e);
}
/**
 * File: app.jsx
 * Copyright 2016 Alexander Vinogradov
 * All rights reserved.
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50, sloppy: true, continue: true, unparam: true */
/*global $, Folder, app, DocumentFill, ActionDescriptor, ActionReference, DialogModes, File, UnitValue,
 TypeUnits, ActionList, SolidColor, executeAction, executeActionGet, PhotoshopSaveOptions, SaveOptions, PNGSaveOptions,
 LayerKind, DescValueType, cssToClip, svg, ColorModel, JSXGlobals, TEXT, COLOR, BRUSH, LAYERSTYLE, UTIL, PSClass, PSEnum, PSType,
 PSForm, PSUnit, PSString, PSKey, PSEvent, PurgeTarget, DocumentMode */


// Model

/**
 * @param object
 * @constructor
 */
var JSXResponse = function(object) {
    this.error = false;
    this.errorMessage = "";
    this.data = {};

    if(object!=undefined&&object!=null) {
        this.error = object.error;
        this.errorMessage = object.errorMessage;
        this.data = object.data;
    }

    this.stringify = function() {
        return JSON.stringify(this);
    }
};



// globals
var ExtensionVersion = "1.0";

try {

    var App = function() {
        this.XmpHelper = new XMPHelper(NineSlicerConstants.Namespace);

    };

    App.prototype.Initialize = function () {
        var result = new JSXResponse();
        try {

        }catch(error) {
            result.error = true;
            result.errorMessage = "App.prototype.Initialize error: "+error.message +" | line="+error.line;
        }
        return result;
    };
}catch(e) {
    LogIt(JSON.stringify(e));
}


// Works only in Photoshop 15.1 & above
function getSelectedLayerIndicesOrIDs(wantIDs) {
    // Work-around for screwy layer indexing.
    var backgroundIndexOffset = 1;
    try {
        // This throws an error if there's no background
        if (app.activeDocument.backgroundLayer) {
            backgroundIndexOffset = 0;
        }
    } catch (ignore) {}

    var ktargetLayers = wantIDs ? sTID('targetLayersIDs') : sTID('targetLayers');

    var resultLayerIndices = [];
    var ref = new ActionReference();
    var args = new ActionDescriptor();
    ref.putProperty(PSClass.Property, ktargetLayers);
    ref.putEnumerated(PSClass.Document, PSType.Ordinal, PSEnum.Target);
    args.putReference(PSString.Null, ref);
    var resultDesc = executeAction(cTID('getd'), args, DialogModes.NO);

    if (!resultDesc.hasKey(ktargetLayers)) {
        return [];
    }

    var selIndexList = resultDesc.getList(ktargetLayers);
    var i;
    for (i = 0; i < selIndexList.count; ++i) {
        if (wantIDs) {
            resultLayerIndices.push(selIndexList.getReference(i).getIdentifier(PSClass.Layer));
        } else {
            resultLayerIndices.push(selIndexList.getReference(i).getIndex(PSClass.Layer) + backgroundIndexOffset);
        }
    }

    return resultLayerIndices;
}

function getSelectedLayerIndices() {
    try {
        return getSelectedLayerIndicesOrIDs(false);
    }catch(e) {
        LogIt(JSON.stringify(e));
        return e;
    }

}

function getSelectedLayerIDs() {
    return getSelectedLayerIndicesOrIDs(true);
}

function getNumSelectedLayers() {
    var indices = [];
    try {
        indices = getSelectedLayerIndices();
    } catch (e) {
        return false;
    }

    return indices.length;
}


function importLayers(filePath, libraryName, itemName, elementRef, modifiedTime, adobeStockId, adobeStockLicense, isLinked) {
    var placeDesc = new ActionDescriptor();
    placeDesc.putPath(PSKey.Target, new File(filePath));

    if (itemName) {
        placeDesc.putString(PSKey.LAYER_NAME, itemName);
    }

    var elementDesc = new ActionDescriptor();

    if (elementRef) {
        elementDesc.putString(PSKey.ELEMENT_REF, elementRef);
    }

    if (modifiedTime) {
        elementDesc.putDouble(PSKey.DATE_MODIFIED, modifiedTime);
    }

    if (itemName) {
        elementDesc.putString(PSKey.Name, itemName);
    }

    if (libraryName) {
        elementDesc.putString(PSKey.LIBRARY_NAME, libraryName);
    }

    if (adobeStockId) {
        elementDesc.putString(PSKey.ADOBE_STOCK_ID, adobeStockId);
        elementDesc.putEnumerated(PSKey.ADOBE_STOCK_LICENSE_STATE, PSKey.ADOBE_STOCK_LICENSE_STATE, adobeStockLicense ? PSKey.Licensed : PSKey.Unlicensed);
    }

    placeDesc.putObject(PSKey.LIB_ELEMENT, PSKey.LIB_ELEMENT, elementDesc);

    if (isLinked) {
        placeDesc.putBoolean(PSKey.LINKED, isLinked);
    } else {
        placeDesc.putBoolean(PSKey.UNWRAP_LAYERS, true);
    }

    executeAction(PSKey.PLACED_REPLACELINKED2LIBRARY, placeDesc, DialogModes.ERROR);
}



// Makes an action list containing a reference to selected sheets
function makeSelectedSheetsTargetSheetReferenceList() {
    //Create an action refernece containing all of the sheets we want to export
    var targetSheetsRef = new ActionReference();
    targetSheetsRef.putEnumerated(PSKey.LayerKey, PSKey.OrdinalKey, PSKey.TargetEnum);

    // Put the reference containing the sheets into a list, cause that's how it's done
    var refList = new ActionList();
    refList.putReference(targetSheetsRef);

    return refList;
}

// Makes a save descriptor that describes the location, name, format, options, etc
// for the file that the layers will be saved to
// saveFile: a File object indicating where the file shoudl be saved to
function makePSDSaveDescriptor(fileObject) {
    var saveDesc = new ActionDescriptor();

    // Format options
    var formatOptDesc = new ActionDescriptor();
    formatOptDesc.putBoolean(PSKey.MaximizeCompatibility, true);

    saveDesc.putObject(PSKey.As, PSKey.Photoshop35Format, formatOptDesc);
    saveDesc.putPath(PSKey.IN, fileObject);
    saveDesc.putBoolean(PSKey.LowerCase, true);

    return saveDesc;
}

function makeRepresentationDescriptor(saveFolder, saveFileNameNoExt) {
    var representationDesc = new ActionDescriptor();
    representationDesc.putPath(PSString.IN, saveFolder);
    representationDesc.putString(PSKey.Name, saveFileNameNoExt);

    return representationDesc;
}

function makeExternalPreviewDescriptor(saveFile, maxWidth, maxHeight) {
    var externalPreviewDesc = new ActionDescriptor();
    externalPreviewDesc.putPath(PSString.IN, saveFile);
    externalPreviewDesc.putInteger(PSString.PixelWidth, maxWidth);
    externalPreviewDesc.putInteger(PSString.PixelHeight, maxHeight);

    return externalPreviewDesc;
}

// Core override. Ensures we correctly determine open status for files
// inside a Windows user folder that has more than 8 characters (path
// comparison on the JS side fails us due to 8.3 vs long filename paths).
$._ADBE_LIBS_CORE.isDocumentOpen = function (path) {
    var hasMatch = false;
    try {
        var argDesc = new ActionDescriptor();
        argDesc.putPath(PSKey.File, new File(path));
        hasMatch = UTIL.getAppProperty(PSKey.HasMatchingOpenDoc, argDesc);
    } catch (ex) {
        $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-isDocumentOpen()', ex);
    }
    return JSON.stringify(hasMatch);
};

$._ADBE_LIBS_PHXS = {
    replaceColor: COLOR.replaceColor,
    setFont: TEXT.setFont,
    createFontLayer: TEXT.createFontLayer,
    isFontAvailable: TEXT.isFontAvailable,
    saveTextStylePreview: TEXT.saveTextStylePreview,
    makeTextItemObjectJSONFromPushDescID: TEXT.makeTextItemObjectJSONFromPushDescID,
    loadAndSelectBrush: BRUSH.loadAndSelectBrush,
    saveBrushByIndex: BRUSH.saveBrushByIndex,
    saveLayerStyle: LAYERSTYLE.saveLayerStyle,
    saveLayerStyleByIndex: LAYERSTYLE.saveLayerStyleByIndex,
    applyLayerStyle: LAYERSTYLE.applyLayerStyle,

    makeColorLookupLayerFromFile: function (filePath, lookName) {

        var selectedLayer = null;

        // Check that a layer is actually selected, app.aciveDocument.activeLayer can be
        // set even if you deselect all layers.
        if (getNumSelectedLayers() === 1) {
            selectedLayer = app.activeDocument.activeLayer;
        }

        if (selectedLayer && selectedLayer.kind === LayerKind.COLORLOOKUP) {

            // Modify the existing Color Lookup adjustment layer
            var setDesc = new ActionDescriptor();

            var targetRef = new ActionReference();
            targetRef.putEnumerated(PSKey.AdjustmentLayer, PSKey.OrdinalKey, PSKey.TargetEnum);
            setDesc.putReference(PSString.Null, targetRef);

            var lookDesc = new ActionDescriptor();
            lookDesc.putString(PSKey.Name, lookName);
            lookDesc.putPath(PSString.FROM, new File(filePath));

            setDesc.putObject(PSKey.To, PSKey.ColorLookup, lookDesc);
            executeAction(PSEvent.Set, setDesc, DialogModes.NO);

        } else {
            // Add a new Color Lookup adjustment layer
            var mainDesc = new ActionDescriptor();
            mainDesc.putPath(PSString.FROM, new File(filePath));
            mainDesc.putString(PSKey.Name, lookName);
            executeAction(PSString.makeColorLookupLayerFromFile, mainDesc, DialogModes.ERROR);
        }
    },
    makePatternLayerFromFile: function (filePath, patternName, historyName) {

        function makePatternFromFile(filePath, patternName) {
            var mainDesc = new ActionDescriptor();
            mainDesc.putPath(PSString.FROM, new File(filePath));
            mainDesc.putString(PSKey.Name, patternName);
            executeAction(PSString.definePatternFile, mainDesc, DialogModes.ERROR);
        }

        function makePatternLayerByName(patternName, scalePercent) {
            // This relies on the fact that a just-addded pattern is the first one that
            // will be found by name even if there are other patterns with the same name
            // (sufficient for this release but not an implementation detail we should rely on).
            var makeDesc = new ActionDescriptor();

            var targetRef = new ActionReference();
            targetRef.putClass(PSString.contentLayer);
            makeDesc.putReference(PSKey.Target, targetRef);

            var patternDesc = new ActionDescriptor();
            patternDesc.putString(PSKey.Name, patternName);
            patternDesc.putString(PSKey.ID, "bogus zuid value"); // To get PS to search by name, we have to provide a bogus zuid

            var patternLyrDesc = new ActionDescriptor();
            patternLyrDesc.putUnitDouble(PSKey.Scale, PSUnit.Percent, scalePercent);
            patternLyrDesc.putObject(PSKey.Pattern, PSKey.Pattern, patternDesc);

            var contentLayerDesc = new ActionDescriptor();
            contentLayerDesc.putObject(PSKey.Type, PSKey.PatternLayer, patternLyrDesc);

            makeDesc.putObject(PSKey.Using, PSString.contentLayer, contentLayerDesc);

            var resultDesc = executeAction(PSEvent.Make, makeDesc, DialogModes.ERROR);

            // This test is a hack because Photoshop isn't throwing user canceled
            // on the Mac. Don't blindly replicate elsewhere.
            if (resultDesc.count === 0) {
                return false;
            }

            return true;
        }

        function deleteJustAddedPattern(patternName) {
            // Get 0-based index of the just-added pattern, double-checking name to be safe.
            var addedPatternIndex = -1;
            var presetTypesList = UTIL.getAppProperty(sTID('presetManager'));

            if (presetTypesList.count >= 5) {
                var patternsDesc = presetTypesList.getObjectValue(4);
                var patternNamesList = patternsDesc.getList(PSKey.Name);

                if (patternNamesList.count > 0) {
                    var lastPatternIndex = patternNamesList.count - 1;
                    if (patternNamesList.getString(lastPatternIndex) === patternName) {
                        addedPatternIndex = lastPatternIndex;
                    }
                }
            }

            if (addedPatternIndex > 0) {
                var deleteDesc = new ActionDescriptor();
                var targetRef = new ActionReference();
                targetRef.putIndex(PSKey.Pattern, addedPatternIndex + 1); // delete by 1-based index
                deleteDesc.putReference(PSKey.Target, targetRef);
                executeAction(PSEvent.Delete, deleteDesc, DialogModes.NO);
            }
        }

        function doMakePatternLayerFromFile(filePath, patternName) {
            var doCancel = false;
            try {
                // makePatternLayerFromFile hangs when pattern mode or depth
                // have to be converted for target doc, so do it manually.
                makePatternFromFile(filePath, patternName);

                try {
                    if (!makePatternLayerByName(patternName, 25)) {
                        doCancel = true; // handle cancel on Mac
                    }
                } catch (ex) {
                    doCancel = true; // handle cancel on Win
                }

                deleteJustAddedPattern(patternName);

                // In order to skip showing the New Layer dialog but show the Pattern Fill dialog,
                // we drive the initial layer creation without dialogs and then run a second
                // action here to modify the pattern fill layer.

                // Get the ID for the pattern from the new layer
                var adjList = UTIL.getLayerProperty(PSKey.Adjustment);
                var patternID = adjList.getObjectValue(0).getObjectValue(PSKey.Pattern).getString(PSKey.ID);

                // Show the Pattern Fill dialog with the scale automatically set down to 25%
                var setDesc = new ActionDescriptor();

                var targetRef = new ActionReference();
                targetRef.putEnumerated(PSString.contentLayer, PSType.Ordinal, PSKey.TargetEnum);
                setDesc.putReference(PSString.Null, targetRef);

                var patternLyrDesc = new ActionDescriptor();
                patternLyrDesc.putUnitDouble(PSKey.Scale, PSUnit.Percent, 25.000000);
                var patternDesc = new ActionDescriptor();
                patternDesc.putString(PSKey.ID, patternID);
                patternLyrDesc.putObject(PSKey.Pattern, PSKey.Pattern, patternDesc);
                setDesc.putObject(PSKey.To, PSKey.PatternLayer, patternLyrDesc);

                var result = executeAction(PSEvent.Set, setDesc, DialogModes.ALL);

                // This test is a hack because Photoshop isn't throwing user canceled
                // on the Mac. Don't blindly replicate elsewhere.
                if (result.count === 0) {
                    return 'cancel';
                }
            } catch (ex) {
                // Handles user cancel on Win and any other unexpected exception
                doCancel = true;
            }

            if (doCancel) {
                return 'cancel';
            }
        }

        // Placate JSLint ('not used' error)
        if (!doMakePatternLayerFromFile) {
            return;
        }

        app.activeDocument.suspendHistory(historyName, 'doMakePatternLayerFromFile(filePath, patternName);');
    },
    definePatternFile: function (filePath, patternName) {
        var mainDesc = new ActionDescriptor();
        mainDesc.putPath(PSString.FROM, new File(filePath));
        mainDesc.putString(PSKey.Name, patternName);
        executeAction(PSString.definePatternFile, mainDesc, DialogModes.ERROR);
    },
    refreshFonts: function () {
        app.refreshFonts();
    },
    showFileSelectionDialog: function () {
        var selectedFiles = app.openDialog();
        var filePaths = [];
        var f;
        for (f = 0; f < selectedFiles.length; f++) {
            filePaths.push({
                'name': selectedFiles[f].name,
                'path': selectedFiles[f].fsName
            });
        }
        return JSON.stringify(filePaths);
    },
    placeAsset: function (filePath, libraryName, itemName, elementRef, modifiedTime, creationTime, adobeStockId, adobeStockLicense, isLinked) {
        try {
            importLayers(filePath, libraryName, itemName, elementRef, modifiedTime, adobeStockId, adobeStockLicense, isLinked);
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-placeAsset()', ex);
        }
    },
    openAssetForEdit: function (filePath, previewPath, elementRef) {
        try {
            var openDesc = new ActionDescriptor();
            openDesc.putPath(PSString.Null, new File(filePath));

            // Tell PS to generate an updated preview whenever the file is saved
            var pngFile = new File(previewPath);
            var previewParams = makeExternalPreviewDescriptor(pngFile, JSXGlobals.previewMaxWidth, JSXGlobals.previewMaxHeight);
            openDesc.putObject(PSString.ExternalPreview, PSString.ExternalPreview, previewParams);
            openDesc.putEnumerated(PSKey.FileOpenContext, PSType.Ordinal, PSEnum.FileOpenContextCCLibraries);

            // Suppresses file choosing dialog while allowing format options
            openDesc.putBoolean(PSKey.OverrideOpen, true);

            // Provide element ref so PS can track recent
            if (elementRef) {
                var elementDesc = new ActionDescriptor();
                elementDesc.putString(PSKey.ELEMENT_REF, elementRef);
                openDesc.putObject(PSKey.LIB_ELEMENT, PSKey.LIB_ELEMENT, elementDesc);
            }

            // Tell PS to open the file
            executeAction(PSString.Open, openDesc, DialogModes.ALL);
            return app.activeDocument.name;
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-openAssetForEdit()', ex);
        }
    },
    openDocumentFromTemplate: function (templatePath, templateName, elementRef) {
        try {
            var openDesc = new ActionDescriptor();
            openDesc.putPath(PSString.Null, new File(templatePath));

            openDesc.putEnumerated(PSKey.FileOpenContext, PSType.Ordinal, PSEnum.FileOpenContextCCLibraries);

            // Suppresses file choosing dialog while allowing format options
            openDesc.putBoolean(PSKey.OverrideOpen, true);

            // Force open as template behavior even if we don't have a template file type
            openDesc.putBoolean(PSKey.Template, true);

            // Provide element ref so PS can track recent
            if (elementRef) {
                var elementDesc = new ActionDescriptor();
                elementDesc.putString(PSKey.ELEMENT_REF, elementRef);
                openDesc.putObject(PSKey.LIB_ELEMENT, PSKey.LIB_ELEMENT, elementDesc);
            }

            // Tell PS to open the file
            executeAction(PSString.Open, openDesc, DialogModes.ALL);
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-openDocumentFromTemplate()', ex);
        }
    },
    generateRepresentationAndPreview: function (repFolderPath, repNameNoExt, previewPath) {
        var repFolder = new File(repFolderPath);
        var previewFile = new File(previewPath);

        var repDesc = makeRepresentationDescriptor(repFolder, repNameNoExt);
        var previewDesc = makeExternalPreviewDescriptor(previewFile, JSXGlobals.previewMaxWidth, JSXGlobals.previewMaxHeight);

        var exportDesc = new ActionDescriptor();
        exportDesc.putClass(PSKey.Using, PSKey.SaveForCCLibrariesElement);
        exportDesc.putObject(PSKey.Representation, PSKey.Representation, repDesc);
        exportDesc.putObject(PSString.ExternalPreview, PSString.ExternalPreview, previewDesc);

        var refList = null;
        refList = makeSelectedSheetsTargetSheetReferenceList();
        exportDesc.putList(PSKey.Target, refList);

        var dimensions = {
            'width': 0,
            'height': 0
        };
        var resultDesc = executeAction(PSKey.Export, exportDesc, DialogModes.ERROR);

        if (resultDesc && resultDesc.hasKey(PSString.PixelWidth)) {
            dimensions.width = resultDesc.getInteger(PSString.PixelWidth);
        }

        if (resultDesc && resultDesc.hasKey(PSString.PixelHeight)) {
            dimensions.height = resultDesc.getInteger(PSString.PixelHeight);
        }

        var repFile = resultDesc.getPath(PSString.IN);

        var result = {};
        result.dimensions = dimensions;
        result.repPath = repFile.fsName;

        return result;
    },
    saveAssets: function (info, generateSecondaryFormat) {
        try {
            // Add an extra 'p' to the end of the preview filename incase the
            // representation file turns out to also be a PNG.
            var pngPath = Folder.temp.fsName + "/" + info.name + "p" + ".png";
            var result = $._ADBE_LIBS_PHXS.generateRepresentationAndPreview(Folder.temp.fsName, info.name, pngPath);

            var filePath = result.repPath;

            var strLayerName = $._ADBE_LIBS_PHXS.getLayerName();
            var fileData = {
                layerName: strLayerName,
                files: [{
                    path: filePath,
                    relationship: 'primary',
                    dimensions: result.dimensions
                }],
                rendition: pngPath
            };

            var layerIds = getSelectedLayerIDs();
            if (layerIds) {
                fileData.layerIds = layerIds;
            }

            if (app.activeDocument) {
                fileData.documentId = app.activeDocument.id;
            }

            return JSON.stringify(fileData);
        } catch (ex1) {
            $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-saveAssets()', ex1);
        }
    },
    setColor: COLOR.setColor,
    setFillColor: COLOR.setFillColor,
    setStrokeColor: COLOR.setStrokeColor,
    setColorOverlay: COLOR.setColorOverlay,
    getCurrentState: function () {
        try {
            if (app.documents && app.documents.length > 0) {
                var selectedLayerId = -1;
                var selectedLayer = app.activeDocument.activeLayer;
                var docPath = app.activeDocument.name;

                if (selectedLayer) {
                    selectedLayerId = selectedLayer.id;
                }
                try {
                    if (app.activeDocument.fullName) {
                        docPath = app.activeDocument.fullName.fsName;
                    }
                } catch (ex2) {
                    JSON.stringify({
                        'path': docPath,
                        'layerID': selectedLayerId
                    });
                }

                return JSON.stringify({
                    'path': docPath,
                    'layerID': selectedLayerId
                });
            }
            return JSON.stringify({
                'name': '',
                'layerID': -1
            });
        } catch (ignore) {}
    },
    getLayerName: function () {
        try {
            return app.activeDocument.activeLayer.name;
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-getLayerName()', ex);
            return '';
        }
    },
    frontDocIsRGB: function () { // for applyLookRGBHack
        return app.activeDocument && app.activeDocument.mode === DocumentMode.RGB;
    },
    getLayerInfo: function () {
        try {
            var layerObject = {
                'name': '',
                'fullName': ''
            };
            var layerColors = [];

            var areEqual = function (colorData1, colorData2) {
                var key;
                if (colorData1 && colorData2) {
                    for (key in colorData1[0].value) {
                        if (colorData1[0].value.hasOwnProperty(key)) {
                            if (!colorData2[0].value.hasOwnProperty(key) || Math.round(colorData1[0].value[key]) !== Math.round(colorData2[0].value[key])) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            };

            var pushUnique = function (colorData, colorType) {
                if (colorData === undefined) {
                    return;
                }
                var index;
                for (index = 0; index < layerColors.length; index++) {
                    if (areEqual(layerColors[index].data, colorData)) {
                        return;
                    }
                }
                layerColors.push({
                    'colorType': colorType,
                    'data': colorData
                });
            };

            layerObject.enableApplyText = false;

            var selectedLayer = false; // For multi-layer selections, this is the top layer
            var numSelectedLayers = getNumSelectedLayers();
            if (numSelectedLayers === 1) {
                selectedLayer = app.activeDocument.activeLayer;
                if (selectedLayer && selectedLayer.kind === LayerKind.TEXT && selectedLayer.textItem.contents.length > 0) {
                    layerObject.enableApplyText = true;
                    layerObject.text = $._ADBE_LIBS_CORE.shortenString(selectedLayer.textItem.contents);

                    layerObject.fontInfo = TEXT.getLayerFont();
                    pushUnique(layerObject.fontInfo.color, JSXGlobals.PS_TEXT);
                }

                pushUnique(COLOR.getSolidFillColor(), JSXGlobals.FILL);
                pushUnique(COLOR.getSolidStrokeColor(), JSXGlobals.STROKE);
                pushUnique(COLOR.getLayerEffectColor(PSKey.SolidFill), JSXGlobals.PS_EFFECT_FILL);
                pushUnique(COLOR.getLayerEffectColor(PSKey.FrameFX), JSXGlobals.PS_EFFECT_STROKE);

                layerObject.name = $._ADBE_LIBS_CORE.shortenString(selectedLayer.name, false, JSXGlobals.maxNameLength);
                layerObject.fullName = selectedLayer.name;
                layerObject.hasLayerStyles = LAYERSTYLE.hasLayerStyles();
            } else if (numSelectedLayers > 1) {
                selectedLayer = app.activeDocument.activeLayer;
                if (selectedLayer && selectedLayer.kind === LayerKind.TEXT) {
                    layerObject.enableApplyText = true;
                }
            }
            pushUnique(COLOR.solidColorToData(app.foregroundColor), JSXGlobals.PS_FOREGROUND);

            layerObject.colors = layerColors;
            layerObject.kind = "";
            layerObject.selectionExists = (numSelectedLayers > 0);
            layerObject.enableApplyStyle = (numSelectedLayers > 1 || (numSelectedLayers === 1 && !selectedLayer.isBackgroundLayer));
            layerObject.enableShapeLayerApplyOperations = false;
            layerObject.libraryLinked = false;

            if (numSelectedLayers === 1 && selectedLayer.kind) {
                layerObject.kind = selectedLayer.kind.toString();

                if (selectedLayer.kind === LayerKind.SMARTOBJECT) {
                    var soDesc = UTIL.getLayerProperty(PSKey.SmartObject);
                    if (soDesc && soDesc.hasKey(PSKey.LINK) && soDesc.getType(PSKey.LINK) === DescValueType.OBJECTTYPE && soDesc.getClass(PSKey.LINK) === PSKey.LIB_ELEMENT) {
                        layerObject.libraryLinked = true;
                    }
                }
            }

            if (numSelectedLayers > 0 && selectedLayer.kind) {
                // Only show apply fill/stroke color for Shape layers, not Solid Color Fill layers
                if (selectedLayer.kind === LayerKind.SOLIDFILL) {
                    var hasVectorMask = UTIL.getLayerProperty(PSKey.HasVectorMask);
                    layerObject.enableShapeLayerApplyOperations = hasVectorMask;
                }
            }
            layerObject.enableApplyLook = app.activeDocument.mode === DocumentMode.RGB;

            return JSON.stringify(layerObject);
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-getLayerInfo()', ex);
        }
    },
    getLayerColor: COLOR.getLayerColor,
    getIMSUserID: function () {
        var userId = "";
        try {
            var bhnc = cTID("bhnc");
            var ref = new ActionReference();
            ref.putProperty(cTID("Prpr"), bhnc);
            ref.putEnumerated(cTID("capp"), cTID("Ordn"), cTID("Trgt"));
            var appDesc = app.executeActionGet(ref);
            if (appDesc.hasKey(bhnc)) {
                userId = appDesc.getString(bhnc);
            }
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-getIMSUserID()', ex);
        }

        return userId;
    },
    getTooltipState: function () {
        var tooltipsEnabled = true;
        try {
            tooltipsEnabled = UTIL.getAppProperty(PSKey.ShowToolTips);
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-getTooltipState', ex);
        }
        return tooltipsEnabled;
    },
    getReadableFileExtensions: function () {
        var readableExtensions = [];
        try {
            var fileFormatsDesc = UTIL.getAppProperty(PSKey.FileFormats);
            if (fileFormatsDesc.hasKey(PSKey.ReadableFileExtensions)) {
                var listDesc = fileFormatsDesc.getList(PSKey.ReadableFileExtensions);
                var index = 0;
                for (index = 0; index < listDesc.count; ++index) {
                    readableExtensions.push(listDesc.getString(index));
                }
            }
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-getReadableFileExtensions', ex);
        }
        return JSON.stringify(readableExtensions);
    },
    isAnalyticsEnabled: function () {
        var userTrackingEnabled = false;
        try {
            var welcome = cTID('wlcm');
            var koptinStr = sTID("optin");
            var welcomeDesc = UTIL.getAppProperty(welcome);
            if (welcomeDesc && welcomeDesc.hasKey(koptinStr)) {
                userTrackingEnabled = welcomeDesc.getBoolean(koptinStr);
            }
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-isAnalyticsEnabled', ex);
        }
        return userTrackingEnabled;
    },
    getConfigInfoFromPS: function () {
        // Comment out but keep code as an example when not in use; will need to re-use.
        var configInfo = {
            enablePatternDragging: false
        };
        try {
            var ccLibConfigDesc = UTIL.getAppProperty(PSKey.CCLibrariesConfig);
            if (ccLibConfigDesc && ccLibConfigDesc.hasKey(sTID("enablePatternDragging"))) {
                configInfo.enablePatternDragging = ccLibConfigDesc.getBoolean(sTID("enablePatternDragging"));
            }
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-getConfigInfoFromPS', ex);
        }
        return JSON.stringify(configInfo);
    },
    reportEvent: function (eventName, properties, force) {
        try {
            if (eventName === "createElement" || eventName === "useElement" || eventName === "createLink" || force) {
                // Log events to Highbeam so Design Library usage can be compared
                // to usage of other Photoshop features.

                // This is the data group name; it should be identical across all calls for a given
                // data group and self descriptive.
                // By not including eventName in the group name, we are recording a single data
                // group for Design Library (eventName gets added as a property).
                var highbeamDataGroupName = "Design Library";

                // Helper to handle null and undefined properties which can't be added to
                // an ActionDescriptor. When properties aren't set, log "N/A" rather than
                // letting Highbeam fill in a default value.
                var safeAddStringPropertyToDesc = function (descriptor, key, property) {
                    if (property) {
                        descriptor.putString(key, property);
                    } else {
                        descriptor.putString(key, "N/A");
                    }
                };

                var desc = new ActionDescriptor();

                // Required params:
                //   - eventRecord: Data group name
                safeAddStringPropertyToDesc(desc, PSEvent.Record, highbeamDataGroupName);

                // There should be a well defined and limited set of values for each property
                // which is what you want to make Highbeam data most usable. Library/element
                // IDs are an exception as we log them to look at aggregate per-library and
                // per-element data.
                safeAddStringPropertyToDesc(desc, PSKey.HighbeamEventName, eventName);
                safeAddStringPropertyToDesc(desc, PSKey.HighbeamLibraryID, properties.libraryID);
                safeAddStringPropertyToDesc(desc, PSKey.HighbeamLibraryElementCount, properties.libraryElementCount);
                safeAddStringPropertyToDesc(desc, PSKey.HighbeamElementID, properties.elementID);
                safeAddStringPropertyToDesc(desc, PSKey.HighbeamElementType, properties.elementType);

                // Add properties that we only want for specific event types
                if (eventName === "useElement") {
                    safeAddStringPropertyToDesc(desc, PSKey.HighbeamRepresentationType, properties.representationType);
                    safeAddStringPropertyToDesc(desc, PSKey.HighbeamOpType, properties.opType);
                    safeAddStringPropertyToDesc(desc, PSKey.HighbeamDetails, properties.details);
                }

                if (eventName === "createElement") {
                    safeAddStringPropertyToDesc(desc, PSKey.HighbeamOpType, properties.opType);
                }

                if (eventName === "createLink") {
                    safeAddStringPropertyToDesc(desc, PSKey.HighbeamOpType, properties.opType);
                }

                app.executeAction(PSEvent.HeadlightsInfo, desc, DialogModes.NO);

                return true;
            }

        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-reportEvent()', ex);
        }

        return false;
    },
    getStringID: function (strValue) {
        if (typeof strValue === 'string') {
            return sTID(strValue);
        }

        return strValue.map(sTID);
    },
    getUserData: function () {
        try {
            var result = {
                accountStatus: "paid",
                secondsLeftInTrial: 0
            };

            var kWelcomeStr           = cTID("wlcm");
            var kentryStatusStr       = sTID("entryStatus");
            var kleftStr              = sTID("left");

            var ref = new ActionReference();
            ref.putProperty(sTID('property'), kWelcomeStr);
            ref.putEnumerated(sTID('application'), sTID('ordinal'), sTID('targetEnum'));

            var argsDesc = new ActionDescriptor();
            argsDesc.putReference(sTID('target'), ref);
            var appDesc = executeAction(sTID('get'), argsDesc, DialogModes.NO);

            if (appDesc.hasKey(kWelcomeStr)) {
                var welcomeDesc = appDesc.getObjectValue(kWelcomeStr);

                result.accountStatus = (welcomeDesc.getInteger(kentryStatusStr) === 1) ? "trial" : "paid";
                result.secondsLeftInTrial = (result.subscription === "paid") ? 0 : welcomeDesc.getLargeInteger(kleftStr);
            }

            return JSON.stringify(result);
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('PHXS.jsx-getUserData()', ex);
        }
    }
};
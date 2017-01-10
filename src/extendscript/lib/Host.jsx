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



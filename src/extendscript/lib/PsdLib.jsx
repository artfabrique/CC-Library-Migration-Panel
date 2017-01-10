




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
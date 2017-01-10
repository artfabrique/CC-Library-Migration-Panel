




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

/**
 * Copyright 2016 Alexander Vinogradov
 * All rights reserved.
 */

// Get a reference to a CSInterface object
var csInterface = new CSInterface();

function JSLogIt(inMessage) {
    console.log(inMessage);
    csInterface.evalScript("LogIt('" + inMessage + "')");
}
var AppConstants = {};
AppConstants.Namespace = 'http://www.revenga.me/CCLibraryMigration/0.1.0/';
AppConstants.ExtensionId = "null";

var ExtensionEventType = {};
ExtensionEventType.SelectLayer = ['slct',""];
ExtensionEventType.DeselectLayer = ['Dslc',""];
ExtensionEventType.TransformComplete = ['Trnf',""];
ExtensionEventType.DocumentOpen = ['Opn ',""];
ExtensionEventType.DocumentClose = ['Cls ',""];


/**
 * @constructor
 */
var ExtensionPanel = function () {
    ExtensionPanel.instance = this;

    this.StateType = {};
    this.StateType.LOADING = "state-loading";
    this.StateType.NONE = "state-none";
    this.StateType.READY = "state-ready";

    this.currentState = this.StateType.LOADING;
    this.selected = null;
};

ExtensionPanel.prototype.Persistent = function(inOn) {
    gStartDate = new Date();
    var event;
    if (inOn) {
        event = new CSEvent("com.adobe.PhotoshopPersistent", "APPLICATION");
    } else {
        event = new CSEvent("com.adobe.PhotoshopUnPersistent", "APPLICATION");
    }
    event.extensionId = NineSlicerConstants.ExtensionId;
    csInterface.dispatchEvent(event);
};

ExtensionPanel.prototype.Initialize = function() {
    AppConstants.ExtensionId = csInterface.getExtensionID();
    var that = this;
    this.app = new Vue({
        el : '#app',
        data: that,

        methods: {
            doReplace : function() {
                that.RelinkTest();
            }
        }
    });

    this.currentState = this.StateType.READY;
};

ExtensionPanel.prototype.UpdatePanel = function () {


};

ExtensionPanel.prototype.RelinkTest = function() {


    function Step1() {
        csInterface.evalScript("JSON.stringify(PsdLib.getLayerFullIdPath())", function(result) {
            var resultObject = JSON.parse(result);
            //alert(resultObject);
            Step2(resultObject);
        });
    }

    function Step2(layerRef) {

        var event = new CSEvent("com.adobe.DesignLibraries.events.ElementChosen", "APPLICATION");
        //var event = new CSEvent("com.adobe.DesignLibraries.events.ElementUpdated", "APPLICATION");

        var data = {
            requestRef: layerRef, //i.getEditRequestRef(a), //docAndLayerID
            elementRef: "cloud-asset://cc-api-storage.adobe.io/assets/adobe-libraries/1fdc8600-4216-4504-ba91-b7b897582164;node=81133167-9e56-48de-ac5d-2636b0a22b74",
            name: "content_resource_am_XS",
            libraryName: "SA icons",
            modifiedTime: 1476973067401,
            creationTime: 1476973067300,
            data: ["C:/Users/a.vinogradov/AppData/Roaming/Adobe/Creative Cloud Libraries/LIBS/17B5658252D3D2C50A490D4D_AdobeID/creative_cloud/dcx/1fdc8600-4216-4504-ba91-b7b897582164/components/65e02dbf-1d94-46a5-90b7-e1e989794616.png"]
        };

        //r.isStockAsset(o) && (l.adobeStock = { id: r.getStockId(o), license: r.isLicensed(o) });

        event.data = JSON.stringify(data);

        alert(event.data);

        csInterface.dispatchEvent(event);
    }

    Step1();
};


/*
====================== EVENTS ==========================
 */

ExtensionPanel.prototype.SubscribePSEvents = function() {
    //that = extensionPanel;
    //JSLogIt("NineSlicerPanel.prototype.SubscribePSEvents:"+that._PSEventCallback);
    csInterface.addEventListener("com.adobe.PhotoshopJSONCallback" + AppConstants.ExtensionId, this._PSEventCallback);
    this._PSToggleRegisterEvent(ExtensionEventType.SelectLayer, true);
    this._PSToggleRegisterEvent(ExtensionEventType.TransformComplete, true);
    this._PSToggleRegisterEvent(ExtensionEventType.DocumentOpen, true);
    this._PSToggleRegisterEvent(ExtensionEventType.DocumentClose, true);

    csInterface.addEventListener("appOffline", logEvent);
};

ExtensionPanel.prototype._PSEventCallback = function(evt) {
    //JSLogIt(evt.toString());
    try {
        if (typeof evt.data === "string") {
            var eventData = evt.data.replace("ver1,{", "{");
            var eventDataObject = JSON.parse(eventData);
            evt.data = eventDataObject;
            switch(eventDataObject.eventID.toString()) {
                case ExtensionEventType.DocumentOpen[1]:
                case ExtensionEventType.DocumentClose[1]:
                case ExtensionEventType.SelectLayer[1]:
                    extensionPanel.UpdatePanel();
                    break;
                case ExtensionEventType.TransformComplete[1]:
                    extensionPanel.UpdateChild();
                    break;
            }

            //JSLogIt(eventDataObject);

        } else {
            //JSLogIt("PhotoshopCallbackUnique expecting string for csEvent.data!");
        }
    } catch(error) {
        JSLogIt("PhotoshopCallbackUnique catch: " + JSON.stringify(error));
    }
};

/**
 * @param callback
 */
ExtensionPanel.prototype.ResolveEventIds = function(callback) {
    var queueCount = 0;
    var doneCount = 0;
    function getTypeId(eventChar, callback) {
        queueCount++;
        csInterface.evalScript("app.charIDToTypeID('" + eventChar + "')", function (typeID) {
            callback(typeID);
            doneCount++;
        });
    }

    getTypeId(ExtensionEventType.SelectLayer[0],function(typeId){ExtensionEventType.SelectLayer[1] = typeId});
    getTypeId(ExtensionEventType.TransformComplete[0],function(typeId){ExtensionEventType.TransformComplete[1] = typeId});
    getTypeId(ExtensionEventType.DocumentClose[0],function(typeId){ExtensionEventType.DocumentClose[1] = typeId});
    getTypeId(ExtensionEventType.DocumentOpen[0],function(typeId){ExtensionEventType.DocumentOpen[1] = typeId});

    checkInterval = setInterval(function(){
        if(doneCount==queueCount && callback!=null) {
            clearInterval(checkInterval);
            callback();
        }
    },1);
};

/**
 * @param {ExtensionEventType} eventType
 * @param {boolean} isEnabled
 * @private
 */
ExtensionPanel.prototype._PSToggleRegisterEvent = function(eventType, isEnabled) {
    var event;
    if (isEnabled) {
        event = new CSEvent("com.adobe.PhotoshopRegisterEvent", "APPLICATION");
    } else {
        event = new CSEvent("com.adobe.PhotoshopUnRegisterEvent", "APPLICATION");
    }
    event.extensionId = AppConstants.ExtensionId;
    event.data = eventType[1];
    csInterface.dispatchEvent(event);
};

ExtensionPanel.prototype.UnsubscribePSEvents = function() {
    var that = extensionPanel;
    csInterface.removeEventListener("com.adobe.PhotoshopJSONCallback" + AppConstants.ExtensionId, that._PSEventCallback);
    that._PSToggleRegisterEvent(ExtensionEventType.SelectLayer, false);
    that._PSToggleRegisterEvent(ExtensionEventType.TransformComplete, false);
    that._PSToggleRegisterEvent(ExtensionEventType.DocumentOpen, false);
    that._PSToggleRegisterEvent(ExtensionEventType.DocumentClose, false);
};

var extensionPanel;

$(function() {
    extensionPanel = new ExtensionPanel();
    extensionPanel.Initialize();
});


function getSmartlayerStructure() {
	try {
		var ref = new ActionReference(); 
		ref.putEnumerated( 1283027488, 1332896878, 1416783732 ); 
		var smartDesc = executeActionGet(ref);
        return GetAllKeyValues(smartDesc,0);
        
	} catch (e) { 
        return "-1"; 
    }   
}

function GetAllKeyValues(obj,lvl) {
        var lvlstroffset = "";   
        for(var ii=0; ii<lvl; ii++) {
            lvlstroffset += "...";
        }
        var str = "";       
        if(obj!=null && obj.count!=null && obj.count!=undefined) {
                      
            for(var i=0;i<obj.count;i++) {
                var innerstr = ""; 
                var key = obj.getKey(i);
                var type = obj.getType(key);
                var value = null;
                switch(type) {
                   
                        case DescValueType.ALIASTYPE: value = null; break;
                        case DescValueType.BOOLEANTYPE: value = obj.getBoolean(key); break;
                        case DescValueType.CLASSTYPE: value = obj.getClass(key); break;
                        case DescValueType.DOUBLETYPE: value = obj.getDouble(key); break;
                        case DescValueType.ENUMERATEDTYPE: value = obj.getEnumerationType(key); break;
                        case DescValueType.INTEGERTYPE: value = obj.getInteger(key); break;
                        case DescValueType.LARGEINTEGERTYPE: value = obj.getInteger(key); break;
                        case DescValueType.LISTTYPE: value = obj.getList(key); break;
                        case DescValueType.OBJECTTYPE:
                            value = typeIDToStringID(obj.getObjectType(key))+"("+obj.getObjectType(key)+")"; 
                            for(var j=0;j<obj.reflect.properties.length; j++) {
                                 innerstr+= "\n"+lvlstroffset+"> "+obj.reflect.properties[j].name+" : "+obj.reflect.properties[j].dataType+" , "+obj.reflect.properties[j].type;
                            }
                            innerstr +="\n"+GetAllKeyValues(obj.getObjectValue(key),lvl+1);
                            break;
                        case DescValueType.RAWTYPE: value = null; break;
                        case DescValueType.REFERENCETYPE: value = obj.getReference(key); break;
                        case DescValueType.STRINGTYPE: value = obj.getString(key); break;
                        case DescValueType.UNITDOUBLE: value = obj.getUnitDoubleValue(key); break;
                        default: value = null; break;
                   
                }
                str+=lvlstroffset +""+ typeIDToStringID(key)+"("+key+")"+" = "+value+" :: "+type;
                
                str+=innerstr+"\n";
         }
     }
 return str;
}
getSmartlayerStructure();
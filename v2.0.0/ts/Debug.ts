// import Feature from "./Feature";
class Debug {
    static level = 3; // 0= silent, 1=Error, 2=Warn, 3=Verbose
    static cssLabel = "color:blue";
    static cssDisplay = "color:green";
    static cssFeature = "color:purple";
    static cssCoord = "color:red";
    static error(str: string){console.error(str)}
    static warn(str: string){console.warn(str)}
    static info(str: string, obj:any){
        console.log(`%c${str}`, Debug.cssLabel, obj.options.options);
    }
    static Debug(obj:any){
        if (Debug.level > 0) {
            let type = argsClass.TypeOf(obj);
            switch (type) {
                case ("ROOT_Feature") :
                    // if (typeof(obj.o.dim) == "undefined")
                    //     error(`Item "${obj.o.label}" requires "dim" ie: 20, "20px", or "20%"`);
                    // else
                        Debug.info(`H(Root) "${obj.o.label}" Created`, obj);
                    break;            
    
                case ("Display") :
                    // if (!("dim" in obj)) throw `Item "${obj.o.label}" requires "dim" ie: 20, "20px", or "20%"`;
                    break;        
                case ("ITEM_Feature") :
                    // if (typeof(obj.o.dim) == "undefined")
                    //     Debug.error(`Item "${obj.o.label}" requires "dim" ie: 20, "20px", or "20%"`);
                    // else
                        Debug.info(`I(Item) "${obj.o.label}" Created`, obj);
                    break;
                case ("EL_Feature") :
                    if (typeof(obj.o.el) == "undefined")
                        Debug.error(`Item "${obj.o.label}" requires an [Element], or [string] with Element Selector (Default is Element id)`);
                    else
                        Debug.info(`E(element) "${obj.o.label}" Created`, obj);
                    break;
                case ("Options") :
                    break;
                case ("Coord") :
                    break;                
                default :
                    throw `No Debugging exists for type ${type}`;
            }
        }
    }
    static tree(root:Display|Feature|string|boolean = undefined, open = true) {
        let type = argsClass.TypeOf(root);
        if (type == "boolean") {open = (<boolean>root); root = undefined}
        if (root){
            if (type == "Display") 
                Debug.Dtree(<Display>root, open);
            else if (type == "string") { 
                if (<string>root in D)                 
                    Debug.Dtree(D[<string>root], open);
            }
        }
        else {
            let display_key:string;
            let display_keys:string[] = Object.keys(H);
            for (let i=0; i< display_keys.length ; i++) {
                display_key = display_keys[i];
                Debug.Dtree( D[display_key], open );
            }
        }
    }
    static Dtree(display:Display, open:boolean) {
        let size = display.o.size;
        if ("offset" in size.o)
            console.group(`%c(Display) D.%c${display.o.label} %c(${size.width},${size.height},${size.x},${size.y}) %c(${size.o.offset.width},${size.o.offset.height},${size.o.offset.x},${size.o.offset.y})`,
                Debug.cssDisplay, Debug.cssLabel, Debug.cssCoord, Debug.cssFeature, display);
        else
            console.group(`%c(Display) D.%c${display.o.label} %c(${size.width},${size.height},${size.x},${size.y})`,
                Debug.cssDisplay, Debug.cssLabel, Debug.cssCoord, display);        
        Debug.Otree(display, open);

        console.groupEnd();
    }
    static Otree(display:Display, open:boolean) {
        let o = display.o, feature:any;
        let oNoRepeats:Object_Any;

        if ("features" in o) {
            oNoRepeats = {};
            for (let option in o) 
                if (["size", "features", "children", "label"].indexOf(option) < 0) 
                    oNoRepeats[option] = o[option];
            if (open) {
                console.group(`%c.o.features [${o.features.length}]`, Debug.cssDisplay, oNoRepeats);
            } else {
                console.groupCollapsed(`%c.o.features [${o.features.length}]`, Debug.cssDisplay, oNoRepeats);
            }
            // console.group(`%c.o.features [${o.features.length}]`, Debug.cssDisplay, oNoRepeats);
            for(let i=0; i < o.features.length; i++) {
                feature = o.features[i];
                Debug.Ftree(feature);
            }
            console.groupEnd();
        }
        if ("children" in o && (o.children != undefined) && o.children.length > 0) {
            let child: Display;
            for(let childIndex=0; childIndex < o.children.length; childIndex++) {
                child = o.children[childIndex];
                Debug.Dtree(child, open);
            }
        } // else console.log("%c.o.children", Debug.cssDisplay, "None");
    }
    static Ftree(feature:any) {
        let name = ("debugLabel" in feature) ? feature.debugLabel : argsClass.TypeOf(feature);
        console.groupCollapsed(`%c${name}.%c${feature.o.label}`, Debug.cssFeature, Debug.cssLabel ,feature);
        console.log(`%c.o.`, Debug.cssFeature, feature.o);
        if ("el" in feature.o) console.log(feature.o.el);
        console.groupEnd()
    }
    constructor(){}
}
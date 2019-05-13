interface DisplayOptions {
    label?:string;
    size?: Coord;
    visible?: boolean;
    callBack?: Function;

    width?:number;
    height?:number;
    x?:number;
    y?:number;

    parent?: Display;
    children?: Display[];
    features?: Feature[];
}
function D(...Arguments:any){
    return new Display(Arguments);
}
class Display {   
    static rootDisplays: { [index: string]: Display; } = {};    
    static displays: { [index: string]: Display; } = {};
    static namingIndex = 0;
    static copySizeToChildren(DISPLAY: Display):void { // this is called by features in onchange ** if same **
        let child: Display;
        for(let i=0; i < DISPLAY.o.children.length ; i++){
            child = DISPLAY.o.children[i];
            child.o.size.copy( DISPLAY.o.size );
        }
    }         
    static update(DISPLAY:any){
        let feature: any;
        for(let i=0; i < DISPLAY.o.features.length; i++){
            feature = DISPLAY.o.features[i];
            if ("update" in feature) feature.update();
        }
        if ("callBack" in DISPLAY.o) DISPLAY.o.callBack(DISPLAY);
    }
    update(){Display.update(this);}
    static feature(DISPLAY:Display, featureClassName:string){
            for(let i=0; i< DISPLAY.o.features.length ;i++)
                if (argsClass.TypeOf( DISPLAY.o.features[i] ) == featureClassName) 
                    return DISPLAY.o.features[i];
            return undefined;
    }
    feature(str:string){return Display.feature(this, str);}
    static when(label:string, fn:Function){
        Display.When[label] = fn;
        console.log(`When Added ${label}`, Display.When);
    }
    static When = {};
    static checkWhen(DISPLAY:Display){
        for(let key in Display.When) {
            if ( Display.When[key]( DISPLAY ) ) {
                console.log("When Achieved", key);
                delete Display.When[key];
            }
        }
    }
    static pushUnique(array:any, elements:any){
        let retValue = false;
        if (argsClass.TypeOf(elements) != "array") elements = [ elements ];
        for(let i=0; i< elements.length; i++)
            if (array.indexOf(elements[i]) == -1) {array.push(elements[i]);retValue = true}
        return retValue;
    }
    static featuresAndChildren(THIS:Feature|Display) {
        let typeObj = THIS.argInstance.typeObj;
        if ("features" in typeObj) Display.pushUnique(THIS.o.features, typeObj.features);
        if ("children" in typeObj) Display.pushUnique(THIS.o.children, typeObj.children);
    }
    static addClass(name:string, obj:Object_Any|string){El_Feature.addClass(name, obj);}
    dim:number|string; // created by Features:
    class:string;popClass:Function;el:Element;innerHTML:string;selected:boolean;    
    Arguments:argumentsOptions = {
        argsMap: {  string: "label",
                    boolean: "visible",
                    function: "callBack"
        },
        defaults: {features:[], children:[], visible: true, width:0, height:0, x:0, y:0},
        options: {typeCheck: itemFeature.typeCheck}
    }
    o: DisplayOptions = {};
    argInstance: argsClass;

    constructor(...Arguments: any) {
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);

        this.addFeatures(this.o.features, false);
        this.pullOptionsFromFeatures();

        if (this.o.label == undefined) this.o.label = `Display_${Display.namingIndex++}`;
        this.o.size = new Coord(this, `${this.o.label}_Coord`, Display.update,
                                    this.o.width, this.o.height, this.o.x, this.o.y);

        for(let child of this.o.children) child.o.parent = this;
        this.initFeatures(this.o.features);
        


        D[this.o.label] = this;
        Display.checkWhen(this);
    }
    pullOptionsFromFeatures(features:Feature[] = this.o.features, targetObj:Object_Any = this.o){
        let displayObj:Object_Any;
        for(let i=0; i<features.length; i++) {
            displayObj = features[i].displayObj;
            if (displayObj != undefined)
                for(let key in displayObj) 
                    if (targetObj[key] == undefined) targetObj[key] = displayObj[key];
        }
    }
    addFeatures(features:Feature[]|Feature, init=true){
        // console.log("Adding Features", features, "to Display", this.o.label);
        let feature:Feature;
        if (argsClass.TypeOf(features) != "array") features = [ (<Feature>features) ] ;
        Display.pushUnique(this.o.features, features);
        for(let i=0; i<(<Feature[]>features).length; i++) {
            feature = features[i];
            this.addFeatures(feature.o.features, init);
            //Display.pushUnique(this.o.features, feature.o.features);
            Display.pushUnique(this.o.children, feature.o.children);
        }
        if (init) {
            this.initFeatures(<Feature[]>features);
            Display.checkWhen(this);
        }
    }
    initFeatures(featureArray:Feature[]){
        let feature:any;
        for (let i=0; i< featureArray.length ; i++) {
            feature = featureArray[i];
            feature["parent"] = this;
            if ("init" in feature) feature.init();
        }        
    }
    set visible(value: boolean) {
        this.o.visible = value;
        for(let i=0; i < this.o.features.length; i++)
            if("visible" in this.o.features[i]) this.o.features[i]["visible"] = value;
    }
    get visible(){return this.o.visible;}
    get tree(){Debug.tree(this);return this;}
    addSetters(label:string, getSetObj:Object_Any) {Object.defineProperty(this, label, getSetObj);}
    move(...args:number[]){this.o.size.copy(...args)}
    pointInDisplay(x:number, y:number) {
        return (x >= this.o.size.o.x &&
             x <= this.o.size.o.x + this.o.size.o.width &&
            y >= this.o.size.o.y &&
            y <= this.o.size.o.y + this.o.size.o.height);
    }
}
interface dropFeatureOptions {
    el?: Element;
    label?: string;
    firstCellCoord?: Coord;
    containerCoord?: Coord;
    offsetDirection?: string;
    direction?: string;
    offsetX?:number;        // these are all
    offsetY?:number;        // -1 or 0 or 1
    directionX?: number;    //
    directionY?: number;    //
    width?: number;
    height?: number;
    mouseFeature?: mouseFeature;
    callback?: Function;

    class?:     string;
    selectedClass?: string;
    container?: Display; //containerFeature;
    isDrop?: boolean,
    menuObj?: Object_Any|Object_Any[]; // [ name/Feature(dim), function(){}]

    features: Feature[];
    children: Display[];
}

function drop(...Arguments:any) {
    Arguments.push(true);
    return new dropFeature(...Arguments);
}
function context(...Arguments:any) {
    Arguments.push(false);
    return new dropFeature(...Arguments);
}
class dropFeature extends Feature {
    static dropOptions = ["el", "label", "firstCellCoord", "containerCoord", "offsetDirection", "direction",
        "offsetX", "offsetY", "directionX", "directionY", "width", "height", "class", "selectedClass", "container",
        "isDrop", "menuObj", "features", "children", "callback"];
    static detectDrop(Argument:any, type:string = undefined) {
        if (type == undefined) type = argsClass.TypeOf(Argument);
        if (type == "object") {
            for(let key in Argument) 
                if (dropFeature.dropOptions.indexOf(key) != -1) return type
            return "menuObj";
        }
        return type;
    }
    static mousetol = 3;
    static activeDrops: dropFeature[] = [];
    static onContext(retObj:mouseReturnObject, DROP:dropFeature = undefined){
        retObj.event.preventDefault();
        let DISPLAY = retObj.display;
        if (!DROP) DROP = <dropFeature>Display.feature(DISPLAY, "dropFeature");
        let width = DROP.o.width || DISPLAY.o.size.o.width;
        let height = DROP.o.height || DISPLAY.o.size.o.height;
        let x= retObj.clientX - dropFeature.mousetol;
        let y= retObj.clientY - dropFeature.mousetol;
        DROP.o.firstCellCoord = Coord.newOrupdate(DROP.o.firstCellCoord, width, height, x, y);
        dropFeature.onCommon(retObj, DROP);
    }
    static onMouseOver(retObj:mouseReturnObject, DROP:dropFeature = undefined){
        // console.log("MouseOver Fired");
        let DISPLAY = retObj.mouse.parent;
        if (!DROP) DROP = <dropFeature>Display.feature(DISPLAY, "dropFeature");

        let width = DROP.o.width || DISPLAY.o.size.o.width;
        let height = DROP.o.height || DISPLAY.o.size.o.height;
        let x = DISPLAY.o.size.o.x +
                    ((DROP.o.offsetX == -1) ? -width :
                        ((DROP.o.offsetX == 1) ? DISPLAY.o.size.o.width : 0));
        let y = DISPLAY.o.size.o.y +
                    ((DROP.o.offsetY == -1) ? -height :
                        ((DROP.o.offsetY == 1) ? DISPLAY.o.size.o.height : 0));
        DROP.o.firstCellCoord = Coord.newOrupdate(DROP.o.firstCellCoord, width, height, x, y);
        dropFeature.onCommon(retObj, DROP);
    }
    static onCommon(retObj:mouseReturnObject, DROP:dropFeature){
        retObj.event.preventDefault();
        if (DROP.o.container == undefined) DROP.buildContainer();
        if (dropFeature.activeDrops.indexOf(DROP) == -1) {
            if (!Display.feature(DROP.parent.o.parent.o.parent, "dropFeature") && dropFeature.activeDrops.length)
                dropFeature.popDrops();
                
            dropFeature.activeDrops.push(DROP);
            DROP.o.container.visible = true;

            
            let {width, height, x, y} = DROP.o.firstCellCoord;
            let noChildren = DROP.o.container.o.children.length;
            let direction = (DROP.o.directionX != 0) ? true : false;
            let containerWidth = width * ((direction) ? noChildren : 1);
            let containerHeight = height * ((direction) ? 1 : noChildren);

            DROP.o.containerCoord.copy(containerWidth, containerHeight, x, y);
            DROP.o.container.o.size.copy(containerWidth, containerHeight, x, y);
        }
    }
    debugLabel = "(drop) drop";
    o: dropFeatureOptions;
    Arguments:argumentsOptions = {
        argsMap: {
            string: ["label","offsetDirection","direction", "class", "selectedClass"],
            number: ["width","height","x","y"],
            boolean: "isDrop",
            Element: "el"
        },
        defaults: {label: undefined, offsetDirection:"down", direction:"down", features:[], children:[],
            width:undefined, height:undefined, menuObj:{}, isDrop : undefined, containerCoord: new Coord()},
        options: {typeCheck: dropFeature.detectDrop}
    }
    constructor(...Arguments: any) {
        super(...Arguments);
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);

        if ("menuObj" in this.argInstance.typeObj) this.o.menuObj = this.argInstance.typeObj.menuObj[0];        

        if (Object.keys(drop).length == 0) { // on first call...
            El_Feature.addClass("drop", "cursor:pointer;outline: 1px solid black;background-color:white;");
        }
        this.buildDirection();
        if (this.o.label == undefined) {this.o.label = `drop_${dropFeature.namingIndex++}`};

        if (this.o.el == undefined) this.findEl();
        if (this.o.el != undefined) this.elFound();

        drop[this.o.label] = F[this.o.label] = this;
    }
    buildDirection(){
        let t:any;
        t = this.o.offsetDirection;
        if (this.o.offsetX == undefined) this.o.offsetX = (t == "right") ? 1 : ((t == "left") ? -1 : 0);
        if (this.o.offsetY == undefined) this.o.offsetY = (t == "down") ? 1 : ((t == "up") ? -1 : 0);
        t = this.o.direction;
        if (this.o.directionX == undefined) this.o.directionX = (t == "right") ? 1 : ((t == "left") ? -1 : 0);
        if (this.o.directionY == undefined) this.o.directionY = (t == "down") ? 1 : ((t == "up") ? -1 : 0);
    }
    elFound(){
        let events = {mousemove:this.mouseMove, mouseup:this.mouseUP};
        if (this.o.isDrop != true) events["contextmenu"] = dropFeature.onContext;
        if (this.o.isDrop != false) events["mouseover"] = dropFeature.onMouseOver;
        this.o.mouseFeature = M(this.o.label, events);
    }
    init():void {
        let DISPLAY: Display = this.parent, DROP = this;
        if (this.o.el == undefined) {
            setTimeout(function(){
                if (DISPLAY.el) {
                    DROP.o.el = DISPLAY.el;
                    DROP.elFound();
                    DISPLAY.addFeatures(DROP.o.mouseFeature);
                }
            },0);
        } else DISPLAY.addFeatures(DROP.o.mouseFeature);
    }
    update():void {}
    get VISIBLE(){return this.o.container.visible;}
    set VISIBLE(value:boolean) {this.o.container.visible = value;}
    mouseUP(retObj:mouseReturnObject) {}
    mouseMove(retObj:mouseReturnObject, DROP:dropFeature = undefined) {
        if (!DROP) DROP = <dropFeature>Display.feature(retObj.display, "dropFeature");
        let e = retObj.event;
        if (DROP.o.container && DROP.o.container.visible &&
            dropFeature.activeDrops[dropFeature.activeDrops.length-1] == DROP){
            if (DROP.o.isDrop) {
               if(!DROP.o.container.o.size.isPointIn(e.clientX, e.clientY) &&
                     !DROP.parent.o.size.isPointIn(e.clientX, e.clientY) ){
                    DROP.VISIBLE = false;
                    dropFeature.activeDrops = dropFeature.activeDrops.slice(0, -1);
                }
            }  else {
                if(!DROP.o.container.o.size.isPointIn(e.clientX, e.clientY)){
                    DROP.VISIBLE = false;
                    dropFeature.activeDrops = dropFeature.activeDrops.slice(0, -1);
                }
            }
        }
    }

    static popDrops(){
        for(let i=dropFeature.activeDrops.length-1; i>=0; i--)
            dropFeature.activeDrops[i].VISIBLE = false;
        dropFeature.activeDrops = [];
    }
    buildContainer(){
        let type:string, features: Feature[], type2:string, THIS=this;
        let DISPLAY: Display;
        let children:Display[] = [];             
        let numKeys = Object.keys(this.o.menuObj).length;
        let dim = (this.o.directionX != 0) ? this.o.firstCellCoord.o.width : this.o.firstCellCoord.o.height;
        let menuActionArray:any[], menuAction:any;

        for(let key in this.o.menuObj) { // looping down menu
            numKeys--;
            if (argsClass.TypeOf( this.o.menuObj[key] ) != "array") this.o.menuObj[key] = [ this.o.menuObj[key] ];
            menuActionArray = this.o.menuObj[key];
            features = [];
            DISPLAY = undefined;
            for(let i=0; i < menuActionArray.length; i++){ // looping possible things menu can do
                menuAction = menuActionArray[i];
                type = itemFeature.typeCheck(menuAction, argsClass.TypeOf(menuAction))
                if (type == "features") features.push( <Feature>menuAction );
                if (type == "children") DISPLAY = <Display>menuAction;
                if (type == "function") {
                    let FUNCTION = menuAction;
                    let temp = M(key, function(mObj:mouseReturnObject){
                        FUNCTION(mObj);
                        dropFeature.popDrops();
                    })
                    features.push( temp );
                };
                if (type == "object") features.push( drop({offsetDirection:"right"}, menuAction) );
            }
            if (DISPLAY == undefined) DISPLAY = I({label: key, innerHTML: key, 
                                                    class:"drop", dim: (numKeys == 0) ? `100%` : `${dim}px` });
            
            DISPLAY.addFeatures(features);
            children.push(DISPLAY);
        }
        let direction = (this.o.directionX != 0) ? true : false;
        this.o.container = C(direction, 0, this.o.label, ...children);
        this.o.container.o.parent = this.parent; // NEW CHECK AGAIN~!
        this.o.container["manual"] = true;
        argsClass.vArray(this.parent.o, "children").push( this.o.container );
    }
}
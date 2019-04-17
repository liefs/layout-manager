// import Feature from "./Feature";
interface EL_Selector {(str: string): string;}
interface elFeatureOptions {
    label?:     string;
    visible?:   boolean;
    el?:        Element;
    selector?:  EL_Selector;
    innerHTML?: string;
    class?:     string;
    selectedClass?: string;
    css?:       string;

    selected?: boolean;

    features?: Feature[];
    children?: Display[];
}
function E(...Arguments:any){return new El_Feature(...Arguments);}
class El_Feature extends Feature {
    static css: { [index: string]: Object; } = {
        ".llmItem":{position: "absolute"},
        ".Outline":{outline: "1px solid black"},
        ".llmCell":{outline: "1px solid black", "background-color": "white"}
    };
    static cssPrev = "";
    static addClass(name:string, obj:Object_Any|string){
        if (!name.startsWith(".")) name = "."+name;
        El_Feature.css[name] = <Object_Any>El_Feature.styelObject(obj);
        El_Feature.updateCss();
    }
    static updateCss() {
        let cssString = El_Feature.cssObjToString();
        if (cssString != El_Feature.cssPrev) {
            El_Feature.cssPrev = cssString;
            let style = <any>document.querySelector('#llmStyle');
            let head = document.head || document.getElementsByTagName('head')[0];
            if (style == null) {
                style = <any>document.createElement('style');
                style.type = 'text/css';
                style.id = "llmStyle";
                head.appendChild(style);
            }
            if (style.styleSheet){// This is required for IE8 and below.
                style.styleSheet.cssText = cssString;
            } else {
                style.innerHTML = '';
                style.appendChild(document.createTextNode(cssString));
            }
        }
    }
    static cssObjToString() {
        let outString = "\n";
        for (let className in El_Feature.css) {
            outString += `${className} {\n`;
            for (let prop in El_Feature.css[className])
                outString += `  ${prop} : ${El_Feature.css[className][prop]};\n`
            outString += `}\n`;
        }
        return outString;
    }
    static styleSheetObject(str:string|Object_Any) {return El_Feature.split(str, "{", "}");}
    static styelObject(str:string|Object_Any){return El_Feature.split(str, ":", ";");}    
    static split(str:string|Object_Any, inner:string, outer:string) {
        if (argsClass.TypeOf(str) == "string"){
            let retObj:Object_Any = {};
            let pairsArray:string[];            
            let pairs = (<string>str).split(outer);
            for (let i=0; i<pairs.length; i++) {
                pairsArray = pairs[i].split(inner);
                if (pairsArray[1] != undefined)
                    retObj[ pairsArray[0].trim() ] = (inner == ":") 
                        ? pairsArray[1].trim()
                        : El_Feature.styelObject(pairsArray[1].trim());
            }
            return retObj;
        } else return str;
    }
    static cssClassName = "llmItem";
    static selector(str:string) {return `#${str}`}
    classes:string[] = [El_Feature.cssClassName];
    debugLabel = "(el) E";
    Arguments:argumentsOptions = {
        argsMap: {
            string: ["label", "innerHTML", "class", "selectedClass", "css"],
            boolean: "visible",
            Element: "el",
            function: "selector",
        },
        defaults: { label: undefined, el: undefined, visible : true,
                    selector: El_Feature.selector, features:[], children:[], selected: false},
        options: {typeCheck: itemFeature.typeCheck}
    }
    o: elFeatureOptions;
    constructor(...Arguments: any) {
        super(...Arguments);
        // debugger;
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);
        if (Object.keys(E).length == 0) {
            El_Feature.updateCss();
        } // on init....

        if (this.o.el == undefined) {               // if no element
            if (this.o.label != undefined)          // bu there is a label
                this.o.el = this.uniqueEL( this.o.label );  // check if id out there matches label
        } else if (this.o.label == undefined) this.o.label = this.o.el.id;  // if el, but no label, steal it's id

        if (this.o.label == undefined) this.o.label = `el_${El_Feature.namingIndex++}`;
        if (this.o.el == undefined) this.createElement();
        if (this.o.innerHTML) this.o.el.innerHTML = this.o.innerHTML;
        if (this.o.class) this.class = this.o.class;
        if (this.o.css) {El_Feature.addClass("." + this.o.label , this.o.css);this.class = this.o.label;}

        E[this.o.label] = F[this.o.label] = this;
    }
    init():void {
        let DISPLAY = this.parent, ELEMENT = this;
        this.update();
        DISPLAY.addSetters("class",{    get: function(){return ELEMENT.class;},
                                        set: function(value:string){ELEMENT.class = value;}});
        // DISPLAY.addSetters("popClass",{ set: function(value:string){ELEMENT.popClass(value);}});
        DISPLAY.popClass = function(value:string){ELEMENT.popClass(value);}
        DISPLAY.addSetters("el",{       get: function(){return ELEMENT.o.el;},});
        DISPLAY.addSetters("innerHTML",{get: function(){return ELEMENT.innerHTML;},
                                        set: function(value:string){ELEMENT.innerHTML = value;}});
        DISPLAY.addSetters("selected",{ get: function(){return ELEMENT.selected;},
                                        set: function(value:boolean){ELEMENT.selected = value;}});                                        
    }
    update():void { this.updateElementPosition(); }
    set visible(value:boolean) {
        this.o.visible = value;
        this.o.el["style"]["visibility"] = (value) ? "visible" : "hidden";
        this.update();}
    get visible(): boolean{return this.o.visible;}
    set class(className:string) {
        let classNameArray = className.split(" "), name:string;
        for (let i=0; i < classNameArray.length; i++){
            name = classNameArray[i].trim();
            if (name != "") Display.pushUnique(this.classes, name);
            if (this.o.class == undefined) this.o.class = name;
        }
        if (this.o.el != undefined) this.o.el.className = this.class;
      }
    get class() {
        if (this.classes.length == 1) return this.classes[0] + " Outline";
        return this.classes.join(" ");
    }
    popClass(popValue:string){
        let index = this.classes.indexOf(popValue);
        if (index > -1) this.classes.splice(index, 1);
        this.o.el.className = this.class;
    }
    get innerHTML() {return this.o.el.innerHTML;}    
    set innerHTML(innerHTML:string) {this.o.innerHTML = innerHTML;this.o.el.innerHTML = innerHTML;}
    set selected(value:boolean){
        if (value == true && this.o.selected == false) {
            this.popClass(this.o.class); this.class = this.o.selectedClass;
        }
        if (value == false && this.o.selected == true) {
            this.popClass(this.o.selectedClass); this.class = this.o.class;
        }
        this.o.selected = value;
    }
    get selected(){return this.o.selected;}
    createElement() {
        this.o.el = document.createElement('div'); this.o.el.id = this.o.label;
        document.getElementsByTagName('body')[0].appendChild(this.o.el);
    }
    isModal():number {
        let DISPLAY = this.parent;
        if (modalFeature) 
            while(DISPLAY){
                if (Display.feature(DISPLAY, "modalFeature"))     
                    return modalFeature.activeModals.indexOf( <modalFeature>Display.feature(DISPLAY, "modalFeature") )+1;
                DISPLAY = DISPLAY.o.parent;
            }
        return 0;
    }
    zIndex(){
        return this.isModal()*100 + (rootFeature.handlerNumber*10) + rootFeature.depth(this.parent);
    }
    updateElementPosition() {
        if (this.parent) {
            let size = this.parent.o.size;
            let styleObject = {
                zIndex: this.zIndex(),
                visibility : (this.o.visible) ? "visible" : "hidden",
                left : (this.o.visible) ? `${size.x}px` : `0px`,
                top : (this.o.visible) ? `${size.y}px` : `0px`,
                width : (this.o.visible) ? `${size.width}px` : `0px`,
                height : (this.o.visible) ? `${size.height}px` : `0px`}
            for (let style in styleObject) {
                let value = styleObject[style];
                this.o.el["style"][style] = value;
            }
            this.o.el.className = this.class;
        }
    }
    uniqueEL(str: string) {
        let els = document.querySelectorAll( this.o.selector(str) );
        return (els.length === 1) ? els[0] : undefined;
    }
    static uniqueEL(str: string) {
        let els = document.querySelectorAll( El_Feature.selector(str) );
        return (els.length === 1) ? els[0] : undefined;
    }
}
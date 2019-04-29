class argsClass {
    constructor(sourceInstance, Arguments) {
        this.options = { mergeObj: true, mergeArray: true, typeCheck: undefined };
        this.returnObj = {};
        this.typeObj = {};
        // debugger;
        this.sourceInstance = sourceInstance;
        this.Arguments = Arguments.slice();
        this.argsMap = sourceInstance.Arguments.argsMap;
        this.defaults = sourceInstance.Arguments.defaults;
        Object.assign(this.options, sourceInstance.Arguments.options);
        Object.assign(this.returnObj, this.defaults);
        let Argument, type, valueArray, value;
        for (let i = 0; i < this.Arguments.length; i++) {
            Argument = this.Arguments[i];
            type = argsClass.TypeOf(Argument);
            if (this.options.typeCheck)
                type = this.options.typeCheck(Argument, type);
            argsClass.vArray(this.typeObj, type).push(Argument);
            if (type == "object" && this.options.mergeObj)
                Object.assign(this.returnObj, Argument);
            if (type == "array" && this.options.mergeArray)
                this.Arguments = this.Arguments.concat(Argument);
        }
        for (let mapType in this.argsMap) {
            valueArray = this.argsMap[mapType];
            if (argsClass.TypeOf(valueArray) != "array")
                valueArray = [valueArray];
            for (let i = 0; i < valueArray.length; i++)
                if (mapType in this.typeObj && i < this.typeObj[mapType].length) {
                    this.returnObj[valueArray[i]] = this.typeObj[mapType][i];
                }
        }
        this.sourceInstance["o"] = this.returnObj;
    }
    static TypeOf(value) {
        let valueType = typeof value;
        if (valueType === "object") {
            if (Array.isArray(value)) {
                valueType = "array";
            }
            else if ((value["constructor"] && value.constructor["name"])
                && (typeof value["constructor"] === "function")
                && (["Object", "Array"].indexOf(value.constructor.name) === -1)) {
                valueType = value.constructor.name;
            }
        }
        if (valueType.endsWith("Element"))
            valueType = "Element";
        return valueType;
    }
    static vArray(obj, key) { if (!(key in obj))
        obj[key] = []; return obj[key]; }
    static vObject(obj, key) { if (!(key in obj))
        obj[key] = {}; return obj[key]; }
}
// class ttt {
//     Arguments:argumentsOptions = {
//         argsMap: {
//             string: ["label", "yay"]
//         },
//         defaults: {
//             dim:"120px"
//         },
//     }
//     argInstance: argsClass;
//     o: Object_Any;
//     constructor(...Arguments:any){
//         this.argInstance = new argsClass(this, Arguments);
//     }
// }
function D(...Arguments) {
    return new Display(Arguments);
}
class Display {
    constructor(...Arguments) {
        this.Arguments = {
            argsMap: { string: "label",
                boolean: "visible",
                function: "callBack"
            },
            defaults: { features: [], children: [], visible: true, width: 0, height: 0, x: 0, y: 0 },
            options: { typeCheck: itemFeature.typeCheck }
        };
        this.o = {};
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);
        this.addFeatures(this.o.features, false);
        this.pullOptionsFromFeatures();
        if (this.o.label == undefined)
            this.o.label = `Display_${Display.namingIndex++}`;
        this.o.size = new Coord(this, `${this.o.label}_Coord`, Display.update, this.o.width, this.o.height, this.o.x, this.o.y);
        for (let child of this.o.children)
            child.o.parent = this;
        this.initFeatures(this.o.features);
        D[this.o.label] = this;
        Display.checkWhen(this);
    }
    static copySizeToChildren(DISPLAY) {
        let child;
        for (let i = 0; i < DISPLAY.o.children.length; i++) {
            child = DISPLAY.o.children[i];
            child.o.size.copy(DISPLAY.o.size);
        }
    }
    static update(DISPLAY) {
        let feature;
        for (let i = 0; i < DISPLAY.o.features.length; i++) {
            feature = DISPLAY.o.features[i];
            if ("update" in feature)
                feature.update();
        }
        if ("callBack" in DISPLAY.o)
            DISPLAY.o.callBack(DISPLAY);
    }
    update() { Display.update(this); }
    static feature(DISPLAY, featureClassName) {
        for (let i = 0; i < DISPLAY.o.features.length; i++)
            if (argsClass.TypeOf(DISPLAY.o.features[i]) == featureClassName)
                return DISPLAY.o.features[i];
        return undefined;
    }
    feature(str) { return Display.feature(this, str); }
    static when(label, fn) {
        Display.When[label] = fn;
        console.log(`When Added ${label}`, Display.When);
    }
    static checkWhen(DISPLAY) {
        for (let key in Display.When) {
            if (Display.When[key](DISPLAY)) {
                console.log("When Achieved", key);
                delete Display.When[key];
            }
        }
    }
    static pushUnique(array, elements) {
        let retValue = false;
        if (argsClass.TypeOf(elements) != "array")
            elements = [elements];
        for (let i = 0; i < elements.length; i++)
            if (array.indexOf(elements[i]) == -1) {
                array.push(elements[i]);
                retValue = true;
            }
        return retValue;
    }
    static featuresAndChildren(THIS) {
        let typeObj = THIS.argInstance.typeObj;
        if ("features" in typeObj)
            Display.pushUnique(THIS.o.features, typeObj.features);
        if ("children" in typeObj)
            Display.pushUnique(THIS.o.children, typeObj.children);
    }
    static addClass(name, obj) { El_Feature.addClass(name, obj); }
    pullOptionsFromFeatures(features = this.o.features, targetObj = this.o) {
        let displayObj;
        for (let i = 0; i < features.length; i++) {
            displayObj = features[i].displayObj;
            if (displayObj != undefined)
                for (let key in displayObj)
                    if (targetObj[key] == undefined)
                        targetObj[key] = displayObj[key];
        }
    }
    addFeatures(features, init = true) {
        // console.log("Adding Features", features, "to Display", this.o.label);
        let feature;
        if (argsClass.TypeOf(features) != "array")
            features = [features];
        Display.pushUnique(this.o.features, features);
        for (let i = 0; i < features.length; i++) {
            feature = features[i];
            this.addFeatures(feature.o.features, init);
            //Display.pushUnique(this.o.features, feature.o.features);
            Display.pushUnique(this.o.children, feature.o.children);
        }
        if (init) {
            this.initFeatures(features);
            Display.checkWhen(this);
        }
    }
    initFeatures(featureArray) {
        let feature;
        for (let i = 0; i < featureArray.length; i++) {
            feature = featureArray[i];
            feature["parent"] = this;
            if ("init" in feature)
                feature.init();
        }
    }
    set visible(value) {
        this.o.visible = value;
        for (let i = 0; i < this.o.features.length; i++)
            if ("visible" in this.o.features[i])
                this.o.features[i]["visible"] = value;
    }
    get visible() { return this.o.visible; }
    get tree() { Debug.tree(this); return this; }
    addSetters(label, getSetObj) { Object.defineProperty(this, label, getSetObj); }
    move(...args) { this.o.size.copy(...args); }
}
Display.rootDisplays = {};
Display.displays = {};
Display.namingIndex = 0;
Display.When = {};
let F = {};
class Feature {
    constructor(...Arguments) {
    }
    findEl() {
        for (let i = 0; i < this.o.features.length; i++)
            if ("el" in this.o.features[i].o && this.o.features[i].o.el != undefined)
                this.o.el = this.o.features[i].o.el;
    }
}
Feature.namingIndex = 0;
function h(...Arguments) { return new Display(new containerFeature(true, ...Arguments)); }
function v(...Arguments) { return new Display(new containerFeature(false, ...Arguments)); }
function C(...Arguments) { return new Display(new containerFeature(...Arguments)); }
class containerFeature extends Feature {
    constructor(...Arguments) {
        super(...Arguments);
        this.debugLabel = "(container) C";
        this.Arguments = {
            argsMap: {
                string: "label",
                number: "margin",
                dim: "dim",
                boolean: "direction",
            },
            defaults: { label: undefined, direction: true, margin: 8, dim: undefined, features: [], children: [] },
            options: { typeCheck: itemFeature.typeCheck }
        };
        this.tableMode = false;
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);
        if (this.o.label == undefined) {
            this.o.label = `container_${containerFeature.namingIndex++}`;
        }
        ;
        if (Object.keys(C).length == 0) { // on first call...
            El_Feature.addClass(".Vscroll", "overflow-y: scroll;");
        }
        this.displayObj = { label: this.o.label };
        C[this.o.label] = F[this.o.label] = this;
        if (this.o.direction)
            h[this.o.label] = this;
        else
            v[this.o.label] = this;
    }
    createTable() {
        if (this.tableMode == false) {
            this.tableMode = true;
            let text = "", child, dim, elf, el;
            text += `<table id="page" width="100%" border="0" cellspacing="0" cellpadding="0">\n`;
            for (let i = 0; i < this.o.children.length; i++) {
                child = this.o.children[i];
                text += `<tr style="height:${(child.dim) ? itemFeature.dimToNumber(child.dim) : 0}px"><td id="${child.o.label}_table"></td></tr>\n`;
                elf = Display.feature(child, "El_Feature");
                if (elf) {
                    elf.class = "llmContainer";
                    elf.popClass("llmItem");
                    elf.o.el.style.cssText = "";
                }
            }
            text += `</table></div>\n`;
            let elem = document.createElement('div');
            elem.id = `${this.o.label}_tble`;
            elem.innerHTML = text;
            document.body.appendChild(elem);
            for (let i = 0; i < this.o.children.length; i++) {
                child = this.o.children[i];
                el = document.getElementById(`${child.o.label}_table`);
                if (child.el) {
                    child.el.id += "_";
                    child.el.style.cssText = `height: ${(child.dim) ? itemFeature.dimToNumber(child.dim) : 0}px`;
                    el.appendChild(child.el);
                }
            }
            for (let i = 0; i < this.o.children.length; i++) {
                child = this.o.children[i];
                el = document.getElementById(`${child.o.label}`);
                if (el)
                    el.style.cssText = "visibility: hidden; width:0px;height:0px;left:0px;top:0px";
            }
        }
        this.tableItem = D(`${this.o.label}_tble`, E(`${this.o.label}_tble`, { class: "Vscroll" }));
        this.tableItem.o.size.copy(this.parent.o.size);
    }
    init() {
        let DISPLAY = this.parent, CONTAINER = this;
        DISPLAY.addSetters("dim", {
            get: function () { return CONTAINER.o.dim; },
            set: function (value) {
                let old = CONTAINER.o.dim;
                CONTAINER.o.dim = itemFeature.dimToString(value);
                if (value != old)
                    Display.update(CONTAINER.parent.o.parent);
            }
        });
    }
    update() {
        let DISPLAY = this.parent;
        let child, feature, found, type, dim;
        let fixed = 0, percent = 0, undef = 0, validChildren = [], children = DISPLAY.o.children;
        if (this.tableMode) {
            this.tableItem.o.size.copy(DISPLAY.o.size);
        }
        else {
            // Determine Valid Children
            for (let i = 0; i < children.length; i++) {
                child = children[i];
                feature = undefined;
                found = false;
                for (let j = 0; j < child.o.features.length && !found; j++) {
                    feature = child.o.features[j];
                    if ("dim" in feature.o) {
                        found = true;
                        type = (feature.o.dim == undefined) ? "undefined" : (feature.o.dim.endsWith("%")) ? "percent" : "fixed";
                        if (type == "fixed")
                            fixed += parseInt(feature.o.dim.slice(0, -2));
                        if (type == "percent")
                            percent += parseInt(feature.o.dim.slice(0, -1));
                        if (type == "undefined")
                            undef += 1;
                        validChildren.push({ child, feature, type });
                    }
                }
            }
            let total = (this.o.direction) ? DISPLAY.o.size.width : DISPLAY.o.size.height;
            // Calc and Apply
            //console.log("Total", total, "Fixed", fixed);
            if (total > 0) {
                if (fixed > total) {
                    console.log("Overflow");
                    this.createTable();
                }
            }
            let percentPixels = total - fixed - this.o.margin * (validChildren.length - 1);
            let undefPercent = (undef > 0) ? (100 - percent) / undef : 100 - percent;
            let runningTotal = 0;
            let x, y, width, height;
            // let debugArray = [];
            for (let i = 0; i < validChildren.length; i++) {
                child = validChildren[i].child;
                type = validChildren[i].type;
                feature = validChildren[i].feature;
                dim = (type == "fixed") ? parseInt(feature.o.dim.slice(0, -2)) :
                    (type == "percent") ? Math.round((parseInt(feature.o.dim.slice(0, -1)) / 100.0) * percentPixels) :
                        Math.round((undefPercent / 100.0) * percentPixels);
                x = (this.o.direction) ? DISPLAY.o.size.x + runningTotal : DISPLAY.o.size.x;
                y = (this.o.direction) ? DISPLAY.o.size.y : DISPLAY.o.size.y + runningTotal;
                width = (this.o.direction) ? dim : DISPLAY.o.size.width;
                height = (this.o.direction) ? DISPLAY.o.size.height : dim;
                runningTotal += dim + this.o.margin;
                child.o.size.copy(width, height, x, y);
            }
        }
    }
    get visible() { return this.parent.o.visible; }
    set visible(value) {
        for (let i = 0; i < this.parent.o.children.length; i++) {
            this.parent.o.children[i].visible = value;
        }
    }
    get dim() { return this.o.dim; }
    ;
    set dim(value) {
        let old = this.o.dim;
        if (argsClass.TypeOf(value) == "number")
            value = value.toString() + "px";
        this.o.dim = value;
        if (value != old && this.parent && this.parent.o.parent)
            Display.update(this.parent.o.parent);
    }
}
containerFeature.marginDefault = 8;
class Coord {
    constructor(...Arguments) {
        this.Arguments = {
            argsMap: {
                string: "label",
                number: ["width", "height", "x", "y"],
                function: "callBack",
                Coord: "offset",
                Display: "DISPLAY"
            },
            defaults: { x: 0, y: 0, width: 0, height: 0, DISPLAY: undefined, label: undefined },
        };
        this.argInstance = new argsClass(this, Arguments);
        if (this.o.label == undefined) {
            this.o.label = `Coord_${Coord.namingIndex++}`;
        }
        ;
    }
    isPointIn(x, y) { return (this.o.x <= x) && (this.o.x + this.o.width >= x) && (this.o.y <= y) && (this.o.y + this.o.height >= y); }
    static newOrupdate(test, width, height, x, y) {
        if (argsClass.TypeOf(test) == "Coord") {
            test.copy(width, height, x, y);
            return test;
        }
        return new Coord(width, height, x, y);
    }
    cback() { if ("callBack" in this.o)
        this.o.callBack(this.o.DISPLAY); }
    set width(value) { let old = this.o.width; this.o.width = value; if (value != old)
        this.cback(); }
    set height(value) { let old = this.o.height; this.o.height = value; if (value != old)
        this.cback(); }
    set x(value) { let old = this.o.x; this.o.x = value; if (value != old)
        this.cback(); }
    set y(value) { let old = this.o.y; this.o.y = value; if (value != old)
        this.cback(); }
    get label() { return this.o.label; }
    ;
    get width() { return this.o.width + ((this.o.offset) ? this.o.offset.o.width : 0); }
    get height() { return this.o.height + ((this.o.offset) ? this.o.offset.o.height : 0); }
    get x() { return this.o.x + ((this.o.offset) ? this.o.offset.o.x : 0); }
    get y() { return this.o.y + ((this.o.offset) ? this.o.offset.o.y : 0); }
    copy(width = this.o.width, height = this.o.height, x = this.o.x, y = this.o.y) {
        let isCoord = false;
        let ref;
        if (argsClass.TypeOf(width) == "Coord") {
            isCoord = true;
            ref = width;
        }
        this.width = (isCoord) ? ref.width : width;
        this.height = (isCoord) ? ref.height : height;
        this.x = (isCoord) ? ref.x : x;
        this.y = (isCoord) ? ref.y : y;
    }
}
Coord.namingIndex = 0;
// import Feature from "./Feature";
class Debug {
    constructor() { }
    static error(str) { console.error(str); }
    static warn(str) { console.warn(str); }
    static info(str, obj) {
        console.log(`%c${str}`, Debug.cssLabel, obj.options.options);
    }
    static Debug(obj) {
        if (Debug.level > 0) {
            let type = argsClass.TypeOf(obj);
            switch (type) {
                case ("ROOT_Feature"):
                    // if (typeof(obj.o.dim) == "undefined")
                    //     error(`Item "${obj.o.label}" requires "dim" ie: 20, "20px", or "20%"`);
                    // else
                    Debug.info(`H(Root) "${obj.o.label}" Created`, obj);
                    break;
                case ("Display"):
                    // if (!("dim" in obj)) throw `Item "${obj.o.label}" requires "dim" ie: 20, "20px", or "20%"`;
                    break;
                case ("ITEM_Feature"):
                    // if (typeof(obj.o.dim) == "undefined")
                    //     Debug.error(`Item "${obj.o.label}" requires "dim" ie: 20, "20px", or "20%"`);
                    // else
                    Debug.info(`I(Item) "${obj.o.label}" Created`, obj);
                    break;
                case ("EL_Feature"):
                    if (typeof (obj.o.el) == "undefined")
                        Debug.error(`Item "${obj.o.label}" requires an [Element], or [string] with Element Selector (Default is Element id)`);
                    else
                        Debug.info(`E(element) "${obj.o.label}" Created`, obj);
                    break;
                case ("Options"):
                    break;
                case ("Coord"):
                    break;
                default:
                    throw `No Debugging exists for type ${type}`;
            }
        }
    }
    static tree(root = undefined, open = true) {
        let type = argsClass.TypeOf(root);
        if (type == "boolean") {
            open = root;
            root = undefined;
        }
        if (root) {
            if (type == "Display")
                Debug.Dtree(root, open);
            else if (type == "string") {
                if (root in D)
                    Debug.Dtree(D[root], open);
            }
        }
        else {
            let display_key;
            let display_keys = Object.keys(H);
            for (let i = 0; i < display_keys.length; i++) {
                display_key = display_keys[i];
                Debug.Dtree(D[display_key], open);
            }
        }
    }
    static Dtree(display, open) {
        let size = display.o.size;
        if ("offset" in size.o)
            console.group(`%c(Display) D.%c${display.o.label} %c(${size.width},${size.height},${size.x},${size.y}) %c(${size.o.offset.width},${size.o.offset.height},${size.o.offset.x},${size.o.offset.y})`, Debug.cssDisplay, Debug.cssLabel, Debug.cssCoord, Debug.cssFeature, display);
        else
            console.group(`%c(Display) D.%c${display.o.label} %c(${size.width},${size.height},${size.x},${size.y})`, Debug.cssDisplay, Debug.cssLabel, Debug.cssCoord, display);
        Debug.Otree(display, open);
        console.groupEnd();
    }
    static Otree(display, open) {
        let o = display.o, feature;
        let oNoRepeats;
        if ("features" in o) {
            oNoRepeats = {};
            for (let option in o)
                if (["size", "features", "children", "label"].indexOf(option) < 0)
                    oNoRepeats[option] = o[option];
            if (open) {
                console.group(`%c.o.features [${o.features.length}]`, Debug.cssDisplay, oNoRepeats);
            }
            else {
                console.groupCollapsed(`%c.o.features [${o.features.length}]`, Debug.cssDisplay, oNoRepeats);
            }
            // console.group(`%c.o.features [${o.features.length}]`, Debug.cssDisplay, oNoRepeats);
            for (let i = 0; i < o.features.length; i++) {
                feature = o.features[i];
                Debug.Ftree(feature);
            }
            console.groupEnd();
        }
        if ("children" in o && (o.children != undefined) && o.children.length > 0) {
            let child;
            for (let childIndex = 0; childIndex < o.children.length; childIndex++) {
                child = o.children[childIndex];
                Debug.Dtree(child, open);
            }
        } // else console.log("%c.o.children", Debug.cssDisplay, "None");
    }
    static Ftree(feature) {
        let name = ("debugLabel" in feature) ? feature.debugLabel : argsClass.TypeOf(feature);
        console.groupCollapsed(`%c${name}.%c${feature.o.label}`, Debug.cssFeature, Debug.cssLabel, feature);
        console.log(`%c.o.`, Debug.cssFeature, feature.o);
        if ("el" in feature.o)
            console.log(feature.o.el);
        console.groupEnd();
    }
}
Debug.level = 3; // 0= silent, 1=Error, 2=Warn, 3=Verbose
Debug.cssLabel = "color:blue";
Debug.cssDisplay = "color:green";
Debug.cssFeature = "color:purple";
Debug.cssCoord = "color:red";
function M(...Arguments) {
    return new mouseFeature(...Arguments);
}
class mouseFeature extends Feature {
    constructor(...Arguments) {
        super(...Arguments);
        this.Arguments = {
            argsMap: { string: "label",
                function: "click",
                Element: "el"
            },
            defaults: { label: undefined, features: [], children: [] },
            options: { typeCheck: itemFeature.typeCheck }
        };
        this.debugLabel = "(mouse) M";
        let MOUSE = this;
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);
        if (Object.keys(M).length == 0) {
            window.addEventListener("mousemove", function (e) { mouseFeature.onMove(e); });
            window.addEventListener("mouseup", function (e) { mouseFeature.onUp(e); });
        }
        this.findEl();
        if (this.o.el)
            this.elFound();
        if (this.o.label == undefined) {
            this.o.label = `mouse_${mouseFeature.namingIndex++}`;
        }
        ;
        M[this.o.label] = F[this.o.label] = this;
        // console.log("elementObject", mouseFeature.elementObject);
    }
    static onDown(retObj) {
        retObj.event.preventDefault();
        mouseFeature.dragMouse = retObj.mouse;
        mouseFeature.isDown = true;
        mouseFeature.start.x = retObj.clientX;
        mouseFeature.start.y = retObj.clientY;
    }
    static onMove(e) {
        e.preventDefault();
        if (mouseFeature.isDown) {
            let MOUSE = mouseFeature.dragMouse;
            let dx = mouseFeature.delta.x = e.clientX - mouseFeature.start.x;
            let dy = mouseFeature.delta.y = e.clientY - mouseFeature.start.y;
            if (!(mouseFeature.dragOn)) {
                let d = Math.sqrt(dx * dx + dy * dy);
                if (d > mouseFeature.dragStartThreshold) {
                    mouseFeature.dragOn = true;
                    if ("dragdown" in MOUSE.o)
                        MOUSE.o.dragdown(mouseFeature.returnObj(e, MOUSE));
                }
            }
            if (mouseFeature.dragOn && "dragmove" in MOUSE.o)
                MOUSE.o.dragmove(mouseFeature.returnObj(e, MOUSE));
        }
        let mm = mouseFeature.mousemove;
        for (let i = 0; i < mm.length; i++)
            mm[i].F(mouseFeature.returnObj(e, mm[i].M));
    }
    static onUp(e) {
        e.preventDefault();
        if (mouseFeature.isDown) {
            let MOUSE = mouseFeature.dragMouse;
            if ("dragup" in MOUSE.o && mouseFeature.dragOn)
                MOUSE.o.dragup(mouseFeature.returnObj(e, MOUSE));
            mouseFeature.isDown = false;
            mouseFeature.dragOn = false;
            mouseFeature.dragMouse = undefined;
            mouseFeature.delta.x = 0;
            mouseFeature.delta.y = 0;
            mouseFeature.start.x = 0;
            mouseFeature.start.y = 0;
        }
        let mu = mouseFeature.mouseup;
        for (let i = 0; i < mu.length; i++)
            mu[i].F(mouseFeature.returnObj(e, mu[i].M));
    }
    // left:{
    //     el: document.getElementById("id"),
    //     events: {click: [  {
    //         M:new mouseFeature(),
    //         F:function(o:mouseReturnObject){}
    //     }]}
    static events(el) {
        let O = mouseFeature.elementObject;
        for (let key in O)
            if (O[key].el == el)
                return O[key].events;
        let events = {};
        O[el.id] = { el, events };
        return events;
    }
    static returnObj(e, MOUSE) {
        return { event: e, mouse: MOUSE, display: MOUSE.parent, clientX: e.clientX, clientY: e.clientY, deltaX: mouseFeature.delta.x, deltaY: mouseFeature.delta.y };
    }
    elFound() {
        // console.log("Element Found");
        for (let key in this.o)
            if (["label", "el", "features", "children"].indexOf(key) == -1)
                this.addEvent(key, this.o[key]);
    }
    init() {
        let THIS = this;
        if (!THIS.o.el)
            setTimeout(function () {
                if (THIS.parent.el) {
                    THIS.o.el = THIS.parent.el;
                    THIS.elFound();
                }
            }, 0);
    }
    update() { }
    addEvent(eventName, mouseFunction) {
        // console.log("Adding Event!", eventName);
        let MOUSE = this, mousewhere;
        let events = mouseFeature.events(this.o.el);
        let isDrag = eventName.startsWith("drag");
        if (events[eventName] == undefined) {
            // console.log(eventName,"Seems new!",  events   );
            events[eventName] = [];
            if (eventName != "mousemove" && eventName != "mouseup" && !isDrag)
                this.o.el.addEventListener(eventName, function (e) {
                    // console.log(MOUSE.o.label, "Event Name", eventName, events);
                    for (let i = 0; i < events[eventName].length; i++) {
                        mousewhere = events[eventName][i];
                        if (mousewhere.M.parent == undefined || mousewhere.M.parent.visible) {
                            mousewhere.F(mouseFeature.returnObj(e, MOUSE));
                            // if (MOUSE.o.callback) MOUSE.o.callback(MOUSE);
                            // console.log("PASS", events[eventName][i].M.o.label, events[eventName][i].M);
                        } // else console.log(`FAIL - ${mousewhere.M.parent.o.label}`, events[eventName][i]);
                    }
                });
        }
        let where = { M: this, F: mouseFunction };
        events[eventName].push(where);
        if (isDrag && (!("mousedown" in events) || events.mousedown == []))
            this.addEvent("mousedown", mouseFeature.onDown);
        if (eventName == "mousemove")
            mouseFeature.mousemove.push({ M: MOUSE, F: mouseFunction });
        if (eventName == "mouseup")
            mouseFeature.mouseup.push({ M: MOUSE, F: mouseFunction });
    }
}
mouseFeature.isDown = false;
mouseFeature.dragOn = false;
mouseFeature.start = { x: 0, y: 0 };
mouseFeature.delta = { x: 0, y: 0 };
mouseFeature.dragStartThreshold = 4;
mouseFeature.elementObject = {};
mouseFeature.mousemove = [];
mouseFeature.mouseup = [];
function E(...Arguments) { return new El_Feature(...Arguments); }
class El_Feature extends Feature {
    constructor(...Arguments) {
        super(...Arguments);
        this.classes = [El_Feature.cssClassName];
        this.debugLabel = "(el) E";
        this.Arguments = {
            argsMap: {
                string: ["label", "innerHTML", "class", "selectedClass", "css"],
                boolean: "visible",
                Element: "el",
                function: "selector",
            },
            defaults: { label: undefined, el: undefined, visible: true,
                selector: El_Feature.selector, features: [], children: [], selected: false },
            options: { typeCheck: itemFeature.typeCheck }
        };
        // debugger;
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);
        if (Object.keys(E).length == 0) {
            El_Feature.updateCss();
        } // on init....
        if (this.o.el == undefined) { // if no element
            if (this.o.label != undefined) // bu there is a label
                this.o.el = this.uniqueEL(this.o.label); // check if id out there matches label
        }
        else if (this.o.label == undefined)
            this.o.label = this.o.el.id; // if el, but no label, steal it's id
        if (this.o.label == undefined)
            this.o.label = `el_${El_Feature.namingIndex++}`;
        if (this.o.el == undefined)
            this.createElement();
        if (this.o.innerHTML)
            this.o.el.innerHTML = this.o.innerHTML;
        if (this.o.class)
            this.class = this.o.class;
        if (this.o.css) {
            El_Feature.addClass("." + this.o.label, this.o.css);
            this.class = this.o.label;
        }
        E[this.o.label] = F[this.o.label] = this;
    }
    static addClass(name, obj) {
        if (!name.startsWith("."))
            name = "." + name;
        El_Feature.css[name] = El_Feature.styelObject(obj);
        El_Feature.updateCss();
    }
    static updateCss() {
        let cssString = El_Feature.cssObjToString();
        if (cssString != El_Feature.cssPrev) {
            El_Feature.cssPrev = cssString;
            let style = document.querySelector('#llmStyle');
            let head = document.head || document.getElementsByTagName('head')[0];
            if (style == null) {
                style = document.createElement('style');
                style.type = 'text/css';
                style.id = "llmStyle";
                head.appendChild(style);
            }
            if (style.styleSheet) { // This is required for IE8 and below.
                style.styleSheet.cssText = cssString;
            }
            else {
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
                outString += `  ${prop} : ${El_Feature.css[className][prop]};\n`;
            outString += `}\n`;
        }
        return outString;
    }
    static styleSheetObject(str) { return El_Feature.split(str, "{", "}"); }
    static styelObject(str) { return El_Feature.split(str, ":", ";"); }
    static split(str, inner, outer) {
        if (argsClass.TypeOf(str) == "string") {
            let retObj = {};
            let pairsArray;
            let pairs = str.split(outer);
            for (let i = 0; i < pairs.length; i++) {
                pairsArray = pairs[i].split(inner);
                if (pairsArray[1] != undefined)
                    retObj[pairsArray[0].trim()] = (inner == ":")
                        ? pairsArray[1].trim()
                        : El_Feature.styelObject(pairsArray[1].trim());
            }
            return retObj;
        }
        else
            return str;
    }
    static selector(str) { return `#${str}`; }
    init() {
        let DISPLAY = this.parent, ELEMENT = this;
        this.update();
        DISPLAY.addSetters("class", { get: function () { return ELEMENT.class; },
            set: function (value) { ELEMENT.class = value; } });
        // DISPLAY.addSetters("popClass",{ set: function(value:string){ELEMENT.popClass(value);}});
        DISPLAY.popClass = function (value) { ELEMENT.popClass(value); };
        DISPLAY.addSetters("el", { get: function () { return ELEMENT.o.el; }, });
        DISPLAY.addSetters("innerHTML", { get: function () { return ELEMENT.innerHTML; },
            set: function (value) { ELEMENT.innerHTML = value; } });
        DISPLAY.addSetters("selected", { get: function () { return ELEMENT.selected; },
            set: function (value) { ELEMENT.selected = value; } });
    }
    update() { this.updateElementPosition(); }
    set visible(value) {
        this.o.visible = value;
        this.o.el["style"]["visibility"] = (value) ? "visible" : "hidden";
        this.update();
    }
    get visible() { return this.o.visible; }
    set class(className) {
        let classNameArray = className.split(" "), name;
        for (let i = 0; i < classNameArray.length; i++) {
            name = classNameArray[i].trim();
            if (name != "")
                Display.pushUnique(this.classes, name);
            if (this.o.class == undefined)
                this.o.class = name;
        }
        if (this.o.el != undefined)
            this.o.el.className = this.class;
    }
    get class() {
        if (this.classes.length == 1)
            return this.classes[0] + " Outline";
        return this.classes.join(" ");
    }
    popClass(popValue) {
        let index = this.classes.indexOf(popValue);
        if (index > -1)
            this.classes.splice(index, 1);
        this.o.el.className = this.class;
    }
    get innerHTML() { return this.o.el.innerHTML; }
    set innerHTML(innerHTML) { this.o.innerHTML = innerHTML; this.o.el.innerHTML = innerHTML; }
    set selected(value) {
        if (value == true && this.o.selected == false) {
            this.popClass(this.o.class);
            this.class = this.o.selectedClass;
        }
        if (value == false && this.o.selected == true) {
            this.popClass(this.o.selectedClass);
            this.class = this.o.class;
        }
        this.o.selected = value;
    }
    get selected() { return this.o.selected; }
    createElement() {
        this.o.el = document.createElement('div');
        this.o.el.id = this.o.label;
        document.getElementsByTagName('body')[0].appendChild(this.o.el);
    }
    isModal() {
        let DISPLAY = this.parent;
        if (modalFeature)
            while (DISPLAY) {
                if (Display.feature(DISPLAY, "modalFeature"))
                    return modalFeature.activeModals.indexOf(Display.feature(DISPLAY, "modalFeature")) + 1;
                DISPLAY = DISPLAY.o.parent;
            }
        return 0;
    }
    zIndex() {
        return this.isModal() * 100 + (rootFeature.handlerNumber * 10) + rootFeature.depth(this.parent);
    }
    updateElementPosition() {
        if (this.parent) {
            let size = this.parent.o.size;
            let styleObject = {
                zIndex: this.zIndex(),
                visibility: (this.o.visible) ? "visible" : "hidden",
                left: (this.o.visible) ? `${size.x}px` : `0px`,
                top: (this.o.visible) ? `${size.y}px` : `0px`,
                width: (this.o.visible) ? `${size.width}px` : `0px`,
                height: (this.o.visible) ? `${size.height}px` : `0px`
            };
            for (let style in styleObject) {
                let value = styleObject[style];
                this.o.el["style"][style] = value;
            }
            this.o.el.className = this.class;
        }
    }
    uniqueEL(str) {
        let els = document.querySelectorAll(this.o.selector(str));
        return (els.length === 1) ? els[0] : undefined;
    }
    static uniqueEL(str) {
        let els = document.querySelectorAll(El_Feature.selector(str));
        return (els.length === 1) ? els[0] : undefined;
    }
}
El_Feature.css = {
    ".llmItem": { position: "absolute" },
    ".Outline": { outline: "1px solid black" },
    ".llmCell": { outline: "1px solid black", "background-color": "white" }
};
El_Feature.cssPrev = "";
El_Feature.cssClassName = "llmItem";
function H(...Arguments) {
    let DISPLAY = new Display(new rootFeature(Arguments));
    Display.rootDisplays[DISPLAY.o.label] = DISPLAY;
    return DISPLAY;
}
class rootFeature extends Feature {
    constructor(...Arguments) {
        super(...Arguments);
        this.Arguments = {
            argsMap: { string: ["label", "css"],
                number: "margin",
                Element: "source" },
            defaults: { source: undefined, margin: 8, features: [], children: [] },
            options: { typeCheck: itemFeature.typeCheck }
        };
        this.debugLabel = "(Handler) H";
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);
        document.getElementsByTagName('body')[0]["style"]["margin"] = "0px";
        this.displayObj = { label: this.o.label };
        if (!("label" in this.o)) {
            this.o.label = `root_${rootFeature.namingIndex++}`;
        }
        ;
        if ("css" in this.o) {
            Object.assign(El_Feature.css, El_Feature.styleSheetObject(this.o.css));
            El_Feature.updateCss();
        }
        H[this.o.label] = F[this.o.label] = this;
    }
    static depth(display, count = 0) { return (display.o.parent != undefined) ? rootFeature.depth(display.o.parent, count + 1) : count; }
    static resizeEvent(ev = undefined) {
        let ss = rootFeature.screenSize();
        let display;
        let feature;
        rootFeature.handlerNumber = 0;
        for (let key in Display.rootDisplays) {
            display = Display.rootDisplays[key];
            feature = display.o.features[0];
            Display.rootDisplays[key].move(ss.width - 2 * feature.o.margin, ss.height - 2 * feature.o.margin, feature.o.margin, feature.o.margin);
            rootFeature.handlerNumber++;
        }
    }
    static screenSize() {
        let w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0], width = w.innerWidth || e.clientWidth || g.clientWidth, height = w.innerHeight || e.clientHeight || g.clientHeight;
        return { width, height };
    }
    init() {
        window.onresize = rootFeature.resizeEvent;
        setTimeout(rootFeature.resizeEvent, 0);
    }
    update() {
        Display.copySizeToChildren(this.parent);
    }
}
rootFeature.namingIndex = 0;
rootFeature.size = new Coord("Root");
function I(...Arguments) {
    let root = new itemFeature(...Arguments);
    return new Display(root);
}
class itemFeature extends Feature {
    constructor(...Arguments) {
        super(...Arguments);
        this.debugLabel = "(Item) I";
        this.Arguments = {
            argsMap: {
                string: "label",
                dim: "dim",
            },
            defaults: { dim: undefined, label: undefined, features: [], children: [] },
            options: { typeCheck: itemFeature.typeCheck }
        };
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);
        let typeObj = this.argInstance.typeObj;
        if ("number" in typeObj) {
            let l = typeObj.number.length, no = typeObj.number;
            if (l == 1)
                this.o.dim = no[0];
            else {
                this.o.width = no[0];
                if (l > 1) {
                    this.o.height = no[1];
                    let ss = rootFeature.screenSize();
                    this.o.x = (l > 2) ? no[2] : (ss.width - this.o.width) / 2;
                    this.o.y = (l > 3) ? no[3] : (ss.height - this.o.height) / 2;
                }
            }
        }
        this.o.dim = itemFeature.dimToString(this.o.dim);
        if (this.o.label == undefined) {
            this.o.label = `item_${itemFeature.namingIndex++}`;
        }
        ;
        if ("Element" in typeObj ||
            ("string" in typeObj && typeObj.string.length > 1) ||
            "innerHTML" in this.o ||
            El_Feature.uniqueEL(this.o.label))
            this.o.features.push(E(...Arguments));
        this.displayObj = { label: this.o.label };
        if (this.o.width)
            this.displayObj.width = this.o.width;
        if (this.o.height)
            this.displayObj.height = this.o.height;
        if (this.o.x)
            this.displayObj.x = this.o.x;
        if (this.o.y)
            this.displayObj.y = this.o.y;
        I[this.o.label] = F[this.o.label] = this;
    }
    static typeCheck(Argument, type = undefined) {
        if (type == undefined)
            type = argsClass.TypeOf(Argument);
        let T = itemFeature;
        return T.detectChildren(Argument, T.detectFeature(Argument, T.detectDim(Argument, type)));
    }
    static detectDim(Argument, type = undefined) {
        if (type == undefined)
            type = argsClass.TypeOf(Argument);
        return (type == "string" && (Argument.endsWith("px") || Argument.endsWith("%"))) ? "dim" : type;
    }
    static detectFeature(Argument, type = undefined) {
        if (type == undefined)
            type = argsClass.TypeOf(Argument);
        let TYPE = typeof (Argument);
        return (TYPE == "object"
            && "__proto__" in Argument && "__proto__" in Argument.__proto__
            && (Argument.__proto__.__proto__) && "constructor" in Argument.__proto__.__proto__
            && "name" in Argument.__proto__.__proto__.constructor
            && Argument.__proto__.__proto__.constructor.name == "Feature") ? "features" : type;
    }
    static detectChildren(Argument, type = undefined) {
        if (type == undefined)
            type = argsClass.TypeOf(Argument);
        return (type == "Display") ? "children" : type;
    }
    static dimToString(value) { return (argsClass.TypeOf(value) == "number") ? `${value}px` : value; }
    static dimToNumber(value) {
        let type = argsClass.TypeOf(value);
        if (type == "number")
            return value;
        if (type !== "string")
            return 0;
        if (value.endsWith("px"))
            return parseInt(value.slice(0, -2));
        return 0;
    }
    init() {
        let DISPLAY = this.parent, ITEM = this;
        DISPLAY.addSetters("dim", {
            get: function () { return ITEM.o.dim; },
            set: function (value) {
                let old = ITEM.o.dim;
                ITEM.o.dim = itemFeature.dimToString(value);
                if (value != old && ITEM.parent.o.parent != undefined)
                    ITEM.parent.o.parent.update();
            }
        });
        if (this.o.height)
            DISPLAY.move(this.o.width, this.o.height, this.o.x, this.o.y);
    }
    update() { for (let i = 0; i < this.parent.o.children.length; i++)
        this.parent.o.children[i].update(); }
}
function P(...Arguments) {
    let root = new pageFeature(Arguments);
    return new Display(root.o.label, root);
}
class pageFeature extends Feature {
    constructor(...Arguments) {
        super(...Arguments);
        this.debugLabel = "(page) P";
        this.Arguments = {
            argsMap: {
                string: "label",
                function: "resolve",
                number: "currentPage",
                array: "buttons",
            },
            defaults: { label: undefined, dim: undefined, prevPage: -1, children: [], features: [],
                currentPage: 0, buttons: [], resolve: pageFeature.resolve },
        };
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);
        if (this.o.label == undefined) {
            this.o.label = `page_${pageFeature.namingIndex++}`;
        }
        ;
        if (this.o.buttons != undefined)
            this.applyButtons();
        P[this.o.label] = F[this.o.label] = this;
    }
    static resolve(page, size) { return page.o.currentPage; }
    static switchClass(array, prev, current) {
        if (array != undefined)
            for (let i = 0; i < array.length; i++) {
                Display.feature(array[i], "El_Feature").popClass(prev);
                Display.feature(array[i], "El_Feature").class = current;
            }
    }
    init(THIS_Display) {
        let DISPLAY = this.parent, PAGE = this;
        DISPLAY.addSetters('currentPage', {
            get: function () { return PAGE.o.currentPage; },
            set: function (value) {
                if (value != PAGE.o.currentPage) {
                    PAGE.o.currentPage = value;
                    PAGE.update();
                }
            }
        });
        DISPLAY.addSetters("dim", {
            get: function () { return PAGE.o.dim; },
            set: function (value) {
                let old = PAGE.o.dim;
                PAGE.o.dim = itemFeature.dimToString(value);
                if (value != old)
                    PAGE.parent.o.parent.update();
            }
        });
        this.setStates();
    }
    update() {
        let DISPLAY = this.parent, PAGE = this;
        let retPage = PAGE.o.resolve(PAGE, DISPLAY.o.size);
        if (retPage != PAGE.o.prevPage) {
            if (PAGE.o.prevPage >= 0) {
                DISPLAY.o.children[PAGE.o.prevPage].visible = false;
                if ("buttons" in PAGE.o)
                    pageFeature.switchClass(PAGE.o.buttons[PAGE.o.prevPage], PAGE.o.tabSelectClass, PAGE.o.tabClass);
            }
            DISPLAY.o.children[retPage].visible = true;
            if ("buttons" in PAGE.o)
                pageFeature.switchClass(PAGE.o.buttons[retPage], PAGE.o.tabClass, PAGE.o.tabSelectClass);
            this.o.prevPage = retPage;
        }
        DISPLAY.o.children[retPage]["dim"] = DISPLAY.o["dim"];
        DISPLAY.o.children[retPage].o.size.copy(DISPLAY.o.size);
    }
    set visible(value) {
        if (value == true)
            this.setStates();
    }
    get visible() {
        return this.parent.o.visible;
    }
    setStates() {
        for (let i = 0; i < this.parent.o.children.length; i++)
            this.parent.o.children[i].visible = (i == this.o.currentPage);
    }
    createButtons(dim, tabClass, tabSelectClass, direction = true) {
        this.o.tabClass = tabClass;
        this.o.tabSelectClass = tabSelectClass;
        let buttons = [], child, button, innerHTML, label;
        for (let i = 0; this.o.children.length; i++) {
            child = this.o.children[i];
            label = `${child.o.label}_tab${i}`;
            innerHTML = ("tab" in child.o) ? child.o["tab"] : label;
            button = I(`${dim}px`, label, innerHTML, (this.o.currentPage == i) ? tabSelectClass : tabClass);
            buttons.push(button);
        }
        this.o.buttons = buttons;
        this.applyButtons();
        return C(`${(direction) ? "h" : "v"}_${label}`, direction, ...buttons, I());
    }
    applyButtons() {
        let buttons, THIS = this;
        for (let i = 0; i < this.o.buttons.length; i++) {
            buttons = (argsClass.TypeOf(this.o.buttons[i]) == "array") ?
                this.o.buttons[i] : [this.o.buttons[i]];
            for (let j = 0; j < buttons.length; j++) {
                buttons[j].addFeatures(M(buttons[j].o.label, {
                    mousedown: function (retObj) {
                        retObj.display["currentPage"] = i;
                    }
                }));
            }
        }
    }
}
// interface PageOptions {
//         label?:string;
//         size?:Coord;
//     }
// class Page {
//     static PageOptions: optionsOptions = {
//         default :{ size: new Coord() },
//         assign : {
//             // string: "label",
//             start: ["start", "min", "max"],
//         }
//     }
//     options: Options;
//     set o(obj:PageOptions) {this.options.set(obj);}
//     get o():PageOptions {return this.options.get();}
//     constructor(Arguments: any = []){
//         this.options = new Options(this, Arguments, Page.PageOptions);
//     }
/*
static pages: { [index: string]: Page; } = {};
static P(label: string) {return ((label in Page.pages)) ? Page.pages[label] : undefined;}
static namingIndex = 0;
//static P(label:string) {return Page.pages[label]};
o: options = {};

resolve(coord: Coord){
    let retObj: Child;
    if (this.o.resolveFunction) this.o.currentPage = this.o.resolveFunction(coord);
    if (this.o.currentPage != this.o.prevPage) {
        this.pageChangeEvent();
    }
    retObj = this.o.children[ this.o.currentPage ];
    return retObj;
}
pageChangeEvent(){
    let el:any, argsArray: any[];
    let btnArray = this.elListsArrayFromButtons();
    if ("pageOn" in this.o) {
        argsArray = [this.o.currentPage, this.o.children[this.o.currentPage].o.label ];
        if (btnArray.length > 0) argsArray.push(btnArray[this.o.currentPage]);
        this.o.pageOn( argsArray );
    }
    if ("pageOff" in this.o) {
        argsArray = [this.o.prevPage, (this.o.prevPage != -1) ? this.o.children[this.o.prevPage].o.label : undefined ];
        if (btnArray.length > 0) argsArray.push(btnArray[ this.o.prevPage ]);
        this.o.pageOff( argsArray );
    }
    this.o.prevPage = this.o.currentPage;
    if (this.o.buttons && this.o.classSelected) {
        // let btnArray = this.elListsArrayFromButtons();
        let classArray = this.classSelectedToMatchButtons();
        for(let i=0; i< btnArray.length; i++) {
            for(let j=0; j< btnArray[i].length; j++){
                el = btnArray[i][j];
                if (this.o.currentPage == i) {
                    if (el.hasAttribute("class"))
                        el.setAttribute("prevClass", el.className);
                    el.className = Item.cssClassName + " " + classArray[j];
                } else {
                    if (el.hasAttribute("prevClass")){
                        el.className = el.getAttribute("prevClass");
                        if (el.className == "") el.removeAttribute("class");
                        el.removeAttribute("prevClass");
                    }
                }
            }
        }
    }
}
jsonOut(retAsObject = false): string|options{
    let obj:options = Object.assign({},this.o);
    obj["t"] = "P";
    let cChildren = obj.children;
    obj.children = [];
    cChildren.forEach(child => {
        obj.children.push( child.jsonOut(true) );
    });
    return (retAsObject) ? obj : JSON.stringify(obj, null, 2);
}
addClickEventToButtons(){
    let itemArray:Item[], THIS = this, el:any, bArray:any;
    let buttonArray = this.elListsArrayFromButtons();
    for(let i=0; i < buttonArray.length; i++) {
        bArray = buttonArray[i];
        for(let j=0; j < bArray.length; j++) {
            el = bArray[j];
            if (el != undefined) el.addEventListener("click", function(e:Event){THIS.onButtonClick(i, e);} );
        }
    }
}
classSelectedToMatchButtons(){
    let Arr = this.elListsArrayFromButtons();
    let retArray = [];
    Arr[0].length;
    if (typeof(this.o.classSelected) == "string")
        for(let i=0; i < Arr[0].length; i++)
            retArray.push( this.o.classSelected );
    else retArray = this.o.classSelected;
    return retArray;
}
elListsArrayFromButtons(){
    let retArray = [], itemArray:Item[], el:any, retIArray = []
    if ("buttons" in this.o) {
        for(let i=0; i < this.o.buttons.length ; i++) {
            itemArray = (pf.TypeOf(this.o.buttons[i]) != "array") ? [this.o.buttons[i]] : this.o.buttons[i];
            retIArray = [];
            for (let j=0; j < itemArray.length; j++) {
                el = undefined;
                switch(pf.TypeOf(itemArray[j])) {
                    case "Item": el = itemArray[j].o.el; break;
                    case "Element": el = itemArray[j]; break;
                    case "string": el = pf.isUniqueSelector(`#${itemArray[j]}`); break;
                }
                retIArray.push( el );
            }
            retArray.push( retIArray );
        }
    }
    return retArray;
}
onButtonClick(currentPage:number, e:Event){
    this.o.currentPage = currentPage;
    Handler.resizeEvent();
}
constructor(...Arguments:any){
    if (pf.TypeOf(Arguments) == "array" && Arguments.length == 1) Arguments = Arguments[0];
    let Args = pf.ArgsAsObject(Arguments);
    if ("object" in Args && "pages" in Args.object) { // if pages prop, change to children
        Object.defineProperty(Args.object, "children", Object.getOwnPropertyDescriptor(Args.object, "pages"));
        delete Args.object["pages"];
    }
    if ("object" in Args) { this.o = Args.object[0] }
    if ("string" in Args) {this.o.label = Args["string"][0];}
    if ("children" in Args) {this.o.children = Args["children"]};
    if ("array" in Args) {
        if (this.o.children == undefined) this.o.children = Args["array"][0];
        else this.o.buttons = Args["array"][0];
        if (Args.array.length > 1) this.o.buttons = Args["array"][1];
        }
    if ("number" in Args) this.o.currentPage = Args["number"][0];
    if ("function" in Args) {
        this.o.resolveFunction = Args["function"][0];
        if (Args["function"].length > 1) this.o.pageOn = pf.stringFunction(Args["function"][1]);
        if (Args["function"].length > 2) this.o.pageOff = pf.stringFunction(Args["function"][2]);
    }
    if (!("currentPage" in this.o)) this.o.currentPage = 0;
    if (!(this.o.label)) this.o.label = "page" + (Page.namingIndex++).toString();
    if ("buttons" in this.o) this.addClickEventToButtons();
    this.o.prevPage = -1;
    Page.pages[this.o.label] = this;
}
*/
// }
// function P(...Arguments:any) { return new Page(  Arguments );}
function drop(...Arguments) {
    Arguments.push(true);
    return new dropFeature(...Arguments);
}
function context(...Arguments) {
    Arguments.push(false);
    return new dropFeature(...Arguments);
}
class dropFeature extends Feature {
    constructor(...Arguments) {
        super(...Arguments);
        this.debugLabel = "(drop) drop";
        this.Arguments = {
            argsMap: {
                string: ["label", "offsetDirection", "direction", "class", "selectedClass"],
                number: ["width", "height", "x", "y"],
                boolean: "isDrop",
                Element: "el"
            },
            defaults: { label: undefined, offsetDirection: "down", direction: "down", features: [], children: [],
                width: undefined, height: undefined, menuObj: {}, isDrop: undefined, containerCoord: new Coord() },
            options: { typeCheck: dropFeature.detectDrop }
        };
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);
        if ("menuObj" in this.argInstance.typeObj)
            this.o.menuObj = this.argInstance.typeObj.menuObj[0];
        if (Object.keys(drop).length == 0) { // on first call...
            El_Feature.addClass("drop", "cursor:pointer;outline: 1px solid black;background-color:white;");
        }
        this.buildDirection();
        if (this.o.label == undefined) {
            this.o.label = `drop_${dropFeature.namingIndex++}`;
        }
        ;
        if (this.o.el == undefined)
            this.findEl();
        if (this.o.el != undefined)
            this.elFound();
        drop[this.o.label] = F[this.o.label] = this;
    }
    static detectDrop(Argument, type = undefined) {
        if (type == undefined)
            type = argsClass.TypeOf(Argument);
        if (type == "object") {
            for (let key in Argument)
                if (dropFeature.dropOptions.indexOf(key) != -1)
                    return type;
            return "menuObj";
        }
        return type;
    }
    static onContext(retObj) {
        retObj.event.preventDefault();
        let DISPLAY = retObj.display;
        let DROP = Display.feature(DISPLAY, "dropFeature");
        let width = DROP.o.width || DISPLAY.o.size.o.width;
        let height = DROP.o.height || DISPLAY.o.size.o.height;
        let x = retObj.clientX - dropFeature.mousetol;
        let y = retObj.clientY - dropFeature.mousetol;
        DROP.o.firstCellCoord = Coord.newOrupdate(DROP.o.firstCellCoord, width, height, x, y);
        dropFeature.onCommon(retObj, DROP);
    }
    static onMouseOver(retObj) {
        // console.log("MouseOver Fired");
        let DISPLAY = retObj.mouse.parent;
        let DROP = Display.feature(DISPLAY, "dropFeature");
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
    static onCommon(retObj, DROP) {
        retObj.event.preventDefault();
        if (DROP.o.container == undefined)
            DROP.buildContainer();
        if (dropFeature.activeDrops.indexOf(DROP) == -1) {
            if (!Display.feature(DROP.parent.o.parent.o.parent, "dropFeature") && dropFeature.activeDrops.length)
                dropFeature.popDrops();
            dropFeature.activeDrops.push(DROP);
            DROP.o.container.visible = true;
            let { width, height, x, y } = DROP.o.firstCellCoord;
            let noChildren = DROP.o.container.o.children.length;
            let direction = (DROP.o.directionX != 0) ? true : false;
            let containerWidth = width * ((direction) ? noChildren : 1);
            let containerHeight = height * ((direction) ? 1 : noChildren);
            DROP.o.containerCoord.copy(containerWidth, containerHeight, x, y);
            DROP.o.container.o.size.copy(containerWidth, containerHeight, x, y);
        }
    }
    buildDirection() {
        let t;
        t = this.o.offsetDirection;
        if (this.o.offsetX == undefined)
            this.o.offsetX = (t == "right") ? 1 : ((t == "left") ? -1 : 0);
        if (this.o.offsetY == undefined)
            this.o.offsetY = (t == "down") ? 1 : ((t == "up") ? -1 : 0);
        t = this.o.direction;
        if (this.o.directionX == undefined)
            this.o.directionX = (t == "right") ? 1 : ((t == "left") ? -1 : 0);
        if (this.o.directionY == undefined)
            this.o.directionY = (t == "down") ? 1 : ((t == "up") ? -1 : 0);
    }
    elFound() {
        let events = { mousemove: this.mouseMove, mouseup: this.mouseUP };
        if (this.o.isDrop != true)
            events["contextmenu"] = dropFeature.onContext;
        if (this.o.isDrop != false)
            events["mouseover"] = dropFeature.onMouseOver;
        this.o.mouseFeature = M(this.o.label, events);
    }
    init() {
        let DISPLAY = this.parent, DROP = this;
        if (this.o.el == undefined) {
            setTimeout(function () {
                if (DISPLAY.el) {
                    DROP.o.el = DISPLAY.el;
                    DROP.elFound();
                    DISPLAY.addFeatures(DROP.o.mouseFeature);
                }
            }, 0);
        }
        else
            DISPLAY.addFeatures(DROP.o.mouseFeature);
    }
    update() { }
    get VISIBLE() { return this.o.container.visible; }
    set VISIBLE(value) { this.o.container.visible = value; }
    mouseUP(retObj) { }
    mouseMove(retObj) {
        let DROP = Display.feature(retObj.display, "dropFeature");
        let e = retObj.event;
        if (DROP.o.container && DROP.o.container.visible &&
            dropFeature.activeDrops[dropFeature.activeDrops.length - 1] == DROP) {
            if (DROP.o.isDrop) {
                if (!DROP.o.container.o.size.isPointIn(e.clientX, e.clientY) &&
                    !DROP.parent.o.size.isPointIn(e.clientX, e.clientY)) {
                    DROP.VISIBLE = false;
                    dropFeature.activeDrops = dropFeature.activeDrops.slice(0, -1);
                }
            }
            else {
                if (!DROP.o.container.o.size.isPointIn(e.clientX, e.clientY)) {
                    DROP.VISIBLE = false;
                    dropFeature.activeDrops = dropFeature.activeDrops.slice(0, -1);
                }
            }
        }
    }
    static popDrops() {
        for (let i = dropFeature.activeDrops.length - 1; i >= 0; i--)
            dropFeature.activeDrops[i].VISIBLE = false;
        dropFeature.activeDrops = [];
    }
    buildContainer() {
        let type, features, type2, THIS = this;
        let DISPLAY;
        let children = [];
        let numKeys = Object.keys(this.o.menuObj).length;
        let dim = (this.o.directionX != 0) ? this.o.firstCellCoord.o.width : this.o.firstCellCoord.o.height;
        let menuActionArray, menuAction;
        for (let key in this.o.menuObj) { // looping down menu
            numKeys--;
            if (argsClass.TypeOf(this.o.menuObj[key]) != "array")
                this.o.menuObj[key] = [this.o.menuObj[key]];
            menuActionArray = this.o.menuObj[key];
            features = [];
            DISPLAY = undefined;
            for (let i = 0; i < menuActionArray.length; i++) { // looping possible things menu can do
                menuAction = menuActionArray[i];
                type = itemFeature.typeCheck(menuAction, argsClass.TypeOf(menuAction));
                if (type == "features")
                    features.push(menuAction);
                if (type == "children")
                    DISPLAY = menuAction;
                if (type == "function") {
                    let FUNCTION = menuAction;
                    let temp = M(key, function () {
                        FUNCTION();
                        dropFeature.popDrops();
                    });
                    features.push(temp);
                }
                ;
                if (type == "object")
                    features.push(drop({ offsetDirection: "right" }, menuAction));
            }
            if (DISPLAY == undefined)
                DISPLAY = I({ label: key, innerHTML: key,
                    class: "drop", dim: (numKeys == 0) ? `100%` : `${dim}px` });
            DISPLAY.addFeatures(features);
            children.push(DISPLAY);
        }
        let direction = (this.o.directionX != 0) ? true : false;
        this.o.container = C(direction, 0, this.o.label, ...children);
        this.o.container.o.parent = this.parent; // NEW CHECK AGAIN~!
        this.o.container["manual"] = true;
        argsClass.vArray(this.parent.o, "children").push(this.o.container);
    }
}
dropFeature.dropOptions = ["el", "label", "firstCellCoord", "containerCoord", "offsetDirection", "direction",
    "offsetX", "offsetY", "directionX", "directionY", "width", "height", "class", "selectedClass", "container",
    "isDrop", "menuObj", "features", "children", "callback"];
dropFeature.mousetol = 3;
dropFeature.activeDrops = [];
function S(...Arguments) {
    return new spawnFeature(...Arguments);
}
class spawnFeature extends Feature {
    constructor(...Arguments) {
        super(...Arguments);
        this.Arguments = {
            argsMap: {
                string: "label",
                array: "maps",
                number: ["minWidth", "minHeight", "maxWidth", "maxHeight"]
            },
            defaults: { label: undefined, children: [], features: [], minHeight: 150, minWidth: 150 },
            options: { typeCheck: itemFeature.typeCheck }
        };
        this.debugLabel = "(Spawn) S";
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);
        if (Object.keys(S).length == 0) { // on first call...
            El_Feature.addClass(".ew", "cursor: ew-resize");
            El_Feature.addClass(".ns", "cursor: ns-resize");
            El_Feature.addClass(".nw", "cursor: nw-resize");
            El_Feature.addClass(".sw", "cursor: sw-resize");
        }
        // if ("array" in this.argInstance.typeObj) this.o.maps = this.argInstance.typeObj.array[0];
        if (this.o.label == undefined) {
            this.o.label = `spawn_${spawnFeature.namingIndex++}`;
        }
        ;
        S[this.o.label] = F[this.o.label] = this;
    }
    static dragDown(mrObj) {
        let DISPLAY = mrObj.display;
        let msDISPLAY = DISPLAY.o.parent;
        let sourceDisplay = msDISPLAY.o.parent;
        spawnFeature.startCoord.copy(sourceDisplay.o.size);
    }
    static dragUp(e) {
        // console.log("Up", e);
        spawnFeature.dragtype = "";
    }
    static dragMove(mObj) {
        mObj.event.preventDefault();
        let DISPLAY = mObj.display, msDISPLAY = DISPLAY.o.parent, sourceDisplay = msDISPLAY.o.parent;
        spawnFeature.maps[spawnFeature.dragtype].ONDRAG(sourceDisplay.o.size, mObj);
    }
    static validate(spawn, width, height, x, y) {
        let { width: ssw, height: ssh } = rootFeature.screenSize();
        if (x < 0 || x + width > ssw ||
            y < 0 || y + height > ssh ||
            width < spawn.o.minWidth ||
            height < spawn.o.minHeight ||
            ((spawn.o.maxWidth !== undefined) ? width > spawn.o.maxWidth : false))
            return false;
        return true;
    }
    set visible(value) {
        // console.log(value);
        let children = this.o.display.o.children;
        for (let i = 0; i < children.length; i++)
            children[i].visible = value;
    }
    init() {
        let mapObj;
        let label = this.o.label;
        let child;
        this.o.display = new Display(this.o.label);
        this.o.display.o.parent = this.parent;
        this.parent.o.children.push(this.o.display);
        if ("maps" in this.o)
            for (let i = 0; i < this.o.maps.length; i++) {
                //retObj = this.o.maps[i]
                mapObj = this.o.maps[i];
                if (argsClass.TypeOf(mapObj) == "string") {
                    label = `${this.o.label}_${mapObj}`;
                    mapObj = this.o.maps[i] = spawnFeature.maps[mapObj];
                }
                // let FUNCTION = (<spanMapObj>mapObj).FUNCTION;
                let displayFromFunction = mapObj.MAKEDISPLAY;
                // new ITEM
                let THIS = this;
                setTimeout(() => {
                    child = displayFromFunction(label, THIS.parent);
                    child.o.parent = THIS.o.display;
                    THIS.o.display.o.children.push(child);
                }, 0);
            }
    }
    update() {
        let mapObj;
        this.o.display.o.size.copy(this.parent.o.size);
        for (let i = 0; i < this.o.maps.length; i++) {
            mapObj = this.o.maps[i];
            if ("MAPCHILD" in mapObj) {
                mapObj.MAPCHILD(this.o.display.o.size, this.o.display.o.children[i].o.size, this.o.display);
            }
        }
    }
}
spawnFeature.pixels = 6;
spawnFeature.dragtype = "";
spawnFeature.startCoord = new Coord();
spawnFeature.maps = {
    w: {
        MAPCHILD: function (souceCoord, destCoord, DISPLAY, pixels = spawnFeature.pixels) {
            destCoord.copy(pixels, souceCoord.height - 2 * pixels, (souceCoord.x - pixels / 2), souceCoord.y + pixels);
        },
        MAKEDISPLAY: function (label, DISPLAY) {
            return new Display(label, E(label + "_w", "", "ew"), M({ label: label + "_w",
                dragdown: function (mObj) {
                    spawnFeature.dragtype = "w";
                    spawnFeature.dragDown(mObj);
                },
                dragmove: spawnFeature.dragMove,
                dragup: spawnFeature.dragUp }));
        },
        ONDRAG: function (sourceCoord, mObj) {
            let spawn = Display.feature(mObj.display.o.parent.o.parent, "spawnFeature");
            let dx = mObj.deltaX, { width, height, x, y } = spawnFeature.startCoord;
            if (spawnFeature.validate(spawn, width - dx, height, x + dx, y))
                sourceCoord.copy(width - dx, height, x + dx, y);
        }
    },
    e: {
        MAPCHILD: function (souceCoord, destCoord, DISPLAY, pixels = spawnFeature.pixels) {
            destCoord.copy(pixels, souceCoord.height - 2 * pixels, (souceCoord.x - pixels / 2 + souceCoord.width), souceCoord.y + pixels);
        },
        MAKEDISPLAY: function (label, DISPLAY) {
            return new Display(label, E(label + "_e", "", "ew"), M({ label: label + "_e",
                dragdown: function (mObj) {
                    spawnFeature.dragtype = "e";
                    spawnFeature.dragDown(mObj);
                },
                dragmove: spawnFeature.dragMove,
                dragup: spawnFeature.dragUp }));
        },
        ONDRAG: function (sourceCoord, mObj) {
            let spawn = Display.feature(mObj.display.o.parent.o.parent, "spawnFeature");
            let dx = mObj.deltaX, { width, height, x, y } = spawnFeature.startCoord;
            if (spawnFeature.validate(spawn, width + dx, height, x, y))
                sourceCoord.copy(width + dx, height, x, y);
        }
    },
    n: {
        MAPCHILD: function (sourceCoord, destCoord, DISPLAY, pixels = spawnFeature.pixels) {
            destCoord.copy(sourceCoord.width - 2 * pixels, pixels, sourceCoord.x + pixels, sourceCoord.y - pixels / 2);
        },
        MAKEDISPLAY: function (label, DISPLAY) {
            return new Display(label, E(label + "_n", "", "ns"), M({ label: label + "_n",
                dragdown: function (mObj) {
                    spawnFeature.dragtype = "n";
                    spawnFeature.dragDown(mObj);
                },
                dragmove: spawnFeature.dragMove,
                dragup: spawnFeature.dragUp }));
        },
        ONDRAG: function (sourceCoord, mObj) {
            let spawn = Display.feature(mObj.display.o.parent.o.parent, "spawnFeature");
            let dy = mObj.deltaY, { width, height, x, y } = spawnFeature.startCoord;
            if (spawnFeature.validate(spawn, width, height - dy, x, y + dy))
                sourceCoord.copy(width, height - dy, x, y + dy);
        }
    },
    s: {
        MAPCHILD: function (sourceCoord, destCoord, DISPLAY, pixels = spawnFeature.pixels) {
            destCoord.copy(sourceCoord.width - 2 * pixels, pixels, sourceCoord.x + pixels, sourceCoord.y - pixels / 2 + sourceCoord.height);
        },
        MAKEDISPLAY: function (label, DISPLAY) {
            return new Display(label, E(label + "_s", "", "ns"), M({ label: label + "_s",
                dragdown: function (mObj) {
                    spawnFeature.dragtype = "s";
                    spawnFeature.dragDown(mObj);
                },
                dragmove: spawnFeature.dragMove,
                dragup: spawnFeature.dragUp }));
        },
        ONDRAG: function (sourceCoord, mObj) {
            let spawn = Display.feature(mObj.display.o.parent.o.parent, "spawnFeature");
            let dy = mObj.deltaY, { width, height, x, y } = spawnFeature.startCoord;
            if (spawnFeature.validate(spawn, width, height + dy, x, y))
                sourceCoord.copy(width, height + dy, x, y);
        }
    },
    nw: {
        MAPCHILD: function (source, destCoord, DISPLAY, pixels = spawnFeature.pixels) {
            destCoord.copy(2 * pixels, 2 * pixels, source.x - pixels / 2, source.y - pixels / 2);
        },
        MAKEDISPLAY: function (label, DISPLAY) {
            return new Display(label, E(label + "_nw", "", "nw"), M({ label: label + "_nw",
                dragdown: function (mObj) {
                    spawnFeature.dragtype = "nw";
                    spawnFeature.dragDown(mObj);
                },
                dragmove: spawnFeature.dragMove,
                dragup: spawnFeature.dragUp }));
        },
        ONDRAG: function (sourceCoord, mObj) {
            let spawn = Display.feature(mObj.display.o.parent.o.parent, "spawnFeature");
            let dx = mObj.deltaX, dy = mObj.deltaY, { width, height, x, y } = spawnFeature.startCoord;
            if (spawnFeature.validate(spawn, width - dx, height - dy, x + dx, y + dy))
                sourceCoord.copy(width - dx, height - dy, x + dx, y + dy);
        }
    },
    sw: {
        MAPCHILD: function (source, destCoord, DISPLAY, pixels = spawnFeature.pixels) {
            destCoord.copy(2 * pixels, 2 * pixels, source.x - pixels / 2, source.y - pixels * 1.5 + source.height);
        },
        MAKEDISPLAY: function (label, DISPLAY) {
            return new Display(label, E(label + "_sw", "", "sw"), M({ label: label + "_sw",
                dragdown: function (mObj) {
                    spawnFeature.dragtype = "sw";
                    spawnFeature.dragDown(mObj);
                },
                dragmove: spawnFeature.dragMove,
                dragup: spawnFeature.dragUp }));
        },
        ONDRAG: function (sourceCoord, mObj) {
            let spawn = Display.feature(mObj.display.o.parent.o.parent, "spawnFeature");
            let dx = mObj.deltaX, dy = mObj.deltaY, { width, height, x, y } = spawnFeature.startCoord;
            if (spawnFeature.validate(spawn, width - dx, height + dy, x + dx, y))
                sourceCoord.copy(width - dx, height + dy, x + dx, y);
        }
    },
    ne: {
        MAPCHILD: function (source, destCoord, DISPLAY, pixels = spawnFeature.pixels) {
            destCoord.copy(2 * pixels, 2 * pixels, source.x + source.width - pixels * 1.5, source.y - pixels * .5);
        },
        MAKEDISPLAY: function (label, DISPLAY) {
            return new Display(label, E(label + "_ne", "", "sw"), M({ label: label + "_ne",
                dragdown: function (mObj) {
                    spawnFeature.dragtype = "ne";
                    spawnFeature.dragDown(mObj);
                },
                dragmove: spawnFeature.dragMove,
                dragup: spawnFeature.dragUp }));
        },
        ONDRAG: function (sourceCoord, mObj) {
            let spawn = Display.feature(mObj.display.o.parent.o.parent, "spawnFeature");
            let dx = mObj.deltaX, dy = mObj.deltaY, { width, height, x, y } = spawnFeature.startCoord;
            if (spawnFeature.validate(spawn, width + dx, height - dy, x, y + dy))
                sourceCoord.copy(width + dx, height - dy, x, y + dy);
        }
    },
    se: {
        MAPCHILD: function (source, destCoord, DISPLAY, pixels = spawnFeature.pixels) {
            destCoord.copy(2 * pixels, 2 * pixels, source.x + source.width - pixels * 1.5, source.y - pixels * 1.5 + source.height);
        },
        MAKEDISPLAY: function (label, DISPLAY) {
            return new Display(label, E(label + "_se", "", "nw"), M({ label: label + "_se",
                dragdown: function (mObj) {
                    spawnFeature.dragtype = "se";
                    spawnFeature.dragDown(mObj);
                },
                dragmove: spawnFeature.dragMove,
                dragup: spawnFeature.dragUp }));
        },
        ONDRAG: function (sourceCoord, mObj) {
            let spawn = Display.feature(mObj.display.o.parent.o.parent, "spawnFeature");
            let dx = mObj.deltaX, dy = mObj.deltaY, { width, height, x, y } = spawnFeature.startCoord;
            // let spawn = mObj.display
            if (spawnFeature.validate(spawn, width + dx, height + dy, x, y))
                sourceCoord.copy(width + dx, height + dy, x, y);
        }
    }
};
function Modal_(...Arguments) {
    let root = new modalFeature(...Arguments);
    return root.o.child; //new Display(root.o.label, root);
}
class modalFeature extends Feature {
    constructor(...Arguments) {
        super(...Arguments);
        this.debugLabel = "(Modal) Modal";
        this.isDrag = false;
        this.Arguments = {
            argsMap: {
                string: ["innerHTML", "header", "footer", "label"],
                number: ["width", "height", "x", "y"],
                children: "child",
                Coord: "coord",
            },
            defaults: { label: undefined, features: [], children: [], dragSpawn: ["w", "e", "n", "s", "nw", "sw", "ne", "se"], minHeight: 150, minWidth: 150 },
        };
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);
        if (Object.keys(Modal_).length == 0) { // on first call...
            El_Feature.addClass(".modalHeader", modalFeature.modalHeader);
            El_Feature.addClass(".modalFooter", modalFeature.modalFooter);
            El_Feature.addClass(".modalMain", modalFeature.modalMain);
            El_Feature.addClass(".modalClose", modalFeature.modalClose);
        }
        if (this.o.label == undefined) {
            this.o.label = `modal_${modalFeature.namingIndex++}`;
        }
        ;
        if (modalFeature.activeModals.indexOf(this) == -1)
            modalFeature.activeModals.push(this);
        let ss = rootFeature.screenSize();
        let sw = ss.width;
        let sh = ss.height;
        if (!(this.o.width))
            this.o.width = Math.round(sw / 3);
        if (!(this.o.height))
            this.o.height = Math.round(sh / 3);
        if (!(this.o.x))
            this.o.x = (sw - this.o.width) / 2;
        if (!(this.o.y))
            this.o.y = (sh - this.o.height) / 2;
        if (!("coord" in this.o))
            this.o.coord = new Coord(this.o.width, this.o.height, this.o.x, this.o.y);
        if (!("child" in this.o)) {
            Arguments.push({ class: "modalMain" });
            this.o.child = this.make();
            this.o.child.addFeatures(this);
        }
        let allDivsWithEls = this.allDivsWithEls();
        for (let i = 0; i < allDivsWithEls.length; i++) {
            allDivsWithEls[i].addFeatures(M({ mousedown: modalFeature.movetotop }));
        }
        this.o.child.addFeatures(S("MainSpawn", this.o.dragSpawn, { minWidth: this.o.minWidth, minHeight: this.o.minHeight, maxWidth: this.o.maxWidth, maxHeight: this.o.maxHeight }));
        this.o.child.o.size.copy(this.o.coord);
        Modal_[this.o.label] = F[this.o.label] = this;
    }
    static movetotop(mouseRtrnObj) {
        mouseRtrnObj.event.preventDefault();
        let DISPLAY = modalFeature.display(mouseRtrnObj.display);
        let MODAL = Display.feature(DISPLAY, "modalFeature");
        let index = modalFeature.activeModals.indexOf(MODAL);
        let modalfeature;
        if (index < modalFeature.activeModals.length - 1) {
            modalFeature.activeModals.push(MODAL);
            modalFeature.activeModals.splice(index, 1);
            for (let i = 0; i < modalFeature.activeModals.length; i++) {
                modalfeature = modalFeature.activeModals[i];
                modalfeature.parent.o.size.copy(0, 0, 0, 0);
                modalfeature.parent.o.size.copy(modalfeature.o.coord);
            }
        }
    }
    static dragdown(obj) {
        obj.event.preventDefault();
        let DISPLAY = modalFeature.display(obj.display);
        let MODAL = Display.feature(DISPLAY, "modalFeature");
        MODAL.o.coord.copy(DISPLAY.o.size);
        MODAL.isDrag = true;
    }
    static display(DISPLAY) {
        while (Display.feature(DISPLAY, "modalFeature") == undefined)
            DISPLAY = DISPLAY.o.parent;
        return DISPLAY;
    }
    static dragmove(obj) {
        obj.event.preventDefault();
        let DISPLAY = modalFeature.display(obj.display);
        let MODAL = Display.feature(DISPLAY, "modalFeature");
        if (MODAL.isDrag) {
            let mSize = MODAL.o.coord;
            let dx = obj.deltaX, dy = obj.deltaY;
            let newx = mSize.o.x + dx, newy = mSize.o.y + dy;
            let ss = rootFeature.screenSize();
            if (newx < 0)
                newx = 0;
            if (newx > ss.width - mSize.o.width)
                newx = ss.width - mSize.o.width;
            if (newy < 0)
                newy = 0;
            if (newy > ss.height - mSize.o.height)
                newy = ss.height - mSize.o.height;
            DISPLAY.o.size.copy(mSize.o.width, mSize.o.height, newx, newy);
        }
    }
    static dragup(obj) {
        obj.event.preventDefault();
        let DISPLAY = modalFeature.display(obj.display);
        let MODAL = Display.feature(DISPLAY, "modalFeature");
        if (MODAL.isDrag) {
            MODAL.o.coord.copy(DISPLAY.o.size);
            MODAL.isDrag = false;
        }
    }
    static close(obj) {
        modalFeature.display(obj.display).visible = false;
    }
    allDivsWithEls(containerDisplay = this.o.child) {
        let displaysWithElementsList = [];
        let ElfInstance = Display.feature(containerDisplay, "El_Feature");
        if (ElfInstance != undefined)
            displaysWithElementsList.push(containerDisplay);
        for (let i = 0; i < containerDisplay.o.children.length; i++)
            displaysWithElementsList = displaysWithElementsList.concat(this.allDivsWithEls(containerDisplay.o.children[i]));
        return displaysWithElementsList;
    }
    init() {
    }
    update() {
    }
    set visible(value) {
        let index = modalFeature.activeModals.indexOf(this);
        if (value == true) {
            if (index == -1)
                modalFeature.activeModals.push(this);
            this.parent.o.size.copy(0, 0, 0, 0);
            this.parent.o.size.copy(this.o.coord);
        }
        else if (index != -1)
            modalFeature.activeModals.splice(index, 1);
    }
    make() {
        let children = [];
        if ("header" in this.o) {
            let newI = I(`${this.o.label}_header`, this.o.header, "modalHeader", M({ dragdown: modalFeature.dragdown, dragmove: modalFeature.dragmove,
                dragup: modalFeature.dragup, label: `${this.o.label}_header` }));
            let newIf = Display.feature(newI, "itemFeature");
            if (!modalFeature.use.close) {
                newIf.o.dim = `${modalFeature.modalHeaderHeight}px`;
                children.push(newI);
            }
            else {
                let hor = h(`${this.o.label}_HeaderHor`, `${modalFeature.modalHeaderHeight}px`, 0, newI, I(`${this.o.label}_closeX`, `${modalFeature.modalHeaderHeight}px`, "&nbsp;X", "modalClose", M({ label: `${this.o.label}_closeX`, click: modalFeature.close })));
                children.push(hor);
            }
        }
        children.push(I(`${this.o.label}_Main`, this.o.innerHTML, "modalMain"));
        if ("footer" in this.o) {
            children.push(I(`${modalFeature.modalFooterHeight}px`, `${this.o.label}_footer`, this.o.footer, "modalFooter"));
        }
        return v(`${this.o.label}`, { margin: 0, children });
    }
}
modalFeature.activeModals = [];
modalFeature.use = { close: true };
modalFeature.modalHeader = "background-color: blue;color: white;text-align: center;outline: 1px solid black;cursor: pointer";
modalFeature.modalFooter = "background-color: blue;color: white;outline: 1px solid black";
modalFeature.modalMain = "background-color: white;outline: 1px solid black";
modalFeature.modalClose = "background-color: red;outline: 1px solid black; color: white;cursor: pointer";
modalFeature.modalHeaderHeight = 20;
modalFeature.modalFooterHeight = 20;

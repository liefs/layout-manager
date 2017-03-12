/**
 * This is a doc comment for a dynamic module.
 */


export class Handler {
    static handlers: Array<Handler> = [];
    static isActive: boolean = false;
    static callbackThrottleId: any;
    static resizeCallbackThrottle: number = 0;
    static delayUntilStart: number = 200;
    static showObj: { [index: string]: { show: boolean; el: Element; } } = {};
    label: string;
    myArgsObj: any;
    setArgsObj: Function = setArgsObj;
    position: Coord = new Coord();
    el: any;
    isActive: boolean = true;
    layouts: Array<Layout>;
    activeContainer: Container;
    selector = () => { return "#" + this.label; };
    constructor(...Arguments: any[]) {
      if ((<string>TypeOf(arguments[0])).slice(0, 5)  === "array") {
        this.myArgsObj = argsObj(arguments[0]);
      } else this.myArgsObj = argsObj(arguments);
        this.label = this.setArgsObj("string", 0, "LayoutGroup ");
        if ("array_Layout" in this.myArgsObj) {
            if ("Layout" in this.myArgsObj) liefsError.badArgs("Layouts, OR Arrays of Layouts", "Got Both", "new Handler()");
            this.layouts = this.myArgsObj.array_Layout.shift();
            if (this.myArgsObj.array_Layout.length) new Handler(this.myArgsObj.array_Layout);
        } else if ("Layout" in this.myArgsObj)
            this.layouts = this.myArgsObj.Layout;
        else liefsError.badArgs("Layouts, OR Arrays of Layouts", "Got Both", "new Handler()");
        if (isUniqueSelector(this.selector())) this.el = document.querySelectorAll(this.selector())[0];
        Handler.handlers.push(this);
    }
    static watchForResizeEvent(): void {
        window.onresize = (e: Event) => {
            window.clearTimeout(Handler.callbackThrottleId);
            Handler.callbackThrottleId = window.setTimeout(Handler.resizeEvent(e), Handler.resizeCallbackThrottle);
        };
    }
    static activate() {
        if (!(Handler.isActive)) {
            Handler.isActive = true;
            setTimeout(() => { if (Handler.isActive) Handler.startHandler(); }, Handler.delayUntilStart);
        }
    }
    static createDivList() {
        for (let id of Object.keys(Item.items))
            if (Item.items[id][0].el) Handler.showObj[id] = { el: Item.items[id][0].el, show: false };
        for (let id of Object.keys(Container.containers))
            if (Container.containers[id].el) Handler.showObj[id] = { el: Container.containers[id].el, show: false };
        for (let handler of Handler.handlers)
            if (handler.el) Handler.showObj[handler.label] = { el: handler.el, show: false };
    }
    static startHandler() {
        console.log("Handler Started");
        if (!Handler.handlers.length)
            H("defaultHandler", L("defaultLayout", Container.root(), (x, y) => { return true; }));
        Handler.createDivList();
        Handler.watchForResizeEvent();
        Handler.resizeEvent();
    }
    static resizeEvent(e: Event = null) {
        Handler.Hide();
        for (let eachHandler of Handler.handlers) {
            eachHandler.chooseContainer();
            eachHandler.update();
        }
        for (let eachKey of Object.keys(Handler.showObj))
            if (!Handler.showObj[eachKey].show) {
                directiveSetStyles(Handler.showObj[eachKey].el, {
                    visibility: "hidden", left: "1px", top: "1px", width: "1px", height: "1px"
                });
            } else if (Item.get(eachKey) && Item.get(eachKey).dragBar) Item.get(eachKey).dragBar.update();
    }
    static Hide() { for (let eachKey of Object.keys(Handler.showObj)) Handler.showObj[eachKey].show = false; }
    update() {
        let coord: Coord; let pageItem: Item;
        this.activeContainer.update(this.position.width, this.position.height, this.position.x, this.position.y);
        for (let origKey of Object.keys(this.activeContainer.lastUpdate)) {
            if (origKey in Handler.showObj) {
                coord = this.activeContainer.lastUpdate[origKey];
                pageItem = Item.page(this.activeContainer.itemByLabel(origKey));
                Handler.showObj[pageItem.label].show = true;
                directiveSetStyles(pageItem.el, {
                    visibility: "visible", left: px(coord.x), top: px(coord.y), width: px(coord.width), height: px(coord.height)
                });
            }
        }
    }
    chooseContainer() {
        this.position.getSource(this.el);
        for (let eachLayout of this.layouts)
            if (eachLayout.conditionalFunction(this.position.width, this.position.height)) {
                if (!this.activeContainer) {
                    console.log("Starting With Container: " + eachLayout.container.label);
                }
                else if (this.activeContainer.label !== eachLayout.container.label) {
                    console.log("Switched From Container :" + this.activeContainer.label + " to " + eachLayout.container.label);
                }
                this.activeContainer = eachLayout.container;
                break;
            }
        if (!this.activeContainer) {
            this.activeContainer = (this.layouts[this.layouts.length - 1]).container;
            console.log("All Layout conditionalFunctions failed! Choosing last in list: " + this.activeContainer.label);
        }
    }
}
export function H(...Arguments: Array<any>) { return new Handler(Arguments); }
/**
 * This Interface will be used in the upcomming "Directive" Section.
 * It is not used yet.
 */
export interface Directive {
    el: Element;
    tagname: string;
}

 /**
 * liefsError (singleton Object/Namespace) handles all detected errors in liefs-layout-manager
 * Note: you do nothing with liefsError by itself: See below for supplied methods.
 */
export let liefsError = {
/**
* ##### **liefsError.matchLength - Fuction Description:**
* liefsError.matchLength is called when the incorrect number of arguments for a function is called
* ##### **Example Usage:**
*```javascript
*> liefsError.matchLength(5, 4, "From within Whatever Class/Function with whatever arguments");
*```
* @param expected The expected number of arguments
* @param received The received number of arguments
* @param reference (Optional) Reference to the Class/Function/Id that threw this error
*/
    matchLength: (expected: number, received: number, reference: string = "") => {
        let plus: string = "";
        if (expected < 0) { expected *= -1; plus = "or more "; }
        throw {
            message: "Expected " + plus + expected.toString() + " received " + received.toString() + ".",
            name: "Incorrect Number Of Arguments Error"
        };
    },
/**
* ##### **liefsError.typeMismatch - Fuction Description:**
* liefsError.typeMismatch is called when the incorrect Type of arguments for a function is called
* ##### **Example Usage:**
*```javascript
*liefsError.typeMismatch("only strings", "objects", "From within Whatever Class/Function with whatever arguments");
*```
* @param expected The expected number of arguments
* @param received The received number of arguments
* @param reference (Optional) Reference to the Class/Function/Id that threw this error
*/
    typeMismatch: (expected: string, received: string, reference: string = "") => {
        let msg = reference + " Expected type " + expected.replace("|", " or ") + " received type " + received + ".";
        throw new TypeError(msg);
    },
/**
* ##### **liefsError.badArgs - Fuction Description:**
* liefsError.badArgs (Most Common) is called when required arguments are missing, or supplied arguments make no sense.
* ##### **Example Usage:**
*```javascript
*liefsError.badArgs("Array of Items", "An Item", "From within Whatever Class/Function with whatever arguments");
*```
*
* @param expected The expected number of arguments
* @param received The received number of arguments
* @param reference (Optional) Reference to the Class/Function/Id that threw this error
*/
    badArgs: (expected: string, received: string, reference: string = "") => {
        throw reference + " Expected " + expected + " received " + received + ".";
    }
};
/**
* ##### **onEvent - Fuction Description:**
* onEvent is a simple utility function to make Event Assignment more readable
* ##### **Example Usage:**
*```javascript
*onEvent(document.getElementById("something"), 'onclick', someFunction);
*```
* @param el HTLMElement that you wish to attach a Event Listener to (pointer to)
* @param eventType string of event type ie: 'click'
* @param eventFunction Function to be called when Event Occurs
*/
export function onEvent (el: any, eventType: string, eventFunction: Function) {
  if (el.addEventListener) el.addEventListener(eventType, eventFunction, false);
  else if (el.attachEvent) el.attachEvent(eventType, eventFunction);
}
/**
* ##### **nthIndes - Fuction Description:**
* nthIndex is a simple utility function to extend IndexOf to the nth instance.
* ##### **Example Usage:**
*```javascript
*> nthIndex("testertester","t",2);
*3
*```
* @param str String to be parsed
* @param pat String of pattern to look for
* @param n Number nth occurance
* @return Same as IndexOf ... the index value of the nth Occurance
*/
export function nthIndex(str: string, pat: string, n: number): number {
    let L = str.length, i = -1;
    while (n-- && i++ < L) {
        i = str.indexOf(pat, i);
        if (i < 0) break;
    }
    return i;
}
/**
* ##### **occurances - Fuction Description:**
* occurances is a simple utility to return the number of occurances of a substring in a string.
* ##### **Example Usage:**
*```javascript
*> occurrences("testertester","t");
*4
*```
* @param thisString String to be parsed
* @param subString String of pattern to look for
* @param allowOverlapping boolean allowing overloapping (Not normally what you want)
* @return Number of Occurances of subString in thisString
*/
export function occurrences(thisString: string, subString: string, allowOverlapping: boolean = false): number {
    thisString += "";
    subString += "";
    if (subString.length <= 0) return (thisString.length + 1);
    let n = 0, pos = 0, step = allowOverlapping ? 1 : subString.length;
    while (true) {
        pos = thisString.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}
/**
* ##### **trimCompare - Fuction Description:**
* trimCompare is a simple utility used in conjunction with liefs-layout-manager.TypeOf
* This equates to if b is subset of a, then its still equal
* See liefs-layout-manager.TypeOf to understand how this function would be helpful
* ##### **Example Usage:**
*```javascript
*> trimCompare("one:two:three:four","one:two");
*true
*>  trimCompare("one:two:three:four","one:three");
*false
*```
* @param a Longer TypeOf return value
* @param b Shorted TypeOf return value
* @return True if b is a subset of a
*/
export function trimCompare(a: string, b: string): boolean {
    if (occurrences(b, ":") < occurrences(a, ":"))
        a = a.slice(0, nthIndex(a, ":", occurrences(b, ":") + 1));
    return (a === b);
}
/**
* ##### **isStart - Fuction Description:**
* isStart is a filter function that returns true if any string argument ends with "%" or "px"
* ##### **Example Usage:**
*```javascript
*> isStart("120px");isStart("100%");
*true
*true
*> isStart("IBetThisIsALabelNotAStart");
*false
*```
* @param value string to check if it is of type "start"
*/
export function isStart(value: string): boolean {
    return value.slice(-1) === "%" || value.slice(-2) === "px";
}
/**
* ##### **px - Fuction Description:**
* px is a "short hand" function for adding "px" to an number, and making it a string;
* see vpx for reverse
* ##### **Example Usage:**
*```javascript
*> px(100);
*'100px'
*```
* @param value number to be converted to string, then px added
*/
export function px(value: number): string { return value.toString() + "px"; }
/**
* ##### **vpx - Fuction Description:**
* vpx is a "short hand" function for converting a start value to a number
* see px for reverse
* ##### **Example Usage:**
*```javascript
*> vpx("100px");
*100
*```
* @param value number to be converted to string, then px added
*/
export function vpx(value: string): number { return parseInt(value.slice(0, -2)); }
/**
* ##### **TypeOf - Fuction Description:**
* TypeOf is an extended version of typeof. It as two purposes:
*
* First,(One Argument) It Identifies type, and returns it.  If type is Array, or Object, then it
* assumes string key, and continues to TypeOf the value of Object[key:string].
* "Classes" are return by class name.
*
* Second, (Two Arguments) It compares Typeof First Argument, to pre-resolved type string of 2nd Argument
* ##### **Example Usage:**
*```javascript
*> TypeOf("abc");                                 // OK So far just like typeof
*'string'
*> TypeOf([1, 2, 3]);                             // if object, or array -> recrusive TypeOf
*'array:number'
*> TypeOf(I("Page4","250px"));                    // I() Returns a new instance of class Item
*'Item'
*> TypeOf(Item.items);                            // Items are stored by label, then instance, then class
*'object:array:Item'
*> TypeOf(Container.containers);                  // Containers never have more than one instance.
*'object:Container'
*
*> TypeOf(Item.items, 'object:array:Item');       // note: you can match full answer OR
*true
*> TypeOf(Item.items, 'object:array');            // just a subset
*true
*```
* @param value target of TypeOf (Required) - if no match argument, returns string
* @param match - match string to compare agains result (Optional) return boolean
* @return no match - returns string - match - returns boolean
*/
export function TypeOf(value: any, match: string = undefined): string | boolean {
    let ctype: string = typeof value, temp: string;
    if (ctype === "object")
        if (Array.isArray(value)) ctype = "array:" + TypeOf(<Array<any>>value[0]);
        else if ((value["constructor"] && value.constructor["name"])
            && (typeof value["constructor"] === "function")
            && (["Object", "Array"].indexOf(value.constructor.name) === -1))
            ctype = value.constructor.name;
        else ctype = "object:" + TypeOf(<Object>value[Object.keys(value)[0]]);
    else if (ctype === "string") if (isStart(value)) ctype = "start";
    if (match)
        if (match.indexOf("|") === -1) return trimCompare(ctype, match);
        else {
            for (let each of match.split("|")) if (trimCompare(ctype, each)) return true;
            return false;
        }
    return ctype;
}
/**
* ##### **setArgsObj - Fuction Description:**
* setArgsObj is used in conjunction with argsObj()

*```javascript
* function someFunction(...Arguments) {
*    label:string;
*    myArgsObj: any;                                              // setArgObj refers to "this"
*    setArgsObj: Function = setArgsObj;                           // setArgObj refers to "this"
*    this.myArgsObj = argsObj(arguments);
*    this.label = this.setArgsObj("string", 0, "someFunction");   // this.label is the 0th string in the argument list in this case "Astring"
*}
* > someFunction(1, 2, "Astring", "another string" I("Page2","200px"));
* {"number":[1, 2],
*  "string":["Astring", "another string"],
*  "Item":[{"lastDirection":true,"label":"Page2","start":"200px","current":"200px","instance":2,"el":{}}]}
*```
* @param key TypeOf in question
* @param index - Optional - if ommitted assumes Array[0]
* @param ref - Optional - Displayed as reference if error occurs
* @return The index'th value of this.myArgsObj[key]
*/
export function setArgsObj(key: string, index: number = 0, ref: string = ""): any {
    let target: any;
    if (!(this.myArgsObj)) throw "setArgsObj Empty";
    if ((key in this.myArgsObj) && (index < this.myArgsObj[key].length)) {
        target = this.myArgsObj[key][index];
    }
    return target;
}
/**
* ##### **argsObj - Fuction Description:**
* argsObj is an extesnion of TypeOf.  Its intent is to return the Types of the arguments, as an Object.
*
* so:
* ##### **Example Usage:**
*```javascript
* function someFunction(...Arguments) {
*    console.log(argsObj(arguments));
*}
* > someFunction(1, 2, "string", "another string" I("Page2","200px"));
* {"number":[1, 2],
*  "string":["string", "another string"],
*  "Item":[{"lastDirection":true,"label":"Page2","start":"200px","current":"200px","instance":2,"el":{}}]}
*```
* @param args - Array of Arguments
* @return Object: Keys (srings) of TypeOf - Values - Arrays of Occurances
*/
export function argsObj(args: IArguments): any {
    let retObj: any = {}, ctype: string;
    for (let i = 0; i < args.length; i++) {
        ctype = (<string>TypeOf(args[i])).replace(":", "_");
        if (!(ctype in retObj)) retObj[ctype] = [];
        retObj[ctype].push(args[i]);
    }
    return retObj;
}
/**
* ##### **CheckArgTypes - Fuction Description:**
* CheckArgTypes is a boolean check to see if given arguments include all types
* ##### **Example Usage:**
*```javascript
* function someFunction(...Arguments) {
    CheckArgTypes(arguments, ["string", "number", "Item"], false) // Throws error if Arguments do not include a string, a numbr and an Item.
*}
*```
* @param args - Array of Arguments
* @param types - Array of types expected
* @param reference - Optional - Displayed as reference if error occurs
* @param checkLength - Optional if False, ignores extra arguments. if True, throws error
* @return True if everything matched the way it should
*/
export function CheckArgTypes(args: IArguments, types: string[], reference: string = "", checkLength: boolean = true): boolean {
    reference += " typeCheck";
    if (checkLength && args.length !== types.length)
        liefsError.matchLength(types.length, args.length, reference);
    for (let i = 0; i < types.length; i++)
        if (TypeOf(args[i]) !== types[i])
            liefsError.typeMismatch(types[i], args[i], reference);
    return true;
}
/**
* ##### **el - Fuction Description:**
* el - return element by id
* ##### **Example Usage:**
*```javascript
* el("Pages").style.left;                 // looks up div id="Pages" from dom
*```
* @param id - string value if id
* @return Element matching id
*/
export function el(id: string): Element {
    CheckArgTypes(arguments, ["string"], "el()");
    return document.getElementById(id);
}
/**
* ##### **isUniqueSelector - Fuction Description:**
* isUniqueSelector - is there only one element in the dom to match selection true/false
* ##### **Example Usage:**
*```javascript
* isUniqueSelector("Pages");        // if only one id="Pages" in dom, true, otherwize false.
*```
* @param selector querySelectorAll( selector ) - standard selector string
* @return true if only one match - false otherwize
*/
export function isUniqueSelector(selector: string) {
    return ((document.querySelectorAll(selector)).length === 1);
}
/**
* ##### **directive - Fuction Description:**
* directive - searches dom for querySelectorAll( selector ),
* pulls out all element properties listed in attributesList,
* includes tagname:string  and el: HTMLElement by default.
* It returns the whole thing as an Object
* ##### **Example Usage:**
*```javascript
* >JSON.stringify(directive("#Pages",["id","style"]));
* "[{"el":{},"tagname":"DIV","id":"Pages","style":"position: fixed; visibility: hidden; left: 1px; top: 1px; width: 1px; height: 1px;"}]"
*```
* @param querrySelectorAll querySelectorAll( selector ) - standard selector string
* @param attributesList if only one match - false otherwize
*/
export function directive(querrySelectorAll: string, attributesList: Array<string>): Array<{}> {
    CheckArgTypes(arguments, ["string", "array:string"], "directive()");
    let returnArray: Array<{}> = [];
    let Obj: Directive;
    let NodeList = document.querySelectorAll(querrySelectorAll);
    for (let i = 0; i < NodeList.length; i++) {
        Obj = { el: NodeList[i], tagname: NodeList[i].tagName };
        for (let eachAttribute of attributesList)
            if (NodeList[i].getAttribute(eachAttribute) === undefined) {
                Obj[eachAttribute] = undefined;
                if (NodeList[i].id !== undefined)
                    for (let each in document.querySelectorAll("[" + eachAttribute + "]"))
                        if (each["id"] !== undefined)
                            if (each["id"] === NodeList[i].id)
                                Obj[eachAttribute] = true;
            }
            else
                Obj[eachAttribute] = NodeList[i].getAttribute(eachAttribute);
        returnArray.push(Objectassign(Obj));
    }
    return returnArray;
}
/**
* ##### **directiveSetStyles - Fuction Description:**
* directiveSetStyles - sets the style properties for an element.
* ##### **Example Usage:**
*```javascript
* directiveSetStyles(document.getElementById("something"), {left: "100px", top: "100px", visibility: "hidden"});
*```
* @param el Element to have style properties changed.
* @param stylesObject Object containing key (property) value (to be set value)
*/
export function directiveSetStyles(el: Element, stylesObject: {}): void {
    for (let key of Object.keys(stylesObject)) el["style"][key] = stylesObject[key];
}
/**
* ##### **isItIn - Fuction Description:**
* isItIn - similar to (key in Array), this works for Objects instead of arrays
* ##### **Example Usage:**
*```javascript
* > isItIn("two", {one: 1, two: 2, three: 3});
* true
*```
* @param el Element to have style properties changed.
* @param stylesObject Object containing key (property) value (to be set value)
*/
export function isItIn(key: string, object: {}) {
    let keys = Object.keys(object);
    if (keys.indexOf(key) === -1) return null;
    return object[key];
}
/**
* ##### **Objectassign - Fuction Description:**
* Objectassign - this function is redundant and will be removed in the next revision
*/
export function Objectassign(obj: any): {} {
    let ro = {};
    for (let key in obj) ro[key] = obj[key];
    return ro;
}
/**
* ##### **myIndexOf - Fuction Description:**
* myIndexOf - similar to nthIndex, this returns string after nth occurance of string
* ##### **Example Usage:**
*```javascript
*> myIndexOf("testertester","t", 2, 0)
*"ertester"
*```
* @param sstring - String to be parsed
* @param search - String to search for in sstring
* @param occurance - starting after the nth occurace
* @param start starting at string index[start]
* @return the remainder of sstring, after search start at index start,
* after occurance number of search string found
*/
export function myIndexOf(sstring: string, search: string, occurance: number, start: number): string {
    if (occurance) {
        start = sstring.indexOf(search, start) + 1;
        --occurance;
        if (occurance)
            return myIndexOf(sstring.slice(start), search, occurance, start);
        else
            return sstring.slice(start);
    } else return sstring;
}
export class Coord {
    width: number;
    height: number;
    x: number;
    y: number;
    constructor(width: number = 0, height: number = 0, x: number = 0, y: number = 0) {
        this.width = width; this.height = height; this.x = x; this.y = y;
    }
    getSource(el, byRoot: boolean = true) {
        if (!el) {
            let w = window, d = document, e = d.documentElement,
                g = d.getElementsByTagName("body")[0];
            this.width = w.innerWidth || e.clientWidth || g.clientWidth;
            this.height = w.innerHeight || e.clientHeight || g.clientHeight;
            this.x = 0; this.y = 0;
        } else {
            this.width = el.style.width; this.height = el.style.height;
            let x: number = el.offsetLeft, y: number = el.offsetTop;
            if (byRoot) for (x = 0, y = 0; el != null;
                x += el.offsetLeft, y += el.offsetTop, el = el.offsetParent);
            this.x = x; this.y = y;
        }
    }
}

/**
* ##### **Dragbar - Class Description:**
* Dragbar is a Class that stores all properties relating to Dragbars.
* For each Dragbar, there is an instance of this class created under item(instance).Dragbar
* It is "automatically" created - There is no need to create an instance of this ever.
*
* It is extremly unlikely that there will be any reason to change anything here, noting two possible
* exceptions: Dragbar.width, and Dragbar.Selector
*
* All visible properties of Dragbars are controlled with css .Hdragbar and .Vdragbar
*
* This class can be reached
* by Items.get("ItemName").Dragbar
*/
export class Dragbar {
  /**
  * ##### **Dragbar.mouseDown - Static Method:**
  * internal use only - no reason to call/use - called when dragbar clicked
  */
  static mouseDown (e: any, dragbar: Dragbar) {
    event.preventDefault();
    Dragbar.activeDragbar = dragbar;
    Dragbar.beforeCurrent = dragbar.parent.current;
    Dragbar.isDown = true;
    Dragbar.direction = Container.of(dragbar.parent).direction;
    Dragbar.dragstart = Dragbar.direction ? e.clientX : e.clientY;
  }
  /**
  * ##### **Dragbar.mouseUp - Static Method:**
  * internal use only - no reason to call/use called when mouseUp
  */
  static mouseUp (e: Event) {
    Dragbar.isDown = false;
  }
  /**
  * ##### **Dragbar.mouseMove - Static Method:**
  * internal use only - no reason to call/use - called when mousemove
  */
  static mouseMove (e: any) {
    if (Dragbar.isDown) {
      event.preventDefault();
      let pItem: Item = Dragbar.activeDragbar.parent;
      let dragDiff: number = (Dragbar.direction ? e.clientX : e.clientY) - Dragbar.dragstart;
      let newCurrent: number = vpx(Dragbar.beforeCurrent) + dragDiff;
      if (pItem.min && (newCurrent < vpx(pItem.min))) newCurrent = vpx(pItem.min);
      if (pItem.max && (newCurrent > vpx(pItem.max))) newCurrent = vpx(pItem.max);
      pItem.current = newCurrent.toString() + "px";
      Handler.resizeEvent();
    }
  }
  /**
  * ##### **Dragbar.beforeCurrent - Static String:**
  * internal use only - no reason to call/use - stores "at drag begin" current value.
  */
  static beforeCurrent: string;
  /**
  * ##### **Dragbar.activeDragbar - Static String:**
  * internal use only - no reason to call/use - Instance of Dragbar being dragged
  */
  static activeDragbar: Dragbar;
  /**
  * ##### **Dragbar.direction - Static Boolean:**
  * internal use only - no reason to call/use - will be dropped next version
  */
  static direction: boolean;
  /**
  * ##### **Dragbar.dragstart - Static Number:**
  * internal use only - no reason to call/use
  */
  static dragstart: number;
  /**
  * ##### **Dragbar.isDown - Static Boolean:**
  * internal use only - no reason to call/use - Indicates that the mouse has been clicked on
  * a dragbar, and is waiting to come up
  */
  static isDown = false;
  /**
  * ##### **Dragbar.noInit - Static Boolean:**
  * internal use only - no reason to call/use - needs "on first instance set up"
  * false to start, true after first instance of Dragbar
  */
  static noInit: boolean = true;
  /**
  * ##### **Dragbar.Selector - anonymous function:**
  * internal use only - no reason to call/use - Indicates the selector uses to find the Dragbar
  * in this version it is Item.selector() + " > ." + ("Hdragbar" or "Vdragbar")
  *
  * This could be changed by resetting this anonymous function
  */
  Selector = () => { return this.parent.selector() + " > ." + (this.parent.lastDirection ? "H" : "V") + "dragbar"; };
  /**
  * ##### **Dragbar.el - pointer to dragbar element on page:**
  * internal use only - no reason to call/use
  */
  el: Element;
  /**
  * ##### **Dragbar.size - Class Coord Object containing dimensions needed to plot this Dragbar**
  * internal use only - no reason to call/use
  */
  size: Coord = new Coord();
  /**
  * ##### **Dragbar.front - boolean showing if dragbar is at front of Item (true - default) or back of Item - false;**
  *
  * Note this parameter is set when defining and item, not here. See Item.I()
  *
  * internal use only - no reason to call/use
  */
  front: boolean = true;
  /**
  * ##### **Dragbar.parent - Parent Class Item that controls this Dragbar**
  * internal use only - no reason to call/use
  */
  parent: Item;
  /**
  * ##### **Dragbar.width**
  * This horribly named parameter is the width of the dragbar;
  * Note: a dragbar has to be visible to work, so making this value larger than margin
  * will make the dragbar visible.  similarily, if the width is too small, it will be
  * difficult for the mouse to click the dragbar
  * Optional resetting this value to suit:
  *```javascript
  *Item.get("ItemLabel").Dragbar.width = 5; // or any new value
  *```
  */
  width: number;
  /**
  * ##### **Dragbar.constructor**
  * internal use only - no reason to call/use
  * this class is created by Item automatically - no reason to create an instance manually.
  */
  constructor(item: Item, front: boolean = true, width = undefined) {
    this.parent = item;
    this.front = front;
    if (document.querySelectorAll(this.Selector()).length)
        this.el = document.querySelectorAll(this.Selector())[0];
    else {
        this.el = document.createElement("div");
        this.el.className = Container.of(item).direction ? "Hdragbar" : "Vdragbar";
        if (this.parent.el.firstChild) this.parent.el.insertBefore(this.el, this.parent.el.firstChild);
        else this.parent.el.appendChild(this.el);
    }
    if (Dragbar.noInit) {
      onEvent(document.body, "mouseup", Dragbar.mouseUp);
      onEvent(document.body, "mousemove", Dragbar.mouseMove);
      Dragbar.noInit = false;
    }
    onEvent(this.el, "mousedown", (e) => { Dragbar.mouseDown(e, this); } );
    this.width = width || Container.of(item).margin || Container.marginDefault;
  }
  /**
  * ##### **Dragbar.update**
  * internal use only - no reason to call/use
  * this function is called on resizeEvent to recalculate the Coord Class
  */
  update() {
    for (let eachKey of Object.keys(this.size)) this.size[eachKey] = this.parent.size[eachKey];
    if (Container.of(this.parent).direction) {
      this.size.x += this.parent.size.width;
      this.size.width = this.width;
    } else {
      this.size.y += this.parent.size.height;
      this.size.height = this.width;
    }
    directiveSetStyles(this.el, {
      left: px(this.size.x), top: px(this.size.y), width: px(this.size.width), height: px(this.size.height)
    });
  }
}
export class Item {
    static get(label: string, instance = 0): Item {
        if (label in Item.items) return Item.items[label][instance];
        return undefined;
    }
    static h(...Arguments: any[]) {
        Arguments.push("hor");
        return I(...Arguments);
    }
    static v(...Arguments: any[]) {
        Arguments.push("ver");
        return I(...Arguments);
    }
    static I(...Arguments: any[]): Item {
        let newItem: Item;
        let myArgsObj = argsObj(arguments);
        let Ilabel: string, Istart: string, Imin: string, Imax: string, Imargin: number;
        let Iitems: Array<Item>, Icontainer: Container, IisHor: boolean;
        let isItem: string;
        let IpageTitle: string;
        let dragFront: boolean = true;
        if ("array_Item" in myArgsObj) {
            if (!("Item" in myArgsObj)) myArgsObj.Item = [];
            for (let eachArray of myArgsObj["array_Item"])
                for (let eachItem of eachArray)
                    myArgsObj.Item.push(eachItem);
        }
        if ("number" in myArgsObj) Imargin = myArgsObj.number[0];
        if ("string" in myArgsObj) {
            for (let i = 0; i < myArgsObj.string.length; i++) {
                isItem = myArgsObj.string[i];
                if (isItem[0] === "*") {
                    myArgsObj.string[i] = isItem.slice(1);
                    dragFront = false;
                }
                if (isItem[0] === "-" || isItem[0] === "|") {
                    IisHor = (isItem[0] === "-");
                    myArgsObj.string[i] = isItem.slice(1);
                }
                if (isItem.slice(-1) === "-" || isItem.slice(-1) === "|") {
                    IisHor = (isItem.slice(-1) === "-");
                    myArgsObj.string[i] = isItem.slice(0, -1);
                }
                if (isItem.slice(0, 3) === "hor" || isItem.slice(0, 3) === "ver")
                    IisHor = (isItem.slice(0, 3) === "hor");
                else if (!(Ilabel))
                    Ilabel = myArgsObj.string[i];
                else if (!(IpageTitle))
                    IpageTitle = myArgsObj.string[i];
                if (isItem in Item.items) {
                    if (!myArgsObj["item"]) myArgsObj["item"] = [];
                    myArgsObj["item"].push(items[isItem]);
                }
            }
        }
        if ("start" in myArgsObj) {
            Istart = myArgsObj.start[0];
            if (myArgsObj.start.length > 1) Imin = myArgsObj.start[1];
            if (myArgsObj.start.length > 2) Imax = myArgsObj.start[2];
            if (myArgsObj.start.length > 3)
                liefsError.badArgs("Start, Min, Max", "That, and more!", "Create Instance Of Item() " + JSON.stringify(myArgsObj.start.slice(3)));
        }
        if ("Item" in myArgsObj) { Iitems = myArgsObj.Item; }
        if ("Container" in myArgsObj) Icontainer = myArgsObj.container[0];
        if (!Ilabel) Ilabel = "item" + (Object.keys(Item.items).length / 1000).toFixed(3).slice(-3);
        if (!Istart) Istart = "0px";
        if (Iitems && Icontainer) liefsError.badArgs("items, or a container.", "received both", "Create Instance Of Item() " + Ilabel);
        if (Iitems) {
            if (IisHor === undefined) {
                newItem = new Item(Ilabel, Istart, Imin, Imax);
                newItem.pages = Iitems;
                newItem.pages.unshift(newItem);
                newItem.currentPage = 0;
                return newItem;
            }
            else
                Icontainer = new Container(Ilabel, IisHor, Iitems, Imargin);
        }
        newItem = new Item(Ilabel, Istart, Imin, Imax, Icontainer);
        if (IpageTitle) newItem.pageTitle = IpageTitle;
        if (!dragFront) newItem.dragBar.front = dragFront;
        return newItem;
    }
    static nextPage(item_: Item | string, stop: boolean = false) {
        let item: Item = Item.parseItem(item_);
        if (item.currentPage + 1 < item.pages.length) Item.setPage(item, item.currentPage + 1);
        else if (!stop) Item.setPage(item, 0);
    }
    static backPage(item_: Item | string, stop: boolean = false) {
        let item: Item = Item.parseItem(item_);
        if (item.currentPage > 0) Item.setPage(item, item.currentPage - 1);
        else if (!stop) Item.setPage(item, item.pages.length - 1);
    }
    static setPage(item_: Item | string, value: string | number) {
        Item.parseValue(value, Item.parseItem(item_));
        Handler.resizeEvent();
    }
    static parseValue(value_: string | number, item: Item) {
        let foundPage: boolean = false;
        if (TypeOf(value_, "string")) {
            for (let i = 0; i < item.pages.length; i++)
                if (item.pages[i].label === <string>value_) {
                    item.currentPage = i;
                    foundPage = true;
                    break;
                }
            if (!foundPage) liefsError.badArgs("page id not found", <string>value_, "Item setPage");
        }
        else {
            if (item.pages.length - 1 < <number>value_) liefsError.badArgs("Max Pages for " + item.label + " is " + item.pages.length, (<number>value_).toString(), "Item setPage");
            item.currentPage = <number>value_;
        }
    }
    static parseItem(item_: Item | string): Item {
        let item: Item;
        if (TypeOf(item_, "string")) {
            if (!isItIn(<string>item_, Item.items)) liefsError.badArgs("Item Name Not Identified", <string>item_, "Item - setPage()");
            item = Item.items[<string>item_][0];
        }
        else item = <Item>item_;
        if (!item.pages) liefsError.badArgs("Item " + item.label + " to be defined with pages", "it wasn't", "Item - setPage()");
        return item;
    }
    static page(item: Item): Item { return (item.pages) ? item.pages[item.currentPage] : item; }
    static debug = true;
    static items: { [index: string]: Array<Item>; } = {};
    label: string;
    instance: number;
    start: string;
    current: string;
    lastDirection: boolean = true;
    size: Coord;
    min: string;
    max: string;
    container: Container;
    pages: Array<Item>;
    pageTitle: string;
    currentPage: number;
    el: Element;
    selector = () => { return "#" + this.label; };
    dragBar: Dragbar;
    constructor(label: string, start: string, min: string = undefined, max: string = undefined, container: Container = undefined) {
        let el: any;
        this.label = label;
        this.current = this.start = start;
        if (min) this.min = min;
        if (max) this.max = max;
        if (container) this.container = container;
        if (!(label in Item.items)) Item.items[label] = [];
        this.instance = Item.items[label].length;
        Item.items[label].push(this);
        if (typeof Handler === "function") Handler.activate();
        if (this.start === "0px") Container.suspectedRoot = this.container;
        if (isUniqueSelector(this.selector())) {
            this.el = document.querySelectorAll(this.selector())[0];
            this.el["style"]["position"] = "fixed";
            if (min || max) setTimeout(() => {this.dragBar = new Dragbar(this); }, 0);
        }
        else if ((!this.container) && !("jasmineTests" in window))
            liefsError.badArgs("Selector Search for '" + this.label + "' to find ONE matching div",
                "Matched " + document.querySelectorAll(this.selector()).length.toString() + " times", "Handler Item Check");
    }
}
export let I = Item.I;
export let v = Item.v;
export let h = Item.h;
export let items = Item.items;
export class Container {
    static of(item: Item) {
        for (let eachKey of Object.keys(Container.containers))
            if (Container.containers[eachKey].items.indexOf(item) > -1)
                return Container.containers[eachKey];
        console.log("Container of Error: Containers");
        console.log(Container.containers);
        console.log(item);
        return undefined;
    }
    static get(label: string) {
        if (label in Container.containers) return Container.containers[label];
        return undefined;
    }
    static push(container: Container): Container {
        Container.containers[container.label] = container;
        return container;
    }
    static fixed(container: Container, width: number, height: number): number {
        const NOTDEFINED: number = -999;
        let fixed: number = 0;
        let newSize: number = NOTDEFINED;
        for (let eachItem of container.items) {
            if (!(eachItem.size)) eachItem.size = new Coord;
            if (eachItem.current.slice(-2) === "px") newSize = parseInt(eachItem.current.slice(0, -2));
            if (newSize !== NOTDEFINED) {
                fixed = fixed + newSize;
                eachItem.size.width = (container.direction) ? newSize : width - container.margin * 2;
                eachItem.size.height = (container.direction) ? height - container.margin * 2 : newSize;
                newSize = NOTDEFINED;
            }
        }
        return fixed;
    }
    static percent(container: Container, width: number, height: number, fixed: number): void {
        let max = (container.direction) ? width : height;
        let pixelsLeftForPercent: number = (max - fixed - container.margin * (container.items.length + 1));
        let newPercent: number;
        for (let eachItem of container.items) {
            eachItem.lastDirection = container.direction;
            if ((typeof eachItem.current === "string") && eachItem.current.slice(-1) === "%") {
                newPercent = parseInt(eachItem.current.slice(0, -1));
                eachItem.size.width = (container.direction) ? parseInt((pixelsLeftForPercent * (newPercent / 100)).toFixed(0))
                    : width - container.margin * 2;
                eachItem.size.height = (container.direction) ? height - container.margin * 2
                    : parseInt((pixelsLeftForPercent * (newPercent / 100)).toFixed(0));
            }
        }
    }
    static fill(container: Container, xOffset: number = 0, yOffset: number = 0): void {
        let margin: number = container.margin;
        let sum: number = margin;
        for (let eachItem of container.items) {
            if (container.direction) {
                eachItem.size.x = xOffset + sum;
                sum = sum + eachItem.size.width + margin;
                eachItem.size.y = yOffset + margin;
            }
            else {
                eachItem.size.x = xOffset + margin;
                eachItem.size.y = yOffset + sum;
                sum = sum + eachItem.size.height + margin;
            }
        }
    }
    static updateRecursive(width: number, height: number, container: Container, xOffset: number = 0, yOffset: number = 0, includeParents: boolean = false): { [index: string]: Coord } {
        let returnObject: { [index: string]: Coord } = {};
        Container.percent(container, width, height, Container.fixed(container, width, height));
        Container.fill(container, xOffset, yOffset);
        for (let thisItem of container.items) {
            let width = thisItem.size.width + container.margin * 2;
            let height = thisItem.size.height + container.margin * 2;
            let x = thisItem.size.x - container.margin;
            let y = thisItem.size.y - container.margin;
            if ("container" in thisItem && (thisItem["container"])) {
                if (includeParents) returnObject[thisItem.label] = thisItem.size;
                let temp = Container.updateRecursive(width, height, thisItem.container, x, y);
                for (let attrname in temp) returnObject[attrname] = temp[attrname];
            }
            returnObject[thisItem.label] = thisItem.size;
        }
        return returnObject;
    }
    static debug = true;
    static containers: { [index: string]: Container; } = {};
    static marginDefault: number = 4;
    static suspectedRoot: Container;
    static lastDefined: Container;
    static root() {
        return (Container.suspectedRoot)
            ? Container.suspectedRoot : Container.lastDefined;
    }
    label: string;
    margin: number;
    direction: boolean;
    items: Item[] = [];
    lastUpdate: { [index: string]: Coord };
    el: Element;
    selector = () => { return "#" + this.label; };
    constructor(label: string, trueIsHor: boolean, items: Item[], margin: number = Container.marginDefault) {
        console.log("Defined Container" + label);
        this.label = label; this.direction = trueIsHor; this.items = items; this.margin = margin;
        Container.containers[label] = Container.lastDefined = this;
        this.itemsCheck();
        if (isUniqueSelector(this.selector())) this.el = document.querySelectorAll(this.selector())[0];
    }
    itemsCheck() {
        let totalPercent: number = 0;
        for (let eachItem of this.items)
            if (eachItem.start.slice(-1) === "%") totalPercent += parseInt(eachItem.start.slice(0, -1));
        if (totalPercent !== 100) liefsError.badArgs(this.label + " to total 100%", " a total of " + totalPercent.toString() + "%", "Container.itemsCheck()");
    }
    update(width: number, height: number, xOffset: number = 0, yOffset: number = 0, includeParents: boolean = false): void  {
        this.lastUpdate = Container.updateRecursive(width, height, this, xOffset, yOffset, includeParents);
    }
    itemByLabel(label: string): Item {
        for (let item of this.items)
            if (item.label === label) return item;
            else if (item.container && item.container.itemByLabel(label)) return item.container.itemByLabel(label);
        return undefined;
    }
}
export class Layout {
 label: string;
 isActive: boolean = true;
 container: Container;
 conditionalFunction: Function;
 myArgsObj: any;
 setArgsObj: Function = setArgsObj;
 constructor(...Arguments: any[]) {
   if ((<string>TypeOf(arguments[0])).slice(0, 5)  === "array") {
     this.myArgsObj = argsObj(arguments[0]);
   } else this.myArgsObj = argsObj(arguments);
   this.label = this.setArgsObj("string", 0, "layout ");
   this.conditionalFunction = this.setArgsObj("function", 0, "layout ");
   this.container = this.setArgsObj("Container", 0, "layout ");
   if ("Item" in this.myArgsObj) {
     this.container = (this.myArgsObj.Item[0]).container;
     if (!this.container)
       throw liefsError.badArgs("Container or Item-Parent of Container",
                   "Item - not the Parent of a Container", "New Layout" + ((this.label) ? " '" + this.label + "'" : ""));
   }
   if (!(this.container && this.conditionalFunction)) {
     liefsError.badArgs("At Least One Function and One Item/Container",
       JSON.stringify(Object.keys(this.myArgsObj)), "Create Instance Of Layout()");
   }
 }
}
export function L(...Arguments: Array<any>) { return new Layout(Arguments); }

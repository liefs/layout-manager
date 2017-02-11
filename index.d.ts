/**
 * This is a doc comment for a dynamic module.
 */
export declare class Handler {
    static handlers: Array<Handler>;
    static isActive: boolean;
    static callbackThrottleId: any;
    static resizeCallbackThrottle: number;
    static delayUntilStart: number;
    static showObj: {
        [index: string]: {
            show: boolean;
            el: Element;
        };
    };
    label: string;
    myArgsObj: any;
    setArgsObj: Function;
    position: Coord;
    el: any;
    isActive: boolean;
    layouts: Array<Layout>;
    activeContainer: Container;
    selector: () => string;
    constructor(...Arguments: any[]);
    static watchForResizeEvent(): void;
    static activate(): void;
    static createDivList(): void;
    static startHandler(): void;
    static resizeEvent(e?: Event): void;
    static Hide(): void;
    update(): void;
    chooseContainer(): void;
}
export declare function H(...Arguments: Array<any>): Handler;
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
export declare let liefsError: {
    matchLength: (expected: number, received: number, reference?: string) => never;
    typeMismatch: (expected: string, received: string, reference?: string) => never;
    badArgs: (expected: string, received: string, reference?: string) => never;
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
export declare function onEvent(el: any, eventType: string, eventFunction: Function): void;
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
export declare function nthIndex(str: string, pat: string, n: number): number;
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
export declare function occurrences(thisString: string, subString: string, allowOverlapping?: boolean): number;
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
export declare function trimCompare(a: string, b: string): boolean;
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
export declare function isStart(value: string): boolean;
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
export declare function px(value: number): string;
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
export declare function vpx(value: string): number;
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
export declare function TypeOf(value: any, match?: string): string | boolean;
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
export declare function setArgsObj(key: string, index?: number, ref?: string): any;
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
export declare function argsObj(args: IArguments): any;
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
export declare function CheckArgTypes(args: IArguments, types: string[], reference?: string, checkLength?: boolean): boolean;
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
export declare function el(id: string): Element;
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
export declare function isUniqueSelector(selector: string): boolean;
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
export declare function directive(querrySelectorAll: string, attributesList: Array<string>): Array<{}>;
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
export declare function directiveSetStyles(el: Element, stylesObject: {}): void;
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
export declare function isItIn(key: string, object: {}): any;
/**
* ##### **Objectassign - Fuction Description:**
* Objectassign - this function is redundant and will be removed in the next revision
*/
export declare function Objectassign(obj: any): {};
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
export declare function myIndexOf(sstring: string, search: string, occurance: number, start: number): string;
export declare class Coord {
    width: number;
    height: number;
    x: number;
    y: number;
    constructor(width?: number, height?: number, x?: number, y?: number);
    getSource(el: any, byRoot?: boolean): void;
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
export declare class Dragbar {
    /**
    * ##### **Dragbar.mouseDown - Static Method:**
    * internal use only - no reason to call/use - called when dragbar clicked
    */
    static mouseDown(e: any, dragbar: Dragbar): void;
    /**
    * ##### **Dragbar.mouseUp - Static Method:**
    * internal use only - no reason to call/use called when mouseUp
    */
    static mouseUp(e: Event): void;
    /**
    * ##### **Dragbar.mouseMove - Static Method:**
    * internal use only - no reason to call/use - called when mousemove
    */
    static mouseMove(e: any): void;
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
    static isDown: boolean;
    /**
    * ##### **Dragbar.noInit - Static Boolean:**
    * internal use only - no reason to call/use - needs "on first instance set up"
    * false to start, true after first instance of Dragbar
    */
    static noInit: boolean;
    /**
    * ##### **Dragbar.Selector - anonymous function:**
    * internal use only - no reason to call/use - Indicates the selector uses to find the Dragbar
    * in this version it is Item.selector() + " > ." + ("Hdragbar" or "Vdragbar")
    *
    * This could be changed by resetting this anonymous function
    */
    Selector: () => string;
    /**
    * ##### **Dragbar.el - pointer to dragbar element on page:**
    * internal use only - no reason to call/use
    */
    el: Element;
    /**
    * ##### **Dragbar.size - Class Coord Object containing dimensions needed to plot this Dragbar**
    * internal use only - no reason to call/use
    */
    size: Coord;
    /**
    * ##### **Dragbar.front - boolean showing if dragbar is at front of Item (true - default) or back of Item - false;**
    *
    * Note this parameter is set when defining and item, not here. See Item.I()
    *
    * internal use only - no reason to call/use
    */
    front: boolean;
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
    constructor(item: Item, front?: boolean, width?: any);
    /**
    * ##### **Dragbar.update**
    * internal use only - no reason to call/use
    * this function is called on resizeEvent to recalculate the Coord Class
    */
    update(): void;
}
export declare class Item {
    static get(label: string, instance?: number): Item;
    static h(...Arguments: any[]): Item;
    static v(...Arguments: any[]): Item;
    static I(...Arguments: any[]): Item;
    static nextPage(item_: Item | string, stop?: boolean): void;
    static backPage(item_: Item | string, stop?: boolean): void;
    static setPage(item_: Item | string, value: string | number): void;
    static parseValue(value_: string | number, item: Item): void;
    static parseItem(item_: Item | string): Item;
    static page(item: Item): Item;
    static debug: boolean;
    static items: {
        [index: string]: Array<Item>;
    };
    label: string;
    instance: number;
    start: string;
    current: string;
    lastDirection: boolean;
    size: Coord;
    min: string;
    max: string;
    container: Container;
    pages: Array<Item>;
    pageTitle: string;
    currentPage: number;
    el: Element;
    selector: () => string;
    dragBar: Dragbar;
    constructor(label: string, start: string, min?: string, max?: string, container?: Container);
}
export declare let I: typeof Item.I;
export declare let v: typeof Item.v;
export declare let h: typeof Item.h;
export declare let items: {
    [index: string]: Item[];
};
export declare class Container {
    static of(item: Item): Container;
    static get(label: string): Container;
    static push(container: Container): Container;
    static fixed(container: Container, width: number, height: number): number;
    static percent(container: Container, width: number, height: number, fixed: number): void;
    static fill(container: Container, xOffset?: number, yOffset?: number): void;
    static updateRecursive(width: number, height: number, container: Container, xOffset?: number, yOffset?: number, includeParents?: boolean): {
        [index: string]: Coord;
    };
    static debug: boolean;
    static containers: {
        [index: string]: Container;
    };
    static marginDefault: number;
    static suspectedRoot: Container;
    static lastDefined: Container;
    static root(): Container;
    label: string;
    margin: number;
    direction: boolean;
    items: Item[];
    lastUpdate: {
        [index: string]: Coord;
    };
    el: Element;
    selector: () => string;
    constructor(label: string, trueIsHor: boolean, items: Item[], margin?: number);
    itemsCheck(): void;
    update(width: number, height: number, xOffset?: number, yOffset?: number, includeParents?: boolean): void;
    itemByLabel(label: string): Item;
}
export declare class Layout {
    label: string;
    isActive: boolean;
    container: Container;
    conditionalFunction: Function;
    myArgsObj: any;
    setArgsObj: Function;
    constructor(...Arguments: any[]);
}
export declare function L(...Arguments: Array<any>): Layout;

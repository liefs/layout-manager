/**
* ##### **Handler - Class Description: STATIC/INSTANCE**
* Please take note that Handler (caps) Refers to the Static Object Class Handler
* (instance of Handler) refers to an Instance of Handler Class
*
* In essence, liefs-layout-manager.Handler manages the layouts, and handles resize event correctly.
*
* Once I() is called even once, (after a small while) A master Handler Instance will
* be created. (If you didn't make one)
*
* On resizeEvent, Handler loops though all (instance of Handler)s,
* For each (instance of Handler):
* * Loops through (Handler Instance).layouts (Array<Layout>)
* ...checking (Handler Instance).layouts[index].conditionalFunction to see if
* (Handler Instance).layouts[index].container should be the one used for (Handler Instance)
* ... which means it find the layout you wanted to use for this screen resize.
* * Then it calculates the (Item Instance).size (Coord) for each visible Item,
* * Then sets all visible items to visible, and Hidden to [Hidden AND (left, top, width and height set to 1px)]
* * Then waits for next resizeEvent.
*
* I know the excitement is overwhelming you... lets read on for more details
*/
export declare class Handler {
    static iterator(): Array<Handler>;
    iterator(): Array<Layout>;
    /**
    * ##### **Handler.handlers - Array<Handler> STATIC **
    * internal use - this is where Handler stores it list OF (instance of Handler)
    */
    static handlers: Array<Handler>;
    /**
    * ##### **Handler.isActive - boolean - set true if active STATIC **
    * Ha Ha, I haven't programed this in yet - you're stuck on.
    */
    static isActive: boolean;
    /**
    * ##### **Handler.callbackThrottleId - ref for Handler.resizeCallbackThrottle STATIC **
    * See Handler.resizeCallbackThrottle
    */
    static callbackThrottleId: any;
    /**
    * ##### **Handler.resizeCallbackThrottle - number - Default 0 STATIC **
    * This is the amount in milisecond before a resize event is triggered.
    * Sometimes, the refresh of a page is expensive, and in these cases,
    * Dragging a resize will NOT produce pleasant results.
    * By setting `Handler.resizeCallbackThrottle = 1000;` for example,
    * would allow a full second of static view - no matter how much the user is
    * resize crazy - before refreshing the page to reflect new resize dimensions.
    */
    static resizeCallbackThrottle: number;
    /**
    * ##### **Handler.delayUntilStart - number - Default 200 (miliseconds) STATIC **
    * Once the page loads, there are often "expensive loads" that are required
    * before the Handler should start.  For example, it is possible that your
    * javascript creates elements that liefs-layout-manager should find.
    *
    * To avoid this "I got here first" conflict, there is a delay before
    * liefs-layout-manager starts - this value - default 200 miliseconds.
    *
    * feel free to try 0 or something else to suit your needs. Maybe the waiting
    * is completely unnecessary for you.
    */
    static delayUntilStart: number;
    /**
    * ##### **Handler.showObj Object of Key label value {show: boolean; el: Element} STATIC **
    * This is where all the elements are flagged as hidden or visible.
    * Internal Use Only.
    */
    static showObj: {
        [index: string]: {
            show: boolean;
            el: Element;
        };
    };
    /**
    * ##### **Handler.verbose boolean STATIC **
    * Default = true
    * Set False for no console.log()
    */
    static verbose: boolean;
    /**
    * ##### **Handler.changeUrl boolean STATIC **
    * Default = true
    * Set False for no url push - page state.
    */
    static changeUrl: boolean;
    /**
    * ##### **(instance of Handler).label - string **
    * Label string for differenciating Handler instances
    */
    label: string;
    /**
    * ##### **(instance of Handler).myArgsObj **
    * See liefs-layout-manager.lib.argsObj and
    * See liefs-layout-manager.lib.setArgsObj
    */
    myArgsObj: any;
    /**
    * ##### **(instance of Handler).setArgsObj **
    * See liefs-layout-manager.lib.argsObj and
    * See liefs-layout-manager.lib.setArgsObj
    */
    setArgsObj: Function;
    /**
    * ##### **(instance of Handler).position **
    * This is the Coord Object for the (instance of Handler)
    */
    position: Coord;
    /**
    * ##### **(instance of Handler).el **
    * This is the parent element of the Handler.
    * More often than not, this is undefined, and outer screen size is used.
    */
    el: any;
    /**
    * ##### **(instance of Handler).isActive - boolean - set true if active **
    * Ha Ha, I haven't programed this in yet - you're stuck on.
    */
    isActive: boolean;
    /**
    * ##### **(instance of Handler).layouts - Array<Layout> **
    * This is the array of layouts that is looped though on resize event looking
    * for a matching conditionalFunction to be true.
    * internal use only
    */
    layouts: Array<Layout>;
    /**
    * ##### **(instance of Handler).activeContainer - Container Class Instance **
    * This is the last/active container that the (instance of Handler) deceiced to use.
    */
    activeLayout: Layout;
    activeContainer: Container;
    /**
    * ##### **(instance of Handler).selector - string **
    * This is explained in detail at (Item Instance).selector
    */
    selector: () => string;
    toString(prefix?: string, lf?: string, pre?: string): string;
    /**
    * ##### **Handler  - constructor **
    * This Class:
    *```javascript
    var something = new Handler(); // do not do this! - Done by H()
    var something = H();           // Ok much better -
    // both above lines return a (instance of Handler);
    *```
    * See Handler.H()
    */
    constructor(...Arguments: any[]);
    /**
    * ##### **Handler.watchForResizeEvent()  - function STATIC **
    * When called (by liefs-layout-manager - no need for you to do so....)
    * it sets `window.onresize` Event
    *
    * at this point, the only way to turn it off, that will actualy WORK, is:
    *```javascript
    * window.onresize = () => {}; // this will stop liefs-layout-manager in its tracks
    *```
    */
    static watchForResizeEvent(): void;
    /**
    * ##### **Handler.activate()  - function STATIC **
    * basically using ANY of liefs-layout-manager functions triggers this function
    *
    * When called (by liefs-layout-manager - no need for you to do so....)
    * Handler knows - OK you used a function of mine, so start up soon,
    * and since I know I'm starting, ignore further calls here.
    *
    */
    static activate(): void;
    /**
    * ##### **Handler.createDivList()  - function STATIC **
    * This function is called after all Defining is done.
    * it loops though all Items, Containers, and Handlers, looking for matching
    * elements, which it adds to the hide/show list
    * Internal use only - no need to ever call it
    */
    static createDivList(): void;
    /**
    * ##### **Handler.startHandler()  - function STATIC **
    * after Handler.delayUntilStart (See its description)
    * First it sees if you are lacking multiple Layouts, and a handler:
    *```javascript
    * h("SomeGroupName", "100%",
    *   I("LeftSideid", "50%"), I("LeftSideid", "50%")
    * );
    *```
    * Since there is no Layout and Handler, one will be automatic appointed using the following
    *```javascript
    * H("defaultHandler",  // this line is created behind the scenes because you left it out
    *   L("defaultLayout",  // this line is created behind the scenes because you left it out
    *     h("SomeGroupName", "100%",
    *       I("LeftSideid", "50%"), I("LeftSideid", "50%")
    *     ),
          (x, y) => { return true; }  // this line is created behind the scenes because you left it out
        ) // this line is created behind the scenes because you left it out
    * );
    *```
    * this is the start up script.  It calls:
    *```javascript
    * Handler.createDivList();
    * Handler.watchForResizeEvent();
    * Handler.resizeEvent();
    *```
    */
    static startHandler(): void;
    static callback: () => void;
    static title: () => string;
    static readUrl(): void;
    static urlParams: any;
    static onPushState(): void;
    /**
    * ##### **Handler.resizeEvent()  - function STATIC **
    * This has a slightly misleading name. It should really be called
    * "refresh" - because it does that - refreshes all output from current input
    *
    * True, this is called on an actual resize event, but it is also called
    * when you drag a dragbar, or trigger anything else that requires a
    * page refresh.
    *
    * Shoud you need to force a page refresh:
    *```javascript
    * Handler.resizeEvent();  // this will trigger a page refresh
    * // so if you make a button to change layouts, and bypass internal methods
    * // to acheive this, you will have to call this after to refresh the page.
    *```
    */
    static hideEl(itemEl: any): void;
    static HideAllDragbars(container: Container): void;
    static resizeEvent(e?: Event): void;
    /**
    * ##### **Handler.Hide()  - function STATIC **
    * This is part of the refresh script. this small piece simple hides the elements that need to be hidden
    */
    static Hide(): void;
    /**
    * ##### **(instance of Handler).update()  - function **
    * This is part of the refresh script.
    * It calles the active Contianer.update (See that)
    * and applies the results to set all element style properties to make the page render correctly.
    *
    * This is an internal function - no reason to call
    */
    update(): void;
    /**
    * ##### **(instance of Handler).chooseContainer()  - function **
    * This is part of the refresh script.
    * It loops through the layout options, and sets (instance of Handler).activeContainer to correct value.
    *
    * This is an internal function - no reason to call
    */
    chooseContainer(): void;
}
/**
* ##### **H() Funtion to create a new Handler Instance **
* This creates a Handler Instance.
* @param (TypeOf 'string') - when an Argument is of TypeOf 'string' it is assigned to be the label of this (instance of Handler)
* @param (TypeOf Class Layout) - when an Argument is of TypeOf Layout, it appends it to the list of layouts
* for this Handler.  There is not limit to the number of layouts supplies as arguments.
*/
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
export declare function htmlToElement(html: any): Node;
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
export declare function swapEl(source: any, replacement: any): void;
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
export declare function replaceAll(sstring: string, omit: string, place: string, prevstring?: string): string;
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
export declare function screenSize(): {
    x: number;
    y: number;
};
export declare let CFL: any[];
export declare function mymouseleave(): void;
export declare function context(el: HTMLElement, selectionList: Array<[string, Function]>, stylestring?: string): void;
/**
* ##### **Coord - Class Description:**
* Coord is a Object Class that simply hold the dimenions of an Item/Container/Handler
* (x, y, width , height)
*
* These Objects are created by liefs-layout-manager interally. There is no reason to
* manually create a Coord Instance.1
*/
export declare class Coord {
    /**
    * ##### **(instace of Coord).width - number **
    * internal use - width of Item/Container/Handler
    */
    width: number;
    /**
    * ##### **(instace of Coord).height - number **
    * internal use - height of Item/Container/Handler
    */
    height: number;
    /**
    * ##### **(instace of Coord).x - number **
    * internal use - start position relative to the parent Element (or screen)
    */
    x: number;
    /**
    * ##### **(instace of Coord).y - number **
    * internal use - start position relative to the parent Element (or screen)
    */
    y: number;
    constructor(width?: number, height?: number, x?: number, y?: number);
    /**
    * ##### **(instace of Coord).getSource - function **
    * internal use
    * Called to get the Coord of an Element BEFORE liefs-layout-manager does anything to it.
    */
    getSource(el: any, byRoot?: boolean): void;
}
/**
* ##### **Dragbar - Class Description:**
*
* Dragbar is a Class that stores all properties relating to Dragbars.
* For each Dragbar, there is an instance of this class created under
* (instance of [Item](./_liefs_layout_manager_.item.html)).Dragbar
* It is "automatically" created - There is no need to create an instance of this ever.
*
* All visible properties of Dragbars are controlled with css .Hdragbar and .Vdragbar
*
* This class can be reached
*
* by [Items.get](_liefs_layout_manager_.item.html#get)("ItemName").Dragbar
*/
export declare class Dragbar {
    static drabarByIdObj: any;
    /**
     * ##### **Dragbar.mouseDown - Static Method:**
     *
     * internal use only - no reason to call/use - called when dragbar clicked
     */
    static mouseDown(e: any): void;
    /**
     * ##### **Dragbar.mouseUp - Static Method:**
     *
     * internal use only - no reason to call/use called when mouseUp
     */
    static mouseUp(e: Event): void;
    /**
     * ##### **Dragbar.mouseMove - Static Method:**
     *
     * internal use only - no reason to call/use - called when mousemove
     */
    static mouseMove(e: any): void;
    static dragbars: Array<Dragbar>;
    /**
     * ##### **Dragbar.beforeCurrent - Static String:**
     *
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
     *
     * internal use only - no reason to call/use - will be dropped next version
     */
    static direction: boolean;
    /**
     * ##### **Dragbar.dragstart - Static Number:**
     *
     * internal use only - no reason to call/use
     */
    static dragstart: number;
    /**
     * ##### **Dragbar.isDown - Static Boolean:**
     *
     * internal use only - no reason to call/use - Indicates that the mouse has been clicked on
     * a dragbar, and is waiting to come up
     */
    static isDown: boolean;
    /**
     * ##### **Dragbar.noInit - Static Boolean:**
     *
     * internal use only - no reason to call/use - needs "on first instance set up"
     * false to start, true after first instance of Dragbar
     */
    static noInit: boolean;
    /**
     * ##### **(Dragbar Instance).Selector - anonymous function:**
     *
     * internal use only - no reason to call/use - Indicates the selector uses to find the Dragbar
     * in this version it is [Item.selector](./_liefs_layout_manager_.item.html#selector)() + " > ." + ("Hdragbar" or "Vdragbar")
     *
     * This could be changed by resetting this anonymous function
     */
    Selector: () => string;
    /**
     * ##### **(Dragbar Instance).el - pointer to dragbar element on page:**
     *
     * internal use only - no reason to call/use
     */
    el: Element;
    /**
     * ##### **(Dragbar Instance).size - [Coord](./_liefs_layout_manager_.coord.html)
     * Object containing dimensions needed to plot this Dragbar**
     *
     * internal use only - no reason to call/use
     */
    size: Coord;
    /**
     * ##### **(Dragbar Instance).front - boolean showing if dragbar is at front of Item
     * `(Instance of Dragbar).front = true;` (true - default) or back of Item:
     * `(Instance of Dragbar).front = false;` (used when Item is "last" in Array)
     *
     * Note this parameter is set when defining and item, not here. See [Item](./_liefs_layout_manager_.item.html)
     *
     * internal use only - no reason to call/use
     */
    front: boolean;
    /**
     * ##### **(Dragbar Instance).parent - Parent Class Item that controls this Dragbar**
     *
     * internal use only - no reason to call/use
     */
    parent: Item;
    /**
     * ##### **(Dragbar Instance).width**
     *
     * This horribly named parameter is the width of the dragbar;
     * Note: a dragbar has to be visible to work, so making this value larger than margin
     * will make the dragbar visible.  similarily, if the width is too small, it will be
     * difficult for the mouse to click the dragbar
     * Optional resetting this value to suit:
     * ```javascript
     * Item.get("ItemLabel").Dragbar.width = 5; // or any new value
     * ```
     */
    width: number;
    /**
     * ##### **Dragbar.constructor()**
     *
     * internal use only - no reason to call/use
     * this class is created by Item automatically - no reason to create an instance manually.
     */
    constructor(item: Item, front?: boolean, width?: any);
    /**
     * ##### **(Dragbar Instance).update**
     *
     * internal use only - no reason to call/use
     * this function is called on resizeEvent to recalculate the Coord Class
     */
    update(): void;
}
/**
 * ##### **Item - Class Description:**
 *
 * Item is the very complicated KEY to making Lief’s-layout-manager work.
 * Read ['liefs-layout-manager CONCEPT PAGE'](https://liefs.github.io/) - before reding this page.
 * An Item is (a wrapper on ) an element, OR a "group" of elements TREATED as an element.
 * It is the basic building block of this project.
 *
 * Defining an item.
 * ```javascript
 * > new Item("SomeItemName", "100px");
 * // DO NOT USE THIS WAY - ONLY WORKS FOR SIMPLE EXAMPLES - I() uses Typeof identification, this does not.
 * > I("SomeItemName", "100px");
 * // I() uses Typeof Argument (both calls return Class Item Object) - This is how one makes a new Item.
 * ```
 * The above line indicates the following:
 *
 * 1. The First 'string' argument that doesn't end in 'px' or '%' is (Item Instance).label, in this case, "SomeItemName".
 * it calls Item.selector("SomeItemName") to get the "css selector string for the Item"
 * the default uses the "id" therefore, the default is:
 * ```javascript
 * Item.selector = () => { return "#" + this.label; }  // where label in this case is "SomeItemName"
 * ```
 * (see [Item.selector](./_liefs_layout_manager_.item.html#selector))
 * so.... default is element id.... which I will pretend is static for the rest of this documentation.
 * and returns the `document.querySelector( Item.selector("SomeItemName") );`
 * ... which means there has to be EXACTLY ONE element with id="SomeItemName"
 * If it does not have exactly one match, liefs-layout-manager throws a detailed error.
 *
 * 2. The First 'string' argument that ends in 'px' or '%'
 * (refered to as [Typeof](https://liefs.github.io/modules/_liefs_layout_manager_.html#typeof) 'start' [element size pixel value] - treated as different type than [Typeof](https://liefs.github.io/modules/_liefs_layout_manager_.html#typeof) 'string' [used for label and dirction indicator])
 * is assigned to (Item Instance).start
 * '100px' indicates that this item will be 100 pixels `(parent.container.direction is horizontal) ? wide : high`
 * '50%' indicates that the parent.container, after subtracting all the 'px' values, will use '50%'
 * of the remaining pixels to the `(parent.container.direction is horizontal) ? width : height` of this element (or element group)
 * ```javascript
 * > new Item("100px", "50px", "SomeItemName"); // note: the 'order of argument is sorted by Typeof'
 * // above arguments have TypeOf 'start' ["100px", "50px"] and Typeof 'string' ["SomeItemName"] - understanding this will help later
 * ```
 * 3. The Second 'string' argument that ends in 'px' or '%' is assigned to (Item Instance).min
 * by this value existing, it indicates that this (possibly grouped) element starts with 'start' value, but can
 * be "stretched" smaller to this new min value - by the automatic creation of an Item.Dragbar.
 * (div element child of Item element) See liefs-layout-manager.Dragbar
 * ```javascript
 * > new Item("100px", "50px", "SomeItemName", "200px"); // note: the 'order of argument is sorted by [Typeof](https://liefs.github.io/modules/_liefs_layout_manager_.html#typeof)'
 * ```
 * 4. The Third 'string' argument that ends in 'px' or '%' is assigned to (Item Instance).max
 * this obviously assigns a maximum value to Item.start - controlled by Item.Dragbar
 *
 * 5. Items Can be "extended" in the following way:
 * 5. A) By adding and Item within an Item - WITHOUT DIRECTIONAL INDICATOR (see below) indicates
 * that any Items as arguments of an Item, are refered to as PAGES. See liefs-layout-manager.PAGES
 * (Note this is different for WITH DIRECTIONAL INDICATOR see below)
 *
 * ```javascript
 * I("FirstPage" "100%", I("SecondPage"), I("ThirdPage"));  // this defines "FirstPage" as the first of pages under group name "FirstPage"
 * ```
 * The above indicates that initially, element with id="FirstPage" will be visible and the rest hidden
 * ```javascript
 * onclick='Item.setPage("FirstPage", "ThirdPage");'
 * // this sets page directly
 * onclick='Item.nextPage("FirstPage");'
 * // loop through pages, back to beginning if at end
 * onclick='Item.nextPage("FirstPage", true);'
 * // loop through pages, STOP at end - no more.
 * onclick='Item.backPage("FirstPage");'
 * // cycle reverse, to end if back first Page
 * onclick='Item.backPage("FirstPage", true);'
 * // cycle reverse, There is "nothing" before first page
 * ```
 *
 * 5. B)
 * An Item DIRECTIONAL INDICATOR tells liefs-layout-manager that this item is to be the parent (grouping)
 * of a container.  This means that (Item Instance).container will point to a liefs-layout-manager.Container
 * That inner container will be assigned the DIRECTIONAL INDICATOR.
 *
 * ```javascript
 * var other = I("ChildOfSomeItemName","100%");
 * // this will be the only child in the parent (Item instance).container
 *
 * > I("SomeItemName", "200px", "hor", other);
 * // putting "hor" as an argument is a horizontal DIRECTIONAL INDICATOR
 * > I("-SomeItemName", other, "200px");
 * // putting "-" as a pre/post fix to the label name, is a horizontal DIRECTIONAL INDICATOR
 * > I(other, "SomeItemName-", "200px");
 * > h("SomeItemName-", "200px", other);
 * // new function name, but all four here return (new Item() Class) same horizontal DIRECTIONAL INDICATOR
 * // personally, I like h() and v() as indicators, but I made it a personal choice.
 *
 * > I(other, "SomeItemName", "200px", "ver");
 * // putting "ver" as an argument is a vertical DIRECTIONAL INDICATOR
 * > I("|SomeItemName", other, "200px");
 * // putting "|" as a pre/post fix to the label name, is a vertical DIRECTIONAL INDICATOR
 * > I("SomeItemName|", "200px", other);
 * > v("SomeItemName", other, "200px");
 * // new function name, but all four here return (new Item() Class) same vertical DIRECTIONAL INDICATOR
 * /// fyi h() and v() really is the same function! it just adds the "ver" way for you
 * function v(...Arguments: any[]) { Arguments.push("ver"); return I(...Arguments);}
 * ```
 * I am over-stressing the point the the argument ORDER is by [Typeof](https://liefs.github.io/modules/_liefs_layout_manager_.html#typeof).  The means that 'start' 'min' 'max'
 * must be in the correct order, because they are the same [Typeof](https://liefs.github.io/modules/_liefs_layout_manager_.html#typeof).
 * Similarily, Items as arguments maintains the order they are listed.
 * having Items preceed, or follow 'start' 'min' 'max' - does not matter.
 *
 * with a DIRECTIONAL INDICATOR set, all Items in arguments WILL NOT be pages, but will instead be a row/column
 * of items, defined within that container.  The sum of all "start" %'s MUST total 100%, or an error is thrown.
 * values for 'px' are basically unchecked.
 *
 * ```javascript
 * h("MainContainer", I("left", "30%"), I("tinymid", "100px"), I("right", "70%"), 10);
 * ```
 * the above line indicates the following:
 *
 * the h() function in front of MainContainer makes this Item Instance a horizontal container (not a page set)
 * (see list if indicators above)
 *
 * if there exists a single element id="MainContainer", use its page location as root, (for witdth, height)
 * otherwize use overall page size as root (width, height)
 *
 * there are exactly 3 elements is the document (usually divs) - with id="left", "tinymid", "right" respectivly
 *
 * after the width of parent is calculated, all the 'px' values are assigned... in this case 100px
 *
 * the remaining pixels are assigned 30% of them to id="left" element, and 70% to id="right" element.
 *
 * This one line alone is a "complete startup program" for liefs-layout-manager (See Handler for more details)
 *
 * the space between the Items is set to a margin of 10 pixels.
 */
export declare class Item {
    static iterator(): Array<Item>;
    static PageTriggerSize: number;
    static activePage: Item;
    static isDown: boolean;
    static dragstart: number;
    static mouseDown(e: any, item: Item): void;
    /**
     * ##### **Item.get - Static Method:**
     *
     * It may be required for an Item to be part of two different layouts.
     *
     * If this is the case, you may choose to have the start, min, max values
     * consistent on both layout.... so pointing to the same Item.
     *
     * If you should choose different start, min, max values for the same Item
     * on a different layout, you would make a "second instance" of this Item.
     *
     * The part that can be confusing is how do you get the correct instance?
     *
     * If you have multiple instances of the same item, it might be wise to work
     * with your own varible names.
     * ```javascript
     * var SmallLayoutItem = I("PageIWantOnBothLayouts", "100px", "50px", "200px")  // this has different start, min, max than next
     * var LargeLayoutItem = I("PageIWantOnBothLayouts", "200px", "100px", "400px") // this has different start, min, max than next
     * ```
     * you can use Item.get():
     * ```javascript
     * Item.get("PageIWantOnBothLayouts")     // this defaults to the first instance created. for most cases this works great
     * Item.get("PageIWantOnBothLayouts", index)  // this requests the 'index'th inscance - but can be difficult to track.
     * @param label - string label (usually id) of the Item
     * @param InstanceNo - Optional, if you know it, goes by it.
     * @return (Instance Of) Item Object Class
     * ```
     */
    static get(label: string, InstanceNo?: number): Item;
    /**
     * ##### **Item.h - Static Method:**
     *
     * ... is really Item.I() - see Item Class explanation.
     */
    static h(...Arguments: any[]): Item;
    /**
     * ##### **Item.v - Static Method:**
     *
     * ... is really Item.I() - see Item Class explanation
     */
    static v(...Arguments: any[]): Item;
    static keys(): string[];
    /**
     * ##### **Item.I - Static Method:**
     *
     * see Item Class explanation
     */
    static I(...Arguments: any[]): Item;
    static setDragBarDirection(item: Item, direction: boolean): void;
    /**
     * ##### **Item.nextPage() - Static Method:**
     *
     * see Item Class explanation
     * @param item_ - ((instance of) Item Class) OR (string id name of - choosing first instance)- Root of Pages
     * @param stop - if true, endless loop of pages, if false, stops after first iteration.
     */
    static nextPage(item_: Item | string, stop?: boolean, changeUrl?: boolean): void;
    /**
     * ##### **Item.backPage() - Static Method:**
     *
     * see Item Class explanation
     * @param item_ - ((instance of) Item Class) OR (string id name of - choosing first instance)- Root of Pages
     * @param stop - if true, endless loop of pages, if false, stops after first iteration.
     */
    static backPage(item_: Item | string, stop?: boolean, changeUrl?: boolean): void;
    /**
     * ##### **Item.setPage() - Static Method:**
     *
     *  see Item Class explanation
     * @param item_ - ((instance of) Item Class) OR (string id name of - choosing first instance)- Root of Pages
     * @param value - string id name of Child Page of above item_
     */
    static setPage(item_: Item | string, value: string | number, changeUrl?: boolean): void;
    /**
     * ##### **Item.setPageparseValue() - Static Method:**
     *
     * internal use only
     * is a sub-function of Item.setPage()
     */
    static parseValue(value_: string | number, item: Item): void;
    /**
     * ##### **Item.parseItem() - Static Method:**
     *
     * @param item_ - ((instance of) Item Class) OR (string id name of - choosing first instance)- Root of Pages
     * @return (intance of) Item Class
     */
    static parseItem(item_: Item | string): Item;
    /**
     * ##### **Item.page() - Static Method:**
     *
     * @param item - ((instance of) Item Class)
     * @return (intance of) Item Class - If this item is not root of pages, returns arugment item, otherwize returns current page Item.
     */
    static page(item: Item): Item;
    static debug: boolean;
    /**
     * ##### **Item.items - Object of string keys, and Array<Item> values:**
     *
     * This is where all the items are 'stored'
     * note: it is an object (key-id) (value list of Items) NOT (value Item)
     * ```javascript
     * Item.items["SomeItemName"][0]; // points to the first "SomeItemName" Item Created
     * ```
     * probably better to use Item.get()
     */
    static items: {
        [index: string]: Array<Item>;
    };
    swipe: boolean;
    /**
     * ##### **(instance of Item).label - String:**
     * this is the id of the element related to this Item.
     */
    label: string;
    /**
     * ##### **(instance of Item).instance - Number:**
     *
     * this location will be dropped (and stored elsewhere) next version
     */
    instance: number;
    /**
     * ##### **(instance of Item).start - String:**
     *
     * this is either var Item.start =  (Intiger pixelsize).toString() + "px"
     * this is either var Item.start =  (Intiger percent).toString() + "%"
     * this format structure is refered to as '[Typeof](https://liefs.github.io/modules/_liefs_layout_manager_.html#typeof) start'
     *
     * Defines initial state
     */
    start: string;
    /**
     * ##### **(instance of Item).current - String:**
     *
     * this is either var Item.start =  (Intiger pixelsize).toString() + "px";
     * this is either var Item.start =  (Intiger percent).toString() + "%";
     * this format structure is refered to as '[Typeof](https://liefs.github.io/modules/_liefs_layout_manager_.html#typeof) start'
     *
     * Defines current state
     */
    current: string;
    /**
     * ##### **(instance of Item).lastDirection - Boolean:**
     *
     * This is ignored, and will be removed
     */
    lastDirection: boolean;
    /**
     * ##### **(instance of Item).size - Class Coord Object:**
     *
     * This is where the current (x, y, width, height) of the Item is stored
     */
    size: Coord;
    /**
     * ##### **(instance of Item).min - String:**
     *
     * this is either var Item.start =  (Intiger pixelsize).toString() + "px";
     * this is either var Item.start =  (Intiger percent).toString() + "%";
     * this format structure is refered to as '[Typeof](https://liefs.github.io/modules/_liefs_layout_manager_.html#typeof) start'
     *
     * Defines minimum value of 'start' / 'current' state
     */
    min: string;
    /**
     * ##### **(instance of Item).max - String:**
     *
     * this is either var Item.start =  (Intiger pixelsize).toString() + "px";
     * this is either var Item.start =  (Intiger percent).toString() + "%";
     * this format structure is refered to as '[Typeof](https://liefs.github.io/modules/_liefs_layout_manager_.html#typeof) start'
     *
     * Defines maximum value of 'start' / 'current' state
     */
    max: string;
    /**
     * ##### **(instance of Item).container - Class Container Object:**
     *
     * Items can be optionally extended to be a container of other Items.
     * If this option is used (See Item) This container holds this information.
     *
     * Only defined if extended
     */
    container: Container;
    /**
     * ##### **(instance of Item).pages - Array<Item> :**
     *
     * Items can be optionally extended to be root of Pages (Other Items).
     * If this option is used (See Item) This is where the array of pages is stored
     *
     * Only defined if extended
     */
    pages: Array<Item>;
    /**
     * ##### **(instance of Item).pageTitle - String :**
     *
     * This is not being used - reminder to self
     */
    pageTitle: string;
    /**
     * ##### **(instance of Item).currentPage - Number :**
     *
     * Items can be optionally extended to be root of Pages (Other Items).
     * If this option is used (See Item) This is where the current page array index is stored
     *
     * Only defined if extended
     */
    currentPage: number;
    /**
     * ##### **(instance of Item).el - HTMLElement :**
     *
     * This points to the (possible) html element accociated with this Item.
     *
     * Note: Items can be defined to be a group of items.  In such a case, this value
     * is usually (but not always) not pointing to anything at all.
     */
    el: Element;
    /**
     * ##### **(instance of Item).selector - Anonymous Function No Arguments :**
     *
     * liefs-layout-manager defaults to Item name = id of element.
     *
     * There is no reason to hold this to be true.  All calls to find elements from
     * the dom go through Item.selector... the default being:
     * ```javascript
     * selector = () => { return "#" + this.label; }; // so "Something" calls Document.querySelect("#" + "Something")
     * // which of course finds id - but this can be changed.
     * ```
     * Note: should you do this change, Since this method accesses "this" -> you must change in on EVERY INSTANCE
     * so something like
     * ```javascript
     * Item.prototype.selector = () => { return "[" + this.label + "]"; };
     * I("Something", "250px");  // ok now looking for <tagName id="unused" Something>
     * // note we have changed global scope of Item selector (from then on....)
     * // note in this case, 'Item' referers to the Item Static Class
     *
     * Item.prototype.selector = () => { return "[liefs=" + this.label + "]"; };
     * I("Something", "250px");  // ok now looking for <tagName id="unused" liefs="Something">
     * // note we have changed global scope of Item selector (from then on....)
     * // note in this case, 'Item' referers to the Item Static Class
     *
     * function i(item) { item.selector = () => { return "[" + this.label + "]"; }; return item; }
     * i(I("Something", "200px"));  // This should do the trick for "outliers"
     * // note we have not touched global scope of Item selector (at all..)
     * // note in this last case, 'item' referers to an instance
     *
     * Item.defineProperty(Subclass.prototype, "byClass", {
     *     get: function byClass() {
     *       this.selector = () => { return "[class=" + this.label + "]"; };
     *       return this;
     *     }
     * });
     * Item.defineProperty(Subclass.prototype, "byTagName", {
     *     get: function byTagName() {
     *       this.selector = () => { return this.label; };
     *       return this;
     *     }
     * });
     * I("Something", "200px"); // byId is default // could keep defaut
     * I("Something", "200px").byClass;            // and add all the types
     * I("Something", "200px").byTagName;          // you desire
     *
     * to implement liefs-layout-manager at all - just understand how to use selectors to find it.
     * ```
     */
    selector: () => string;
    /**
     * ##### **(instance of Item).dragBar - Class Dragbar Object :**
     *
     * If an Item has a 'min' value set, a dragBar instance is automatically
     * created and stored here.
     */
    dragBar: Dragbar;
    toString(prefix?: string, lf?: string, pre?: string): string;
    iterator(): Array<Item>;
    /**
     * ##### **new Item() - Class constructor for Item Object :**
     *
     * There is no reason on the planet to make a `new Item()`
     * intead of:
     * ```javascript
     * var something = new Item();  // dont' do this! even the Author doesn't!
     * var something = I()          // Ah - this does things correctly
     * // both above return a new Item Object.
     * ```
     */
    constructor(label: string, start: string, min?: string, max?: string, container?: Container);
}
/**
 * ### Please Start [here](https://liefs.github.io/classes/_liefs_layout_manager_.item.html)
 *
 * then read on after you have read above - or it wont make any sense.
 *
 * ##### ** var I = Item.I:**
 * See [liefs-layout-manager.Item.I()](https://liefs.github.io/classes/_liefs_layout_manager_.item.html)
 */
export declare let I: typeof Item.I;
/**
 * ##### ** var v = Item.I:**
 *
 * See [liefs-layout-manager.Item.I() ](https://liefs.github.io/classes/_liefs_layout_manager_.item.html)
 */
export declare let v: typeof Item.v;
/**
 * ##### ** var h = Item.I:**
 *
 * See [liefs-layout-manager.Item.I() ](https://liefs.github.io/classes/_liefs_layout_manager_.item.html)
 */
export declare let h: typeof Item.h;
/**
 * ##### ** var h = Item.I:**
 *
 * See [liefs-layout-manager.Item.items ](https://liefs.github.io/classes/_liefs_layout_manager_.item.html#items)
 */
export declare let items: {
    [index: string]: Item[];
};
/**
* ##### **Container - Class Description:**
*
* a (instance of Container) is simply a column OR (Never And) a row of Items.
*
* A Container is an essential part of how liefs-layout-manager works.  That being said,
* it is mostly invisible - which can be confusing.
*```javascript
* var l=I("LeftSide","200px"); // This defines an (instance of Item) - No Containers
*```
* The above only defines a Item.
*```javascript
* var B=h("Both", I("LeftSide","200px"), I("RightSide","100%")); // This line creates 3 Items, and 1 Container.
*```
* The above does the following:
* * Defines (instace of Item) "LeftSide"
* * Defines (instace of Item) "RightSide"
* * Defines (instace of Container) "Both" - with array of [LeftSide, RightSide] - horizontal direction indicator
* * Defines (instance of Item) "Both" - with (instance of Item).container = (the above line)
*
* Understanding the above, there is no need to access the Container Directly.
* with the intension of making liefs-layout-manager easier to use, you ALWAYS refer to the Item.
* ...so even when we want data from a Container, we use the Item, and liefs-layout-manager finds the
* matching container in the background.
*
* It is helpful, if not key, Understanding this.
*/
export declare class Container {
    static iterator(): Container[];
    iterator(): Item[];
    /**
    * ##### **Container.of() - function: Static**
    * @param item (instance of Item) - Child Item Looking for parent
    *```javascript
    * (instance of Item).container;       // this returns the container child of the (instance of Item)
    * // ... so returns CHILD Of ITEM (Container)
    * Container.of( (instance of Item) );
    * // The above line returns the container that contains this exact (insance of Item)
    * // as one of its children
    * // ... so returns PARENT Of ITEM (Container)
    *```
    * @return (instance of Container)
    */
    static of(item: Item): Container;
    /**
    * ##### **Container.get() - function: Static**
    * @param label - label of (instance of Item)
    *```javascript
    * Container.get("SomeItemLabel");  // returns (instance of Container)
    *```
    * @return (instance of Container)
    */
    static get(label: string): Container;
    /**
    * ##### **Container.push() - function: Static**
    * @param container - (instance of Container)
    * @return (instance of Container)
    * No reason to use this - internal use -
    * ...as the Containers are defines, push them on to the "Array<defined>"
    * `Container.containers`
    */
    static push(container: Container): Container;
    /**
    * ##### **Container.fixed() - function: Static**
    * @param container - (instance of Container)
    * @param width - number - new width used in calculations
    * @param height - number - new height used in calculations
    * @return number - sum of fixed pixels
    *
    * The 'Magic' that calculates all the Coord Classes is here in Contianer Class.
    * This is step 1 of 3
    * this step adds all the 'px' values in the row/column of the container, and returns them.
    * They will be subtracted from available pixels for %
    *
    * This is an internal function - no need to call/use
    */
    static fixed(container: Container, width: number, height: number): number;
    /**
    * ##### **Container.percent() - function: Static**
    * @param container - (instance of Container)
    * @param width - number - new width used in calculations
    * @param height - number - new height used in calculations
    * @param fixed - number - fixed value calculated in Contaner.fixed()
    *
    * The 'Magic' that calculates all the Coord Classes is here in Contianer Class.
    * This is step 2 of 3
    * this step divides the remaining pixels (after minusing all the constant px values)
    * and splits them according to the % values defined in each (instance of Item) in the (Container.items Array)
    *
    * This is an internal function - no need to call/use
    */
    static percent(container: Container, width: number, height: number, fixed: number): void;
    /**
    * ##### **Container.fill() - function: Static**
    * @param container - (instance of Container)
    * @param xOffset - number - Offset of container, relative to parents
    * @param yOffset - number - Offset of container, relative to parents
    *
    * The 'Magic' that calculates all the Coord Classes is here in Contianer Class.
    * This is step 3 of 3
    * this applys the results of Container.fixed, and Container.percent
    * and fills the Item.size (Coord Object) with the results calculated
    *
    * This is an internal function - no need to call/use
    */
    static fill(container: Container, xOffset?: number, yOffset?: number): void;
    /**
    * ##### **Container.updateRecursive() - function: Static**
    * This is an internal function - no need to call/use
    *
    */
    static updateRecursive(width: number, height: number, container: Container, xOffset?: number, yOffset?: number, includeParents?: boolean): {
        [index: string]: Coord;
    };
    /**
    * ##### **Container.debug STATIC **
    * This has not been implemented yet
    */
    static debug: boolean;
    /**
    * ##### **Container.containers Object of key label value Container STATIC **
    * This is where the complete list of Containers is stored.
    * Internal use - although I CAN think of reasons to access
    */
    static containers: {
        [index: string]: Container;
    };
    /**
    * ##### **Container.marginDefault number STATIC **
    * All Items are separated by (instance of Container).margin pixels.
    * If margin Value is not indicated at time of creation, this default is assumed.
    *```javascript
    * Container.marginDefault = 10; // This changed the margin Default to 10 pixels
    *```
    */
    static marginDefault: number;
    /**
    * ##### **Container.suspectedRoot (instance of Container) Class STATIC **
    * If Handler and Layout left for liefs-layout-manager to figure out.....
    * this is its 'best guess' for what you inteded the root to be.
    * ... usually correct - if not, add Handler and Layout to your code.
    *
    * internal use
    */
    static suspectedRoot: Container;
    /**
    * ##### **Container.lastDefined (instance of Container) Class STATIC **
    * If Handler and Layout left for liefs-layout-manager to figure out.....
    * this helps is its 'best guess' for what you inteded the root to be.
    * ... by thinking f(f(f(something))) // last called f() should be root
    */
    static lastDefined: Container;
    /**
    * ##### **Container.root (instance of Container) Class STATIC **
    * Seeing the whole function is the best explanation:
    *```javascript
    * static root() { return (Container.suspectedRoot) ? Container.suspectedRoot : Container.lastDefined;}
    *```
    */
    static root(): Container;
    /**
    * ##### **(instance of Container).label string **
    * Simply the (optional) label of the (instance of Container)
    */
    label: string;
    /**
    * ##### **(instance of Container).margin string **
    * This is the space in pixels between the Items it contains.
    *
    * If not specified, it duplicates `Container.marginDefault;`
    * It can be specified as follows:
    *```javascript
    * var o=h("SomeGroupName", "100%", 10,   // h(), v(), and I() all define items and Containers.  The first
    *         I("LeftSideid", "50%"),        // TypeOf 'number' that it finds as an argument, it uses as margin
    *         I("RightSideid", "50%")         // for (instance of Container "SomeGroupName") in this case '10'
    *       );
    *```
    * or, it can be modifed afterward: The next four lines all do the exact same thing.
    *```javascript
    * o.container.margin = 4;                                  // by using variable assignment...
    * Item.get("SomeGroupName").container.margin = 4;          // by label of parent ITEM
    * Container.of( Item.get("LeftSideid") ).margin = 4;       // by label of child ITEM
    * Container.get("SomeGroupName").margin = 4;               // by label of parent CONTAINER
    *```
    */
    margin: number;
    /**
    * ##### **(instance of Container).direction boolean **
    * "the truth is horrible" is how i rememer:
    *```javascript
    * (instance of Container).direction = true; // indicates horizontal (horrible)
    * (instance of Container).direction = fase; // indicates vertical (not horrible)
    * See DIRECTIONAL INDICATOR
    *```
    */
    direction: boolean;
    /**
    * ##### **(instance of Container).items Array<Item> **
    * this is the Array<Items> that make up a row/column container
    * internal use only.  Can be accesses with:
    */
    items: Item[];
    /**
    * ##### **(instance of Container).lastUpdate Depreciated **
    * this will be removed next revision
    */
    lastUpdate: {
        [index: string]: Coord;
    };
    /**
    * ##### **(instance of Container).el HTMLElement **
    * This (sometimes) point to the element represented by this Class
    */
    el: Element;
    /**
    * ##### **(instance of Container).selector **
    * Identical to (see) Item.selector
    */
    selector: () => string;
    toString(prefix?: string, lf?: string, pre?: string): string;
    /**
    * ##### **Container constructor **
    * This is done "automatically" by liefs-layout-manager using Item.I()
    * Do not call/use this - interlal use only
    */
    constructor(label: string, trueIsHor: boolean, items: Item[], margin?: number);
    /**
    * ##### **(instance of Container).itemsCheck() function **
    * When a Container is defined, this function checks to see that the % values total 100 percent
    */
    itemsCheck(): void;
    /**
    * ##### **(instance of Container).update() function **
    * This function calles a recursive update of container - items.
    * it is called by resizeEvent.
    *
    * If you would like to "test" your layout - you can pop some co-ordinates here to check
    *```javascript
    * Container.get("SomeGroupName").update(1920, 1080); // this returns an object of co-ordinates call this to test layout
    *```
    */
    update(width: number, height: number, xOffset?: number, yOffset?: number, includeParents?: boolean): void;
    /**
    * ##### **(instance of Container).itemByLabel() function **
    * debating if this function has merit - on the axe list.
    * just use Item.get("SomeLabel");
    */
    itemByLabel(label: string): Item;
}
/**
* ##### **Layout - Class Description:**
* Layout is a Class that stores all properties relating to A Layouts.
*
* A Layout simply a Container (Class), and a conditionalFunction.
*
* A Handler is a list of Layouts.  On Resize Event, The Handler
* traverses the list of layouts.  When it finds a conditionalFunction to be true,
* it sets that Handler (Often the whole screen) to the Container of that Layout.
*
* This class can be reached (not at all easiliy.... why would you?)
* by Handler.handlers[index usually 0].layouts[index usually 0]
*/
export declare class Layout {
    iterator(): Item[];
    /**
    * ##### **(Layout Instance).label - String:**
    * This is the id/string reference to this Instance.
    */
    label: string;
    /**
    * ##### **(Layout Instance).isActive - Boolean:**
    * Will be removed in later revisions.
    */
    isActive: boolean;
    /**
    * ##### **(Layout Instance).Contaner - Class Container:**
    * The Container that will be use if (Layout Instance).conditionalFunction(x, y); is true
    */
    container: Container;
    /**
    * ##### **(Layout Instance).conditionalFunction - Function(x, y):**
    * anonymous function with (window width, window height) supplied as arguments.
    * set to true if conditions wish this Container to be the active one for the Handler.
    */
    conditionalFunction: Function;
    /**
    * ##### **(Layout Instance).myArgsObj - Object:**
    * this is an Object of Key (TypeOf any argument) value list of arguments of TypeOf Key.
    */
    myArgsObj: any;
    /**
    * ##### **(Layout Instance)setArgsObj - Function Reference:**
    * Points to liefs-layout-manager.lib.setArgsObj which uses "this"
    */
    setArgsObj: Function;
    toString(prefix?: string, lf?: string, pre?: string): string;
    /**
    * ##### **(Layout Instance).constructor()**
    *
    * @param Arguments expects:
    *
    * label (string) (Optional)
    *
    * Container (Class Container) Object (required)
    *
    * Anonymous Function two arguments Handler (screen) Width, and Height
    *
    * these arguments can be supplied in any order. (Sorted by TypeOf)
    */
    constructor(...Arguments: any[]);
}
/**
* ##### ** L - Fuction Description:**
*```javascript
* L()           // is identical to:
* new Layout()
*```
*/
export declare function L(...Arguments: Array<any>): Layout;


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

export class Handler {
  static iterator(): Array<Handler> { return Handler.handlers; }
  iterator(): Array<Layout> { return this.layouts; }
/**
* ##### **Handler.handlers - Array<Handler> STATIC **
* internal use - this is where Handler stores it list OF (instance of Handler)
*/
    static handlers: Array<Handler> = [];
/**
* ##### **Handler.isActive - boolean - set true if active STATIC **
* Ha Ha, I haven't programed this in yet - you're stuck on.
*/
    static isActive: boolean = false;
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
    static resizeCallbackThrottle: number = 0;
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
    static delayUntilStart: number = 200;
/**
* ##### **Handler.showObj Object of Key label value {show: boolean; el: Element} STATIC **
* This is where all the elements are flagged as hidden or visible.
* Internal Use Only.
*/
    static showObj: { [index: string]: { show: boolean; el: Element; } } = {};
/**
* ##### **Handler.verbose boolean STATIC **
* Default = true
* Set False for no console.log()
*/
    static verbose: boolean = true;
/**
* ##### **Handler.changeUrl boolean STATIC **
* Default = true
* Set False for no url push - page state.
*/
    static changeUrl: boolean = true;
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
    setArgsObj: Function = setArgsObj;
/**
* ##### **(instance of Handler).position **
* This is the Coord Object for the (instance of Handler)
*/
    position: Coord = new Coord();
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
    isActive: boolean = true;
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
    selector = function() { return "#" + this.label; };

    toString(prefix: string = "", lf = "\n", pre = "\t"): string {
      let i: number;
      let out: string = prefix + "H(\"" + this.label + "\"," + lf;
      for ( i = 0 ; i < this.layouts.length ; i++) {
        out += prefix + this.layouts[i].toString(prefix + pre);
        if (i < this.layouts.length - 1) out += ",";
        out += lf;
      }
      out += prefix + ")";
      return out;
    }
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
    static watchForResizeEvent(): void {
        window.onresize = function (e: Event){
            window.clearTimeout(Handler.callbackThrottleId);
            Handler.callbackThrottleId = window.setTimeout(Handler.resizeEvent(e), Handler.resizeCallbackThrottle);
        };
    }
/**
* ##### **Handler.activate()  - function STATIC **
* basically using ANY of liefs-layout-manager functions triggers this function
*
* When called (by liefs-layout-manager - no need for you to do so....)
* Handler knows - OK you used a function of mine, so start up soon,
* and since I know I'm starting, ignore further calls here.
*
*/
    static activate() {
        if (!(Handler.isActive)) {
            Handler.isActive = true;
            setTimeout(function () { if (Handler.isActive) Handler.startHandler(); }, Handler.delayUntilStart);
        }
    }
/**
* ##### **Handler.createDivList()  - function STATIC **
* This function is called after all Defining is done.
* it loops though all Items, Containers, and Handlers, looking for matching
* elements, which it adds to the hide/show list
* Internal use only - no need to ever call it
*/
    static createDivList() {
        let ids: any;
        ids = Object.keys(Item.items);
        for (let i = 0; i < ids.length; i++)
            if (Item.items[(ids[i])][0].el) Handler.showObj[(ids[i])] = { el: Item.items[(ids[i])][0].el, show: false };
        ids = Object.keys(Container.containers);
        for (let i = 0; i < ids.length; i++)
            if (Container.containers[(ids[i])].el) Handler.showObj[(ids[i])] = { el: Container.containers[(ids[i])].el, show: false };
        let handlers = Handler.handlers;
        for (let i = 0; i < handlers.length; i++)
            if ((handlers[i]).el) Handler.showObj[(handlers[i]).label] = { el: (handlers[i]).el, show: false };
    }
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
    static startHandler() {
        if (Handler.verbose) console.log("Handler Started");
//        window.addEventListener && window.addEventListener("popstate", Handler.readUrl);
        Handler.readUrl();
        if (!Handler.handlers.length)
            H("defaultHandler", L("defaultLayout", Container.root(), function (x, y) { return true; }));
        Handler.createDivList();
        Handler.watchForResizeEvent();
        Handler.resizeEvent();

        window.onpopstate = function(e){
            if(e.state) Handler.readUrl();
        };
    }

    static callback = function(){};

    static title = function(){ return document.title; };

    static readUrl() {
      let searchItem: Item;
      let href = window.location.href;
      let ipagelist, keyslist, i, j;

      let match,
          pl     = /\+/g,  // Regex for replacing addition symbol with a space
          search = /([^&=]+)=?([^&]*)/g,
          decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
          query  = window.location.search.substring(1);
      Handler.urlParams = {};
      while (match = search.exec(query))
         Handler.urlParams[decode(match[1])] = decode(match[2]);

      if (href.indexOf("#") > -1) {
        let value = href.slice( href.indexOf("#") + 1 );
        let ikeys = Object.keys( Item.items );
        for (i = 0; i < ikeys.length; i++) {
          ipagelist = Item.items[ ikeys[i] ][0].pages;
          if (ipagelist) {
            keyslist = [];
            for ( j = 0 ; j < ipagelist.length ; j++) keyslist.push( ipagelist[j].label );

            if (keyslist.indexOf( value ) !== -1) {
              searchItem = Item.items[ ikeys[i] ][0];
              break;
            }
          }
        }
        Handler.urlParams[((searchItem) ? searchItem.label : "NotFound")] = href.slice( href.indexOf("#") + 1 );
      }
//      if (Handler.verbose) console.log("Handler.urlParams");
//      if (Handler.verbose) console.log(Handler.urlParams);
      let pageNames;
      let eachKey;
//      console.log(Handler.urlParams);
      let ukeys = Object.keys(Handler.urlParams);
      for (let i = 0; i < ukeys.length; i++) {
        eachKey = ukeys[i];
//        alert(eachKey);
        if (Item.get(eachKey) && Item.get(eachKey).pages) {
          pageNames = Item.get(eachKey).pages.map(function (item) { return item.label; });
          if (pageNames.indexOf( Handler.urlParams[eachKey] ) > -1) {
            Item.setPage(eachKey, Handler.urlParams[eachKey], false);
            if (Handler.verbose) {
              console.log("Setting Page: " + eachKey + "\nTo: " + Handler.urlParams[eachKey]);
              Item.setPage(eachKey, Handler.urlParams[eachKey], false);
            }
          }
          else if (Handler.verbose) console.log("Existing Pages: " + eachKey + "\nHas no page: " + Handler.urlParams[eachKey]);
        } else if (Handler.verbose) console.log("Key: " + eachKey + "\nValue: " + Handler.urlParams[eachKey] + " not used.");
      }
    }
    static urlParams: any;

    static onPushState() {
      let urlObj = {};
      let item: Item;
      let postUrl = "";
      let first = true;
      let href = window.location.href;
      if (href.indexOf("?") > -1) href = href.slice(0, href.indexOf("?") );
      if (href.indexOf("#") > -1) href = href.slice(0, href.indexOf("#") );

      let ikeys = Object.keys(Item.items);
      for (let i = 0; i < ikeys.length; i++) {
        item = Item.items[ ikeys[i] ][0];
        if (item.pages) urlObj[ ikeys[i] ] = item.pages[ item.currentPage ].label;
      }
      if (Object.keys( urlObj ).length === 1) {
        postUrl += "#" + urlObj[ Object.keys( urlObj )[0] ];
      } else if (Object.keys( urlObj ).length > 1) {
        ikeys = Object.keys(urlObj);
        for (let i = 0; i < ikeys.length; i++) {
          postUrl += (first ? "?" : "&") + ikeys[i] + "=" + urlObj[ ikeys[i] ];
          first = false;
        }
      }
      if ( history.pushState && (window.location.href !== href + postUrl)) history.pushState( {}, document.title, href + postUrl );
//      console.log("New Url:");
//      console.log(href + postUrl);
    }
/*
    static parseUrl() {
      Item.currentUrl = window.location.href;
//      alert("Parsing :" + Item.currentUrl);
      if (Item.currentUrl.indexOf("#") > -1) {
        for (let eachKey of Object.keys( Item.items )) {
          if (Item.items[ eachKey ][0].pages) {
//            alert("Item.setPage(" + Item.items[ eachKey ][0] + ", " + Item.currentUrl.slice( Item.currentUrl.indexOf("#")+1 ));
            Item.setPage(Item.items[ eachKey ][0], Item.currentUrl.slice( Item.currentUrl.indexOf("#") + 1) );
            break;
          }
        }
      }
    }
    static currentUrl = "";
*/
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
    static hideEl(itemEl: any) {
        directiveSetStyles(itemEl, {visibility: "hidden", left: "1px", top: "1px", width: "1px", height: "1px"});
//        Handler.hideDragbar(itemEl)
    }

//    static hideDragbar( itemEl ) {
//        if (itemEl && itemEl.id && (document.getElementById(itemEl.id+"Dragbar")) )
//            directiveSetStyles(document.getElementById(itemEl.id+"Dragbar"), {visibility: "hidden", left: "1px", top: "1px", width: "1px", height: "1px"});
//    }
    static HideAllDragbars(container: Container) {
        let eachItem;
        for (let i = 0; i < (container.items).length; i++) {
            eachItem = (container.items)[i];
            if (eachItem.dragBar) Handler.hideEl( eachItem.dragBar.el );
            if (eachItem.container) Handler.HideAllDragbars(eachItem.container);
        }
    }

    static resizeEvent(e: Event = null) {
        let itemEl: any;
        let isEl: any;
        let eachHandler;
        let keys, eachKey;

        Handler.Hide();
        for (let i = 0; i < (Handler.handlers).length; i++) {
            eachHandler = (Handler.handlers)[i];
            eachHandler.chooseContainer();
            eachHandler.update();
        }
        keys = Object.keys(Handler.showObj);
        for (let i = 0; i < keys.length; i++) {
            eachKey = keys[i];
            if (!Handler.showObj[eachKey].show) {
                itemEl = Handler.showObj[eachKey].el;
                Handler.hideEl(itemEl);
            }
        }
      Handler.callback();
    }
/**
* ##### **Handler.Hide()  - function STATIC **
* This is part of the refresh script. this small piece simple hides the elements that need to be hidden
*/
    static Hide() {
        let keys = Object.keys(Handler.showObj);
        for (let i = 0; i < keys.length; i++)
            Handler.showObj[ keys[i] ].show = false;
    }
/**
* ##### **(instance of Handler).update()  - function **
* This is part of the refresh script.
* It calles the active Contianer.update (See that)
* and applies the results to set all element style properties to make the page render correctly.
*
* This is an internal function - no reason to call
*/
    update() {
        let coord: Coord, pageItem: Item, item: Item;
        let itemLabel;

        this.activeContainer.update(this.position.width, this.position.height, this.position.x, this.position.y);
        let activeItemLabels = Object.keys(this.activeContainer.lastUpdate);
        for (let i = 0; i < activeItemLabels.length; i++) {
            itemLabel = activeItemLabels[i];
            if (itemLabel in Handler.showObj) {
                item = this.activeContainer.itemByLabel(itemLabel);
                coord = this.activeContainer.lastUpdate[itemLabel];
                pageItem = Item.page(item);
                Handler.showObj[pageItem.label].show = true;
                directiveSetStyles(pageItem.el, {
                    visibility: "visible", left: px(coord.x), top: px(coord.y), width: px(coord.width), height: px(coord.height)
                });
            }
            if (Item.get(itemLabel).dragBar) Item.get(itemLabel).dragBar.update();
        }
    }
/**
* ##### **(instance of Handler).chooseContainer()  - function **
* This is part of the refresh script.
* It loops through the layout options, and sets (instance of Handler).activeContainer to correct value.
*
* This is an internal function - no reason to call
*/
    chooseContainer() {
        this.position.getSource(this.el);
        let keys = this.layouts;
        let eachLayout;
        for (let i = 0; i < keys.length; i++) {
            eachLayout = keys[i];
            if (eachLayout.conditionalFunction(this.position.width, this.position.height)) {
                if (!this.activeContainer) {
                    if (Handler.verbose) console.log("Starting With Container: " + eachLayout.container.label);
                }
                else if (this.activeContainer.label !== eachLayout.container.label) {
                    if (Handler.verbose) console.log("Switched From Container :" + this.activeContainer.label + " to " + eachLayout.container.label);
                    Handler.HideAllDragbars(this.activeContainer);
                }
                this.activeLayout = eachLayout;
                this.activeContainer = eachLayout.container;
                break;
            }
        }
        if (!this.activeContainer) {
            this.activeContainer = (this.layouts[this.layouts.length - 1]).container;
            if (Handler.verbose) console.log("All Layout conditionalFunctions failed! Choosing last in list: " + this.activeContainer.label);
        }
    }
}
/**
* ##### **H() Funtion to create a new Handler Instance **
* This creates a Handler Instance.
* @param (TypeOf 'string') - when an Argument is of TypeOf 'string' it is assigned to be the label of this (instance of Handler)
* @param (TypeOf Class Layout) - when an Argument is of TypeOf Layout, it appends it to the list of layouts
* for this Handler.  There is not limit to the number of layouts supplies as arguments.
*/
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
    matchLength: function (expected: number, received: number, reference: string = "") {
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
    typeMismatch: function (expected: string, received: string, reference: string = "") {
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
    badArgs: function (expected: string, received: string, reference: string = "") {
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
  if (!el) console.log("onEvent tried to attach to nothing");
  else {
    if (el.addEventListener) el.addEventListener(eventType, eventFunction, false);
    else if (el.attachEvent) el.attachEvent(eventType, eventFunction);
  }
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
export function htmlToElement(html) {
    let template = document.createElement("template");
    template.innerHTML = html;
    return template.content.firstChild;
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
export function swapEl(source, replacement) { source.parentNode.replaceChild(replacement, source); }
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
            let ms: Array<string> = match.split("|");
            for (let i = 0; i < ms.length; i++) if (trimCompare(ctype, ms[i])) return true;
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
export function replaceAll (sstring: string, omit: string, place: string, prevstring: string = undefined): string {
  if (prevstring && sstring === prevstring) return sstring;
  prevstring = sstring.replace(omit, place);
  return replaceAll(prevstring, omit, place, sstring);
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
    let eachAttribute;
    let NodeList = document.querySelectorAll(querrySelectorAll);
    for (let i = 0; i < NodeList.length; i++) {
        Obj = { el: NodeList[i], tagname: NodeList[i].tagName };
        for (let i = 0; i < attributesList.length; i++) {
            eachAttribute = attributesList[i];
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
        }
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
    let keys = Object.keys(stylesObject);
    for (let i = 0; i < keys.length; i++)
        el["style"][ keys[i] ] = stylesObject[ keys[i] ];
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

// document.onmousemove = function(e){
//    cursorX = e.pageX;
//    cursorY = e.pageY;
// }
export function screenSize() {
  let w  = window,
  d  = w.document,
  de = d.documentElement,
  db = d.body || d.getElementsByTagName("body")[0],
  x  = w.innerWidth  || de.clientWidth  || db.clientWidth,
  y  = w.innerHeight || de.clientHeight || db.clientHeight;
  return {x: x, y: y };
}
export let CFL = [];
export function mymouseleave() {
  let element = document.getElementById("context");
  element.parentElement.removeChild(element);
}
export function context(el: HTMLElement, selectionList: Array<[string, Function]>, stylestring = "") {
  el.oncontextmenu = function(e) {
    e.preventDefault();
    CFL = [];
    let ss = screenSize(), x: number = ss.x, y: number = ss.y, stylestring: string = "",
    inner: string = "", currentstring: string, currentFunction: Function, oc, i, j, t;

    stylestring +=  "left:" + (e.clientX - 10).toString() + "px;";
    stylestring +=  "top:" + (e.clientY - 10).toString() + "px;";
    stylestring += "position: fixed; z-index: 1000;";
    let contextEl = document.createElement("div");
    contextEl.setAttribute("id", "context");
    contextEl.style.cssText = stylestring;
    contextEl.onmouseleave = mymouseleave;

    for (i = 0; i < selectionList.length; i++) {
      currentstring = selectionList[i][0];
      currentFunction = selectionList[i][1];
      CFL.push( function(t) {currentFunction(t); mymouseleave(); } );
      oc = "onclick=\"CFL[" + (CFL.length - 1).toString() + "](this);\"";
      if (currentstring.indexOf("<") === -1) {
        currentstring = "<div " + oc + ">" + currentstring + "</div>";
      } else {
        j = currentstring.indexOf(">");
        t = currentstring.slice(0, j) + " " + oc + currentstring.slice(j);
        currentstring = t;
      }
      inner += currentstring + "\n";
    }
//    alert(inner);
    contextEl.innerHTML = inner;
    document.body.appendChild(contextEl);
//    alert(stylestring);
/*
    let contextEl = document.createElement("div");
    contextEl.setAttribute("id", "context");
    contextEl.style.cssText = "postion: fixed; background-color: red; z-index: 10;";

    contextEl.innerHTML = "Hello World";
    document.body.appendChild(contextEl);
  };
*/
  };
}
/**
* ##### **Coord - Class Description:**
* Coord is a Object Class that simply hold the dimenions of an Item/Container/Handler
* (x, y, width , height)
*
* These Objects are created by liefs-layout-manager interally. There is no reason to
* manually create a Coord Instance.1
*/
export class Coord {
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
    constructor(width: number = 0, height: number = 0, x: number = 0, y: number = 0) {
        this.width = width; this.height = height; this.x = x; this.y = y;
    }
/**
* ##### **(instace of Coord).getSource - function **
* internal use  
* Called to get the Coord of an Element BEFORE liefs-layout-manager does anything to it.
*/
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
export class Dragbar {
  static drabarByIdObj: any  = {};
/**
 * ##### **Dragbar.mouseDown - Static Method:**
 *
 * internal use only - no reason to call/use - called when dragbar clicked
 */
  static mouseDown (e: any) {
    let dragbar: Dragbar = Item.get( (e.srcElement.id).slice(0, -7) ).dragBar;
    e.preventDefault();
    Dragbar.activeDragbar = dragbar;
    Dragbar.beforeCurrent = dragbar.parent.current;
    Dragbar.isDown = true;
    Dragbar.direction = Container.of(dragbar.parent).direction;
    Dragbar.dragstart = Dragbar.direction ? e.clientX : e.clientY;
  }
/**
 * ##### **Dragbar.mouseUp - Static Method:**
 *
 * internal use only - no reason to call/use called when mouseUp
 */
  static mouseUp (e: Event) {
    Dragbar.isDown = false;
    Item.isDown = false;
  }
/**
 * ##### **Dragbar.mouseMove - Static Method:**
 *
 * internal use only - no reason to call/use - called when mousemove
 */
  static mouseMove (e: any) {
    let dragDiff;
    let pItem: Item;
    let newCurrent: number;
    if (Dragbar.isDown) {
      event.preventDefault();
      pItem = Dragbar.activeDragbar.parent;
      dragDiff = (Dragbar.direction ? e.clientX : e.clientY) - Dragbar.dragstart;
      dragDiff *= (Dragbar.activeDragbar.front) ? 1 : -1;
      newCurrent = vpx(Dragbar.beforeCurrent) + dragDiff;
      if (pItem.min && (newCurrent < vpx(pItem.min))) newCurrent = vpx(pItem.min);
      if (pItem.max && (newCurrent > vpx(pItem.max))) newCurrent = vpx(pItem.max);
      pItem.current = newCurrent.toString() + "px";
      Handler.resizeEvent();
    }
    if (Item.isDown) {
        event.preventDefault();
        dragDiff = e.clientX - Item.dragstart;
//        console.log(dragDiff);
        if ( dragDiff > Item.PageTriggerSize) {
//            console.log("Next Page");
            Item.backPage(Item.activePage);
        }
        if ( dragDiff < -Item.PageTriggerSize) {
//            console.log("Back Page");
            Item.nextPage(Item.activePage);
        }
        Dragbar.mouseUp(e);
    }
  }
  static dragbars: Array<Dragbar> = [];
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
  static isDown = false;
/**
 * ##### **Dragbar.noInit - Static Boolean:**
 *
 * internal use only - no reason to call/use - needs "on first instance set up"
 * false to start, true after first instance of Dragbar
 */
  static noInit: boolean = true;
/**
 * ##### **(Dragbar Instance).Selector - anonymous function:**
 *
 * internal use only - no reason to call/use - Indicates the selector uses to find the Dragbar
 * in this version it is [Item.selector](./_liefs_layout_manager_.item.html#selector)() + " > ." + ("Hdragbar" or "Vdragbar")
 *
 * This could be changed by resetting this anonymous function
 */
  Selector = function () { return this.parent.selector() + " > ." + (this.parent.lastDirection ? "H" : "V") + "dragbar"; };
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
  size: Coord = new Coord();
/**
 * ##### **(Dragbar Instance).front - boolean showing if dragbar is at front of Item
 * `(Instance of Dragbar).front = true;` (true - default) or back of Item:
 * `(Instance of Dragbar).front = false;` (used when Item is "last" in Array)
 *
 * Note this parameter is set when defining and item, not here. See [Item](./_liefs_layout_manager_.item.html)
 *
 * internal use only - no reason to call/use
 */
  front: boolean = true;
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
  constructor(item: Item, front: boolean = true, width = undefined) {
    let dragBarId = item.label + "Dragbar";
    Dragbar.drabarByIdObj[dragBarId] = this;
    this.parent = item;
    this.front = front;
    if (document.getElementById(dragBarId)) {
        this.el = document.getElementById(dragBarId);
    }
    else {
        this.el = document.createElement("div");
        this.el.id = dragBarId;
        document.body.appendChild(this.el);
    }
    this.el.className = Container.of(item).direction ? "Hdragbar" : "Vdragbar";
//
//        if (this.parent.el.firstChild) this.parent.el.insertBefore(this.el, this.parent.el.firstChild);
//        else this.parent.el.appendChild(this.el);
//
    if (Dragbar.noInit) {
      onEvent(document.body, "mouseup", Dragbar.mouseUp);
      onEvent(document.body, "mousemove", Dragbar.mouseMove);
      Dragbar.noInit = false;
    }
    onEvent(this.el, "mousedown", Dragbar.mouseDown);
    this.width = width || Container.of(item).margin || Container.marginDefault;
    Dragbar.dragbars.push(this);
  }
/**
 * ##### **(Dragbar Instance).update**
 *
 * internal use only - no reason to call/use
 * this function is called on resizeEvent to recalculate the Coord Class
 */
  update() {
    let keys = Object.keys(this.size);
    for (let i = 0; i < keys.length; i++) this.size[ keys[i] ] = this.parent.size[ keys[i] ];
    if (this.parent.size)
      if (Container.of(this.parent).direction) {
        this.size.x += (this.front) ? this.parent.size.width : -this.width;
        this.size.width = this.width;
      } else {
        this.size.y += (this.front) ? this.parent.size.height : -this.width;
        this.size.height = this.width;
      }
    directiveSetStyles(this.el, {
        visibility: "visible", left: px(this.size.x), top: px(this.size.y), width: px(this.size.width), height: px(this.size.height)
    });
  }
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
export class Item {
    static iterator(): Array<Item> {
      let ikeys = Item.keys();
      let returnList: Array<Item> = [];
      for (let i = 0 ; i < ikeys.length ; i++)
        returnList.push( Item.get( ikeys[i] ) );
      return returnList;
    }

    static PageTriggerSize = 1;
    static activePage: Item;
    static isDown = false;
    static dragstart: number;
    static mouseDown (e: any, item: Item) {
        if (item.swipe) {
//            event.preventDefault();
            Item.activePage = item;
            Item.isDown = true;
            Item.dragstart = e.clientX;
//            console.log("Page: " + item.label);
        }
    }
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
    static get(label: string, InstanceNo: number = undefined): Item {
        if (InstanceNo !== undefined) return Item.items[label][InstanceNo];
        let foundItem: Item = undefined;
        let handler: Handler;
        for (let i = 0; i < Handler.handlers.length; i++) {
            handler = Handler.handlers[i];
            if (handler.activeContainer)
                foundItem = handler.activeContainer.itemByLabel(label);
            if (foundItem) return foundItem;
        }
        if (Object.keys( Item.items ).indexOf(label) > -1) return Item.items[label][0];
        return undefined;
    }
/**
 * ##### **Item.h - Static Method:**
 *
 * ... is really Item.I() - see Item Class explanation.
 */
    static h(...Arguments: any[]) {
        Arguments.push("hor");
        return I(...Arguments);
    }
/**
 * ##### **Item.v - Static Method:**
 *
 * ... is really Item.I() - see Item Class explanation
 */
    static v(...Arguments: any[]) {
        Arguments.push("ver");
        return I(...Arguments);
    }
    static keys() { return Object.keys( Item.items ); }
/**
 * ##### **Item.I - Static Method:**
 *
 * see Item Class explanation
 */
    static I(...Arguments: any[]): Item {
        let newItem: Item;
        let myArgsObj = argsObj(arguments);
        let Ilabel: string, Istart: string, Imin: string, Imax: string, Imargin: number;
        let Iitems: Array<Item>, Icontainer: Container, IisHor: boolean;
        let isItem: string;
        let IpageTitle: string;
        let dragFront: boolean = true;
        let swipe = true;
        let eachArray;

        if ("array_Item" in myArgsObj) {
            if (!("Item" in myArgsObj)) myArgsObj.Item = [];

            for (let i = 0; i < (myArgsObj["array_Item"]).length; i++) {
                eachArray = (myArgsObj["array_Item"])[i];
                for (let j = 0; j < eachArray.length; j++)
                    myArgsObj.Item.push(eachArray[j]);
            }
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
                else if (isItem === "swipeoff") swipe = false;
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
                for (let i = 0; i < Iitems.length; i++)
                    if ((Iitems[i]).el)
                        onEvent((Iitems[i]).el, "mousedown", function (e) {
                            Item.mouseDown(e, newItem);
                        } );
                return newItem;
            }
            else {
                if (Iitems.length > 1) Item.setDragBarDirection(Iitems[Iitems.length - 1], false);
                Icontainer = new Container(Ilabel, IisHor, Iitems, Imargin);
            }

        }
        newItem = new Item(Ilabel, Istart, Imin, Imax, Icontainer);
        if (IpageTitle) newItem.pageTitle = IpageTitle;
        if (!dragFront) Item.setDragBarDirection( newItem, dragFront );
        if (!swipe) newItem.swipe = false;
        return newItem;
    }
    static setDragBarDirection(item: Item, direction: boolean) {
        setTimeout(function(){if (item.dragBar) item.dragBar.front = direction; }, 10);
    }
/**
 * ##### **Item.nextPage() - Static Method:**
 *
 * see Item Class explanation
 * @param item_ - ((instance of) Item Class) OR (string id name of - choosing first instance)- Root of Pages
 * @param stop - if true, endless loop of pages, if false, stops after first iteration.
 */
    static nextPage(item_: Item | string, stop: boolean = false, changeUrl = true): void {
        let item: Item = Item.parseItem(item_);
        if (item.currentPage + 1 < item.pages.length) Item.setPage(item, item.currentPage + 1, changeUrl);
        else if (!stop) Item.setPage(item, 0);
    }
/**
 * ##### **Item.backPage() - Static Method:**
 *
 * see Item Class explanation
 * @param item_ - ((instance of) Item Class) OR (string id name of - choosing first instance)- Root of Pages
 * @param stop - if true, endless loop of pages, if false, stops after first iteration.
 */
    static backPage(item_: Item | string, stop: boolean = false, changeUrl = true) {
        let item: Item = Item.parseItem(item_);
        if (item.currentPage > 0) Item.setPage(item, item.currentPage - 1);
        else if (!stop) Item.setPage(item, item.pages.length - 1, changeUrl);
    }
/**
 * ##### **Item.setPage() - Static Method:**
 *
 *  see Item Class explanation
 * @param item_ - ((instance of) Item Class) OR (string id name of - choosing first instance)- Root of Pages
 * @param value - string id name of Child Page of above item_
 */
    static setPage(item_: Item | string, value: string | number, changeUrl = true) {
        Item.parseValue(value, Item.parseItem(item_));
        if (changeUrl && Handler.changeUrl) Handler.onPushState();
        Handler.resizeEvent();
    }
/**
 * ##### **Item.setPageparseValue() - Static Method:**
 *
 * internal use only
 * is a sub-function of Item.setPage()
 */
    static parseValue(value_: string | number, item: Item): void {
        let foundPage: boolean = false;
        if (TypeOf(value_, "string")) {
            for (let i = 0; i < item.pages.length; i++)
                if (item.pages[i].label === <string>value_) {
//                    if ((<string>value_).indexOf("escription") !== -1) throw "now";
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
//        return item.pages[ item.currentPage ].label;
    }
/**
 * ##### **Item.parseItem() - Static Method:**
 *
 * @param item_ - ((instance of) Item Class) OR (string id name of - choosing first instance)- Root of Pages
 * @return (intance of) Item Class
 */
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
/**
 * ##### **Item.page() - Static Method:**
 *
 * @param item - ((instance of) Item Class)
 * @return (intance of) Item Class - If this item is not root of pages, returns arugment item, otherwize returns current page Item.
 */
     static page(item: Item): Item { return (item.pages) ? item.pages[item.currentPage] : item; }
    static debug = true;
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
    static items: { [index: string]: Array<Item>; } = {};

    swipe: boolean = true;
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
    lastDirection: boolean = true;
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
    selector = function() { return "#" + this.label; };
/**
 * ##### **(instance of Item).dragBar - Class Dragbar Object :**
 *
 * If an Item has a 'min' value set, a dragBar instance is automatically
 * created and stored here.
 */
    dragBar: Dragbar;

    toString(prefix: string = "", lf = "\n", pre = "\t"): string {
      let i, titem;
      let inc: string = "\", \"";

      let out = prefix + "I(\"" + this.label;
      if (this.start !== "0px") out += inc + this.start;
      if (this.min) out += inc + this.min + inc + this.max;

      if (this.container) {
        out += "\", " + this.container.margin.toString() + ", " + lf;
        for (i = 0 ; i < this.container.items.length; i++) {
          titem = this.container.items[i];
          out += titem.toString(pre + prefix, lf, pre);
          out += ((i < this.container.items.length - 1) ? ", " : "") + lf;
        }
        out += prefix + ")";
      }
      else if (this.pages) {
        out += "\", " + lf;
        for (i = 1 ; i < this.pages.length; i++) {
          out += this.pages[i].toString(pre + prefix, lf, pre);
          out += ((i < this.pages.length - 1) ? ", " : "") + lf;
        }
        out += prefix + ")";
      }
      else {
        out += "\")";
      }
      return out;
    }
    iterator(): Array<Item> { return (this.container) ? this.container.items : ((this.pages) ? this.pages : []); };
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
        if (min && max) {
          let that = this;
          setTimeout(function(){that.dragBar = new Dragbar(that); }, 0);
        }
        if (isUniqueSelector(this.selector())) {
            this.el = document.querySelectorAll(this.selector())[0];
            this.el["style"]["position"] = "fixed";
        }
        else if ((!this.container) && !("jasmineTests" in window))
            liefsError.badArgs("Selector Search for '" + this.label + "' to find ONE matching div",
                "Matched " + document.querySelectorAll(this.selector()).length.toString() + " times", "Handler Item Check");
    }
}

/**
 * ### Please Start [here](https://liefs.github.io/classes/_liefs_layout_manager_.item.html)
 *
 * then read on after you have read above - or it wont make any sense.
 *
 * ##### ** var I = Item.I:**
 * See [liefs-layout-manager.Item.I()](https://liefs.github.io/classes/_liefs_layout_manager_.item.html)
 */
export let I = Item.I;
/**
 * ##### ** var v = Item.I:**
 *
 * See [liefs-layout-manager.Item.I() ](https://liefs.github.io/classes/_liefs_layout_manager_.item.html)
 */
export let v = Item.v;
/**
 * ##### ** var h = Item.I:**
 *
 * See [liefs-layout-manager.Item.I() ](https://liefs.github.io/classes/_liefs_layout_manager_.item.html)
 */
export let h = Item.h;
/**
 * ##### ** var h = Item.I:**
 *
 * See [liefs-layout-manager.Item.items ](https://liefs.github.io/classes/_liefs_layout_manager_.item.html#items)
 */
export let items = Item.items;

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
export class Container {
  static iterator() {
    let retList: Array<Container> = [];
    let keys = Object.keys(Container.containers);
    for (let i = 0 ; i < keys.length ; i++) {
      retList.push( Container.containers[ keys[i] ]);
    }
     return retList;
  }
  iterator() { return this.items; }
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
    static of(item: Item) {
        let keys = Object.keys(Container.containers);
        let eachKey;
        for (let i = 0; i < keys.length; i++) {
            eachKey = keys[i];
            if (Container.containers[eachKey].items.indexOf(item) > -1)
                return Container.containers[eachKey];
        }
        if (Handler.verbose) console.log("Container of Error: Containers");
        if (Handler.verbose) console.log(Container.containers);
        if (Handler.verbose) console.log(item);
        return undefined;
    }
/**
* ##### **Container.get() - function: Static**
* @param label - label of (instance of Item)
*```javascript
* Container.get("SomeItemLabel");  // returns (instance of Container)
*```
* @return (instance of Container)
*/
    static get(label: string) {
        if (label in Container.containers) return Container.containers[label];
        return undefined;
    }
/**
* ##### **Container.push() - function: Static**
* @param container - (instance of Container)
* @return (instance of Container)
* No reason to use this - internal use -
* ...as the Containers are defines, push them on to the "Array<defined>"
* `Container.containers`
*/
    static push(container: Container): Container {
        Container.containers[container.label] = container;
        return container;
    }
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
    static fixed(container: Container, width: number, height: number): number {
        const NOTDEFINED: number = -999;
        let fixed: number = 0;
        let newSize: number = NOTDEFINED;
        let eachItem;

        let keys = container.items;
        for (let i = 0; i < keys.length; i++) {
            eachItem = keys[i];
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
    static percent(container: Container, width: number, height: number, fixed: number): void {
        let max = (container.direction) ? width : height;
        let pixelsLeftForPercent: number = (max - fixed - container.margin * (container.items.length + 1));
        let newPercent: number;
        let eachItem;
        let keys = container.items;
        for (let i = 0; i < keys.length; i++) {
            eachItem = keys[i];
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
    static fill(container: Container, xOffset: number = 0, yOffset: number = 0): void {
        let margin: number = container.margin;
        let sum: number = margin;
        let eachItem;
        let keys = container.items;
        for (let i = 0; i < keys.length; i++) {
            eachItem = keys[i];
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
/**
* ##### **Container.updateRecursive() - function: Static**
* This is an internal function - no need to call/use
*
*/
    static updateRecursive(width: number, height: number, container: Container, xOffset: number = 0, yOffset: number = 0, includeParents: boolean = false): { [index: string]: Coord } {
        let returnObject: { [index: string]: Coord } = {};
        Container.percent(container, width, height, Container.fixed(container, width, height));
        Container.fill(container, xOffset, yOffset);
        let thisItem;
        let keys = container.items;
        for (let i = 0; i < keys.length; i++) {
            thisItem = keys[i];
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
/**
* ##### **Container.debug STATIC **
* This has not been implemented yet
*/
    static debug = true;
/**
* ##### **Container.containers Object of key label value Container STATIC **
* This is where the complete list of Containers is stored.
* Internal use - although I CAN think of reasons to access
*/
    static containers: { [index: string]: Container; } = {};
/**
* ##### **Container.marginDefault number STATIC **
* All Items are separated by (instance of Container).margin pixels.
* If margin Value is not indicated at time of creation, this default is assumed.
*```javascript
* Container.marginDefault = 10; // This changed the margin Default to 10 pixels
*```
*/
    static marginDefault: number = 4;
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
    static root() {
        return (Container.suspectedRoot)
            ? Container.suspectedRoot : Container.lastDefined;
    }
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
    items: Item[] = [];
/**
* ##### **(instance of Container).lastUpdate Depreciated **
* this will be removed next revision
*/
    lastUpdate: { [index: string]: Coord };
/**
* ##### **(instance of Container).el HTMLElement **
* This (sometimes) point to the element represented by this Class
*/
    el: Element;
/**
* ##### **(instance of Container).selector **
* Identical to (see) Item.selector
*/
    selector = function () { return "#" + this.label; };

    toString(prefix: string = "", lf = "\n", pre = "\t"): string {
      let titem: Item = Item.get(this.label);
       return titem.toString(prefix, lf, pre);
    }
/**
* ##### **Container constructor **
* This is done "automatically" by liefs-layout-manager using Item.I()
* Do not call/use this - interlal use only
*/
    constructor(label: string, trueIsHor: boolean, items: Item[], margin: number = Container.marginDefault) {
        if (Handler.verbose) console.log("Defined Container" + label);
        this.label = label; this.direction = trueIsHor; this.items = items; this.margin = margin;
        Container.containers[label] = Container.lastDefined = this;
        this.itemsCheck();
        if (isUniqueSelector(this.selector())) this.el = document.querySelectorAll(this.selector())[0];
    }
/**
* ##### **(instance of Container).itemsCheck() function **
* When a Container is defined, this function checks to see that the % values total 100 percent
*/
    itemsCheck() {
        let totalPercent: number = 0;
        let eachItem;
        let keys = this.items;
        for (let i = 0; i < keys.length; i++) {
            eachItem = keys[i];
            if (eachItem.start.slice(-1) === "%") totalPercent += parseInt(eachItem.start.slice(0, -1));
        }
        if (totalPercent !== 100) liefsError.badArgs(this.label + " to total 100%", " a total of " + totalPercent.toString() + "%", "Container.itemsCheck()");
    }
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
    update(width: number, height: number, xOffset: number = 0, yOffset: number = 0, includeParents: boolean = false): void  {
        this.lastUpdate = Container.updateRecursive(width, height, this, xOffset, yOffset, includeParents);
    }
/**
* ##### **(instance of Container).itemByLabel() function **
* debating if this function has merit - on the axe list.
* just use Item.get("SomeLabel");
*/
    itemByLabel(label: string): Item {
        let item;
        let keys = this.items;
        for (let i = 0; i < keys.length; i++) {
            item = keys[i];
            if (item.label === label) return item;
            else if (item.container && item.container.itemByLabel(label)) return item.container.itemByLabel(label);
        }
        return undefined;
    }
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
export class Layout {
  iterator() { return this.container.iterator(); }
  /**
  * ##### **(Layout Instance).label - String:**
  * This is the id/string reference to this Instance.
  */
 label: string;
 /**
 * ##### **(Layout Instance).isActive - Boolean:**
 * Will be removed in later revisions.
 */
 isActive: boolean = true;
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
 setArgsObj: Function = setArgsObj;
 toString(prefix: string = "", lf = "\n", pre = "\t"): string {
   let i: number;
   let fasst: string;
   let out = prefix + "L(\"" + this.label + "\", " + lf;
   out += prefix + this.container.toString(prefix + pre, lf, pre) + "," + lf;

   fasst = replaceAll(this.conditionalFunction.toString(), "  ", " ");
   fasst = replaceAll(fasst, "\n", "");
   fasst = replaceAll(fasst, "\t", "");
   out += prefix + pre + fasst + lf;
   out += prefix + ")";
   return out;
 }
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
/**
* ##### ** L - Fuction Description:**
*```javascript
* L()           // is identical to:
* new Layout()
*```
*/
export function L(...Arguments: Array<any>) { return new Layout(Arguments); }

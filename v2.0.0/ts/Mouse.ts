interface mouseFeatureOptions {
    label?: string;
    el?: Element;
    click?: mouseRF;
    contextmenu?: mouseRF;
    dblclick?: mouseRF;
    mousedown?: mouseRF;
    mouseenter?: mouseRF;    
    mouseleave?: mouseRF;
    mousemove?: mouseRF;
    mouseout?: mouseRF;
    mouseover?: mouseRF;
    mouseup?: mouseRF;
    dragdown?: mouseRF;
    dragmove?: mouseRF;
    dragup?: mouseRF;
    callback?: Function;

    features: Feature[];
    children: Display[];
}
interface mouseReturnObject {
    event?:MouseEvent,
    mouse?: mouseFeature,
    display?: Display,
    clientX?: number,
    clientY?: number,
    deltaX?: number,
    deltaY?: number
}
interface mouseRF {
    (o:mouseReturnObject): void;
}
interface mouseWhere {
    M:mouseFeature;
    F:mouseRF;
}
interface mouseEvents {
    click?: mouseWhere[];contextmenu?: mouseWhere[];dblclick?: mouseWhere[];mousedown?: mouseWhere[];mouseenter?: mouseWhere[];    
    mouseleave?: mouseWhere[];mousemove?: mouseWhere[];mouseout?: mouseWhere[];mouseover?: mouseWhere[];mouseup?: mouseWhere[];
    dragdown?: mouseWhere[];dragmove?: mouseWhere[];dragup?: mouseWhere[];
}
interface mouseElement {
    el: Element;
    events: mouseEvents;
}
interface mouseElementRoot {
    [propName: string]: mouseElement;
}
function M(...Arguments:any){
    return new mouseFeature(...Arguments);
}
class mouseFeature extends Feature {
    static isDown = false;
    static dragOn = false;
    static start = {x:0, y:0};
    static delta = {x:0, y:0};
    static dragMouse: mouseFeature;
    static dragStartThreshold = 4;

    static onDown(retObj:mouseReturnObject){
        retObj.event.preventDefault();
        mouseFeature.dragMouse = retObj.mouse;
        mouseFeature.isDown = true;
        mouseFeature.start.x = retObj.clientX;
        mouseFeature.start.y = retObj.clientY;
    }
    static onMove(e:MouseEvent){
        e.preventDefault();
        if (mouseFeature.isDown) {
            let MOUSE = mouseFeature.dragMouse;
            let dx = mouseFeature.delta.x = e.clientX - mouseFeature.start.x;
            let dy = mouseFeature.delta.y = e.clientY - mouseFeature.start.y;
            if (!(mouseFeature.dragOn)) {
                let d = Math.sqrt(dx*dx + dy*dy);
                if (d > mouseFeature.dragStartThreshold) {
                    mouseFeature.dragOn = true;
                    if ("dragdown" in MOUSE.o)
                        MOUSE.o.dragdown( mouseFeature.returnObj(e, MOUSE) );
                }
            }
            if (mouseFeature.dragOn && "dragmove" in MOUSE.o)
                    MOUSE.o.dragmove( mouseFeature.returnObj(e, MOUSE) );
        }
        let mm = mouseFeature.mousemove;
        for(let i=0; i < mm.length; i++) 
            mm[i].F( mouseFeature.returnObj(e, mm[i].M) );
        
    }
    static onUp(e:MouseEvent){
        e.preventDefault();
        if (mouseFeature.isDown){
            let MOUSE = mouseFeature.dragMouse;
            if ("dragup" in MOUSE.o && mouseFeature.dragOn)
                MOUSE.o.dragup( mouseFeature.returnObj(e, MOUSE) );        
            mouseFeature.isDown = false; mouseFeature.dragOn = false;
            mouseFeature.dragMouse = undefined;
            mouseFeature.delta.x = 0; mouseFeature.delta.y = 0; mouseFeature.start.x = 0; mouseFeature.start.y = 0;
        }
        let mu = mouseFeature.mouseup;
        for(let i=0; i < mu.length; i++) 
            mu[i].F( mouseFeature.returnObj(e, mu[i].M) );
    }
    static elementObject:mouseElementRoot = {};
    // left:{
    //     el: document.getElementById("id"),
    //     events: {click: [  {
    //         M:new mouseFeature(),
    //         F:function(o:mouseReturnObject){}
    //     }]}
    static events(el:Element) {
        let O = mouseFeature.elementObject;
        for(let key in O) 
            if (O[key].el == el) return O[key].events;
        let events:mouseEvents = {}
        O[el.id] = {el, events};
        return events;
    }
    static returnObj(e:MouseEvent, MOUSE:mouseFeature): mouseReturnObject{
        return {event:e, mouse: MOUSE, display: MOUSE.parent, clientX: e.clientX, clientY: e.clientY, deltaX: mouseFeature.delta.x, deltaY: mouseFeature.delta.y};
    }
    static mousemove:mouseWhere[] = [];
    static mouseup:mouseWhere[] = [];
    Arguments:argumentsOptions = {
        argsMap: {  string:     "label",
                    function:   "click",
                    Element:    "el"
                },
        defaults: { label: undefined, features:[], children:[]},
        options: {typeCheck: itemFeature.typeCheck}
    }
    debugLabel = "(mouse) M";
    o: mouseFeatureOptions;

    constructor(...Arguments: any) {
        super(...Arguments);
        let MOUSE = this;
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);

        if (Object.keys(M).length == 0) {
            window.addEventListener("mousemove", function(e:MouseEvent) {mouseFeature.onMove(e)});
            window.addEventListener("mouseup", function(e:MouseEvent) {mouseFeature.onUp(e)});
        }
        this.findEl();
        if (this.o.el) this.elFound();

        if (this.o.label == undefined) {this.o.label = `mouse_${mouseFeature.namingIndex++}`};
        M[this.o.label] = F[this.o.label] = this;
        // console.log("elementObject", mouseFeature.elementObject);
    }
    elFound(){
        // console.log("Element Found");
        for(let key in this.o)
            if (["label", "el", "features", "children"].indexOf(key) == -1)
                this.addEvent(key,this.o[key]);
    }
    init():void { let THIS = this;
        if (!THIS.o.el) setTimeout(function(){
            if (THIS.parent.el) {
                THIS.o.el = THIS.parent.el;
                THIS.elFound();
            }
        },0);
    }
    update():void {}

    addEvent(eventName:string, mouseFunction: mouseRF) {
        // console.log("Adding Event!", eventName);
        let MOUSE = this, mousewhere: mouseWhere;
        let events = mouseFeature.events(this.o.el);
        let isDrag = eventName.startsWith("drag");
        if (events[eventName] == undefined) {
            // console.log(eventName,"Seems new!",  events   );
            events[eventName] = [];
            if (eventName != "mousemove" && eventName != "mouseup" && !isDrag)
                this.o.el.addEventListener(eventName, function(e:MouseEvent) {
                    // console.log(MOUSE.o.label, "Event Name", eventName, events);
                    for(let i=0; i < events[eventName].length; i++){                        
                        mousewhere = events[eventName][i];
                        if (mousewhere.M.parent == undefined || mousewhere.M.parent.visible){
                            mousewhere.F( mouseFeature.returnObj(e, MOUSE) );
                            // if (MOUSE.o.callback) MOUSE.o.callback(MOUSE);
                            // console.log("PASS", events[eventName][i].M.o.label, events[eventName][i].M);
                        } // else console.log(`FAIL - ${mousewhere.M.parent.o.label}`, events[eventName][i]);
                    }
                });            
        }
        let where = {M:this, F:mouseFunction};
        events[eventName].push( where );
        if (isDrag && (!("mousedown" in events) || events.mousedown == []))
            this.addEvent("mousedown", mouseFeature.onDown);
        if (eventName == "mousemove") mouseFeature.mousemove.push( {M:MOUSE, F:mouseFunction} );
        if (eventName == "mouseup") mouseFeature.mouseup.push( {M:MOUSE, F:mouseFunction} );
    }
}
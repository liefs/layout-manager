interface pageFeatureOptions {
    label?: string;
    dim?: number|string;
    resolve?: Function;
    buttons?: any[];
    tabClass?:string;
    tabSelectClass?: string;

    prevPage?: number;
    currentPage?: number;

    features?: Feature[];
    children?: Display[];

}
function P(...Arguments:any){
    let root = new pageFeature(...Arguments);
    return new Display(root.o.label, root);
}
class pageFeature extends Feature {
    static resolve(page:pageFeature, size:Coord):number {return page.o.currentPage;}
    static switchClass(array:any[], prev:string, current:string){
        if (array != undefined)
            for(let i=0; i < array.length; i++) {
                (<El_Feature>Display.feature(array[i], "El_Feature")).popClass(prev);
                (<El_Feature>Display.feature(array[i], "El_Feature")).class = current;
            }
    }    
    debugLabel = "(page) P";
    o: pageFeatureOptions;
    Arguments:argumentsOptions = {
        argsMap: {
            string: "label",
            function: "resolve",
            number: "currentPage",
            array: "buttons",
        },
        defaults: {  label: undefined, dim: undefined, prevPage: -1, children: [], features: [],
            currentPage: 0, buttons: [], resolve: pageFeature.resolve},
        options: {typeCheck: itemFeature.typeCheck}
    }

    constructor(...Arguments: any) {
        super(...Arguments);
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);
        console.log("THIS", this);

        if (this.o.label == undefined) {this.o.label = `page_${pageFeature.namingIndex++}`};
        console.log("buttons", this.o.buttons);
        if (this.o.buttons != undefined) this.applyButtons();

        P[this.o.label] = F[this.o.label] = this;
    }
    init(THIS_Display: Display):void {
        let DISPLAY:Display = this.parent, PAGE = this;
        DISPLAY.addSetters('currentPage',{
            get: function() { return PAGE.o.currentPage; },
            set: function(value:number) {            
                if (value != PAGE.o.currentPage) {
                    PAGE.o.currentPage = value;
                    PAGE.update();
                }
            }
        });
        DISPLAY.addSetters("dim", {
            get: function() { return PAGE.o.dim; },
            set: function(value:number|string) {
                let old = PAGE.o.dim;
                PAGE.o.dim = itemFeature.dimToString(value);
                if (value != old) PAGE.parent.o.parent.update();
            }
        });        
        this.setStates();
    }
    update():void {
        let DISPLAY:Display = this.parent, PAGE:pageFeature = this;
        let retPage = PAGE.o.resolve(PAGE, DISPLAY.o.size);
        if (retPage != PAGE.o.prevPage) {
            if (PAGE.o.prevPage >= 0) {
                DISPLAY.o.children[PAGE.o.prevPage].visible = false;
                if ("buttons" in PAGE.o)
                    pageFeature.switchClass(PAGE.o.buttons[PAGE.o.prevPage], PAGE.o.tabSelectClass, PAGE.o.tabClass);
            }
            console.log("retPage", retPage, DISPLAY);
            DISPLAY.o.children[retPage].visible = true;
            if ("buttons" in PAGE.o)
                pageFeature.switchClass(PAGE.o.buttons[retPage], PAGE.o.tabClass, PAGE.o.tabSelectClass);
            this.o.prevPage = retPage;
        }
        DISPLAY.o.children[retPage]["dim"] = DISPLAY.o["dim"];
        DISPLAY.o.children[retPage].o.size.copy( DISPLAY.o.size );
    }
    set visible(value:boolean) {
        if (value == true) this.setStates();
    }
    get visible() {
        return this.parent.o.visible;
    }
    setStates(){
        for(let i=0; i < this.parent.o.children.length; i++) 
            this.parent.o.children[i].visible = (i == this.o.currentPage);        
    }
    createButtons(dim:number, tabClass:string, tabSelectClass:string, direction = true){
        this.o.tabClass = tabClass; this.o.tabSelectClass = tabSelectClass;
        let buttons:Display[] = [], child:Display, button:Display, innerHTML:string, label:string;
        for(let i=0; this.o.children.length; i++){
            child = this.o.children[i];
            label = `${child.o.label}_tab${i}`;
            innerHTML = ("tab" in child.o) ? child.o["tab"] : label;
            button = I(`${dim}px`, label, innerHTML, (this.o.currentPage == i) ? tabSelectClass : tabClass);
            buttons.push( button );
        }
        this.o.buttons = buttons;
        this.applyButtons();
        return C(`${(direction)?"h":"v"}_${label}`, direction, ...buttons, I());
    }
    applyButtons(){
        let buttons:Display[], THIS = this;
        for(let i=0; i < this.o.buttons.length; i++) {
            buttons = (argsClass.TypeOf(this.o.buttons[i]) == "array") ?
                <Display[]>this.o.buttons[i] : [ (<Display>this.o.buttons[i]) ] ;
            for(let j=0; j < buttons.length; j++) {
                buttons[j].addFeatures( M(buttons[j].o.label,{
                    mousedown: function(retObj:mouseReturnObject){
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
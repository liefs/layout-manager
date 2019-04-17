interface rootFeatureOptions {
    label?: string;
    source?: Element;
    margin?: number;
    css?: string|Object_Any;

    features: [],
    children: [],
}
function H(...Arguments:any){
    let DISPLAY = new Display(new rootFeature(Arguments));
    Display.rootDisplays[DISPLAY.o.label] = DISPLAY;
    return DISPLAY;
}
class rootFeature extends Feature {
    static namingIndex = 0;
    static size = new Coord("Root");
    static handlerNumber: number;    
    static depth(display:Display, count:number = 0) {return (display.o.parent != undefined) ? rootFeature.depth(display.o.parent, count+1 ) : count;}
    static resizeEvent(ev: UIEvent = undefined){
        let ss = rootFeature.screenSize();
        let display:Display;
        let feature:any;
        rootFeature.handlerNumber = 0;
        for(let key in Display.rootDisplays) {
            display = Display.rootDisplays[key];
            feature = display.o.features[0];
            Display.rootDisplays[key].move(ss.width-2*feature.o.margin, ss.height-2*feature.o.margin, feature.o.margin, feature.o.margin);
            rootFeature.handlerNumber++;           
        }
    }
    static screenSize() {
        let w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0],
        width =  w.innerWidth ||  e.clientWidth || g.clientWidth,
        height =  w.innerHeight ||  e.clientHeight|| g.clientHeight;
        return {width, height};
    }
    Arguments:argumentsOptions = {
        argsMap: {  string: ["label", "css"],
                    number: "margin",
                    Element: "source"},
        defaults: {source: undefined, margin: 8, features:[], children:[]},
        options: {typeCheck: itemFeature.typeCheck}
    }
    debugLabel = "(Handler) H";
    o: rootFeatureOptions;
    constructor(...Arguments: any) {
        super(...Arguments);
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);

        document.getElementsByTagName('body')[0]["style"]["margin"] = "0px";
 
        this.displayObj = {label:this.o.label};
        if (!("label" in this.o)) {this.o.label = `root_${rootFeature.namingIndex++}`};
        if ("css" in this.o) {
            Object.assign(El_Feature.css, El_Feature.styleSheetObject(this.o.css));
            El_Feature.updateCss();
        }
        H[this.o.label] = F[this.o.label] = this;
    }
    init():void {
        window.onresize = rootFeature.resizeEvent;
        setTimeout(rootFeature.resizeEvent, 0);
    }
    update():void {
        Display.copySizeToChildren(this.parent);
    }
    // get visible(){return true} ////////////////////////////////////////////////////// come back to this!!!!
    // set visible(value){}
}
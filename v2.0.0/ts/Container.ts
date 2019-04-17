interface containerFeatureOptions {
    label?: string;
    margin?: number;
    direction?: boolean;
    dim?: number|string;

    features?: Feature[];
    children?: Display[];
}
function h(...Arguments:any){return new Display(new containerFeature(true, ...Arguments));}
function v(...Arguments:any){return new Display(new containerFeature(false, ...Arguments));}
function C(...Arguments:any){return new Display(new containerFeature(...Arguments));}
class containerFeature extends Feature {
    static marginDefault = 8;    
    debugLabel = "(container) C";
    o: containerFeatureOptions;
    Arguments:argumentsOptions = {
        argsMap: {
            string: "label",
            number: "margin",
            dim: "dim",        
            boolean: "direction",
        },
        defaults: {label: undefined, direction:true, margin: 8, dim: undefined, features:[], children:[]},
        options: {typeCheck: itemFeature.typeCheck}
    }
    constructor(...Arguments: any) {
        super(...Arguments);
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);

        if (this.o.label == undefined) {this.o.label = `container_${containerFeature.namingIndex++}`};

        this.displayObj = {label:this.o.label};
        C[this.o.label] = F[this.o.label] = this;
        if (this.o.direction) h[this.o.label] = this;
        else v[this.o.label] = this;
    }
    init():void {
        let DISPLAY = this.parent, CONTAINER=this;
        DISPLAY.addSetters("dim", {
            get: function() { return CONTAINER.o.dim; },
            set: function(value:number|string) {
                let old = CONTAINER.o.dim;
                CONTAINER.o.dim = itemFeature.dimToString(value);
                if (value != old) Display.update(CONTAINER.parent.o.parent);}
        });
    }
    update():void {
        let DISPLAY = this.parent;
        let child: Display, feature:Object_Any, found:boolean, type:string, dim:number;
        let fixed = 0, percent = 0, undef = 0, validChildren:Object_Any[] = [], children = DISPLAY.o.children;
    
        // Determine Valid Children
        for(let i=0; i< children.length; i++) {
            child = children[i];
            feature = undefined;
            found = false;
            for(let j=0; j < child.o.features.length && !found; j++) {
                feature = child.o.features[j];
                if ("dim" in feature.o){
                    found = true;
                    type = (feature.o.dim == undefined) ? "undefined" : (feature.o.dim.endsWith("%")) ? "percent" : "fixed";

                    if (type == "fixed") fixed += parseInt(feature.o.dim.slice(0, -2));
                    if (type == "percent") percent += parseInt(feature.o.dim.slice(0, -1));
                    if (type == "undefined") undef += 1;
                    validChildren.push( {child, feature, type} );
                }
            }
        }
        let total = ( this.o.direction ) ? DISPLAY.o.size.width : DISPLAY.o.size.height;

        // Calc and Apply
        let percentPixels = total - fixed - this.o.margin*(validChildren.length-1);
        let undefPercent = (undef > 0) ? (100-percent) / undef : 100-percent ;
        let runningTotal = 0;
        let x:number, y:number, width:number, height:number;
        // let debugArray = [];
        for(let i=0; i < validChildren.length ; i++) {
            child = validChildren[i].child;
            type = validChildren[i].type;
            feature = validChildren[i].feature;
            dim =   (type == "fixed") ? parseInt( feature.o.dim.slice(0,-2) ) :
                    (type == "percent") ? Math.round(  (parseInt( feature.o.dim.slice(0, -1) )/100.0)*percentPixels  ) :
                    Math.round(  (undefPercent/100.0)*percentPixels );
            x = (this.o.direction) ? DISPLAY.o.size.x + runningTotal : DISPLAY.o.size.x;
            y = (this.o.direction) ? DISPLAY.o.size.y : DISPLAY.o.size.y + runningTotal;
            width = (this.o.direction) ? dim : DISPLAY.o.size.width;
            height = (this.o.direction) ? DISPLAY.o.size.height : dim;
            runningTotal += dim + this.o.margin;
            child.o.size.copy( width, height, x, y )
        }
    }
    get visible(){return this.parent.o.visible}
    set visible(value:boolean){
        for(let i=0; i < this.parent.o.children.length; i++) {
            this.parent.o.children[i].visible = value;
        }
    }
    get dim() {return this.o.dim};
    set dim(value:number|string) {
        let old = this.o.dim;
        if (argsClass.TypeOf(value) == "number") value = (<number>value).toString()+"px";
        this.o.dim = value;
        if (value != old && this.parent && this.parent.o.parent) Display.update(this.parent.o.parent);
    }                                    
}




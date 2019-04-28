interface itemFeatureOptions {
    label?: string;
    dim?: string|number;
    offset?: Coord;

    width?: number;
    height?: number;
    x?: number;
    y?: number;

    children?: Display[];
    features?: Feature[];
}
function I(...Arguments:any){
    let root = new itemFeature(...Arguments);
    return new Display(root);
}
class itemFeature extends Feature {
    static typeCheck(Argument:any, type:string = undefined){
        if (type == undefined) type = argsClass.TypeOf(Argument);
        let T = itemFeature;
        return T.detectChildren(Argument, T.detectFeature(Argument, T.detectDim(Argument, type)));
    }
    static detectDim(Argument:any, type:string = undefined) {
        if (type == undefined) type = argsClass.TypeOf(Argument);
        return (type == "string" && ((<string>Argument).endsWith("px") || (<string>Argument).endsWith("%"))) ? "dim" : type;
    }
    static detectFeature(Argument:any, type:string = undefined){
        if (type == undefined) type = argsClass.TypeOf(Argument);
        let TYPE:string = typeof(Argument);
        return (TYPE == "object"
        && "__proto__" in Argument && "__proto__" in Argument.__proto__
        && (Argument.__proto__.__proto__) && "constructor" in Argument.__proto__.__proto__
        && "name" in Argument.__proto__.__proto__.constructor
        && Argument.__proto__.__proto__.constructor.name == "Feature"
        )? "features" : type;
    }
    static detectChildren(Argument:any, type:string = undefined){
        if (type == undefined) type = argsClass.TypeOf(Argument);
        return (type == "Display") ? "children" : type;
    }
    static dimToString(value:string|number): string {return (argsClass.TypeOf(value) == "number") ? `${value}px` : <string>value;}
    static dimToNumber(value:string|number): number {
        let type = argsClass.TypeOf(value);
        if (type == "number") return <number>value;
        if (type !== "string") return 0;
        if ((<string>value).endsWith("px")) return parseInt( (<string>value).slice(0, -2) );
        return 0;
    }
    debugLabel = "(Item) I";
    o: itemFeatureOptions;
    displayObj:Object_Any;

    Arguments:argumentsOptions = {
        argsMap: {
            string: "label",
            dim: "dim",
        },
        defaults: {dim: undefined, label: undefined, features:[], children:[]},
        options: {typeCheck: itemFeature.typeCheck}
    }  
    constructor(...Arguments: any) {
        super(...Arguments);
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);
        let typeObj = this.argInstance.typeObj;

        if ("number" in typeObj) {
            let l = typeObj.number.length, no = typeObj.number;
            if (l == 1) this.o.dim = no[0];
            else {
                this.o.width = no[0];
                if (l > 1) {
                    this.o.height = no[1];
                    let ss = rootFeature.screenSize();
                    this.o.x = (l > 2) ? no[2] : (ss.width - this.o.width)/2;
                    this.o.y = (l > 3) ? no[3] : (ss.height - this.o.height)/2;
                }
            }
        }

        this.o.dim = itemFeature.dimToString(this.o.dim);
        if (this.o.label == undefined) {this.o.label = `item_${itemFeature.namingIndex++}`};

        if ("Element" in typeObj ||
            ("string" in typeObj && typeObj.string.length > 1) ||
            "innerHTML" in this.o ||
            El_Feature.uniqueEL(this.o.label))
                this.o.features.push( E(...Arguments) );
        
        this.displayObj = {label:this.o.label}
        if (this.o.width) this.displayObj.width = this.o.width;
        if (this.o.height) this.displayObj.height = this.o.height;
        if (this.o.x) this.displayObj.x = this.o.x;
        if (this.o.y) this.displayObj.y = this.o.y;
        
        I[this.o.label] = F[this.o.label] = this;
    }
    init():void {
        let DISPLAY = this.parent, ITEM = this;
        DISPLAY.addSetters("dim", {
            get: function() { return ITEM.o.dim; },
            set: function(value:number|string) {
                let old = ITEM.o.dim;
                ITEM.o.dim = itemFeature.dimToString(value);
                if (value != old && ITEM.parent.o.parent != undefined) ITEM.parent.o.parent.update();
            }
        });
        if (this.o.height) DISPLAY.move(this.o.width, this.o.height, this.o.x, this.o.y);
    }
    update():void {for(let i=0; i < this.parent.o.children.length; i++) this.parent.o.children[i].update();}
    // get visible(){}
    // get visible(){}
}
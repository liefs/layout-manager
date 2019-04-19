interface dragbarFeatureOptions {
    label?: string;
    min?: number;
    max?: number;
    width?: number;
    front?: boolean;
}
function d(...Arguments:any){
    let root = new dragbarFeature(Arguments);
    return new Display(`${root.o.label}_Dragbar`, root);;
}

class dragbarFeature extends Feature {
    static minWidth = 6;
    static defaults:dragbarFeatureOptions = {label: undefined, front: true};
    static argsMap = {
        string: "label",
        number: ["min", "max", "width"],
        boolean: "front",
        children: "children",
        features: "features"
    }
    static featureWithDimInFeatures(features:Feature[]){
        for (let i=0; i< features.length; i++)
            if ("dim" in features[i].o) return features[i];
        return undefined;
    }
    static getDirection(THIS:dragbarFeature){
        return (<containerFeature>dragbarFeature.featureWithDimInFeatures( THIS.parent.o.parent.o.parent.o.features )).o.direction;
    }
    static getParentFeature(THIS:dragbarFeature): Feature {
        let features = THIS.parent.o.parent.o.features;
        return dragbarFeature.featureWithDimInFeatures(features);
    }
    static THIS:dragbarFeature;
    static parent: Feature;
    static direction: boolean;
    static start:number;

    static dragdown(e:MouseEvent, MOUSE:mouseFeature) {
        e.preventDefault();
        let THIS = dragbarFeature.THIS = Display.feature(MOUSE.parent, "dragbarFeature");
        dragbarFeature.parent = dragbarFeature.getParentFeature(THIS);
        dragbarFeature.direction = dragbarFeature.getDirection(THIS);
        dragbarFeature.start = parseInt((<string>dragbarFeature.parent.o.dim).slice(0,-2));
    }
    static dragmove(e:MouseEvent, MOUSE:mouseFeature, obj:Object_Any) {
        e.preventDefault();
        let THIS = dragbarFeature.THIS;
        let delta = ((dragbarFeature.direction) ? obj.x : obj.y) * ((THIS.o.front)? -1 : 1);
        let newDim = dragbarFeature.start + delta;        
        if (newDim < THIS.o.min) newDim = THIS.o.min;
        if (newDim > THIS.o.max) newDim = THIS.o.max;
        THIS.parent.o.parent["dim"] = `${newDim}px`;
    }
    static dragup(e:MouseEvent, MOUSE:mouseFeature, obj:Object_Any) {
        e.preventDefault();
        dragbarFeature.dragmove(e, MOUSE, obj);
    }        
    static exists(obj:Object, str:string){
        let strArray = str.split(".");
        let key:string;
        for(let i=0; i< strArray.length; i++){
            key = strArray[i];
            if (!(key in obj) || obj[key] == undefined)
                return undefined;
            obj = obj[key];
        }
        return obj;
    }
    debugLabel = "(Dragbar) d";
    o: dragbarFeatureOptions;

    init(THIS_Display: Display):void {
        let THIS = this;
        let feature:any;
        Display.when( `${THIS.o.label}_Dragbar_Waiting_for_container`, function(){
            if("parent" in THIS_Display.o  && "parent" in THIS_Display.o.parent.o){
                let children = THIS_Display.o.parent.o.parent.o.children;
                THIS.o.front = (THIS_Display.o.parent == children[ children.length-1 ]) ? true : false;
                let newKey = THIS_Display.o.parent.o.label+"_dragbar";
                let oldKey = THIS_Display.o.label;

                d[newKey] = d[oldKey];
                F[newKey] = F[oldKey];

                THIS_Display.o.label = newKey;
                for (let i=0; i < THIS_Display.o.features.length; i++){
                    feature = THIS_Display.o.features[i];
                    feature.o.label = THIS_Display.o.label;
                    if ("el" in feature.o && feature.o.el != undefined)
                        feature.o.el.id = THIS_Display.o.label;
                }
                if (THIS.o.width == undefined) {
                    let pwidth = THIS_Display.o.parent.o.parent.o.features[0].o.margin;
                    THIS.o.width =  (pwidth < dragbarFeature.minWidth) ? dragbarFeature.minWidth : pwidth;
                }
                return true;
            }
            return false;
        });
        THIS_Display.o.size.o.offset = new Coord();
    }
    onChange(THIS_Display: Display):void {
        let parentFeature = THIS_Display.o.parent.o.parent.o.features[0];
        let direction = parentFeature.o.direction;
        let margin = parentFeature.o.margin;
        let size = THIS_Display.o.size;
        let offset = size.o.offset;

        let width = (direction) ? this.o.width : size.o.width;
        let height = (direction) ? size.o.height : this.o.width;
        let x = (direction) ? size.o.x - (margin + this.o.width)/2 + ((this.o.front) ? 0 : size.o.width + this.o.width): size.o.x;
        let y = (direction) ? size.o.y : size.o.y - (margin + this.o.width)/2 + ((this.o.front) ? 0 : size.o.height + this.o.width)

        offset.copy(width - size.o.width, height - size.o.height, x - size.o.x , y - size.o.y);
    }
    constructor(...Arguments: any) {
        super(Arguments, dragbarFeature.argsMap, dragbarFeature.defaults);
        if (Object.keys(d).length == 0) { // on first call...
            rootFeature.addClass(".hDragbar", <Object_Any>rootFeature.stringToObject("cursor:ew-resize"));
            rootFeature.addClass(".vDragbar", <Object_Any>rootFeature.stringToObject("cursor:ns-resize"));
        }
        if (this.o.label == undefined) {this.o.label = `dragbar_${dragbarFeature.namingIndex++}`};
        if (!("features" in this.argsObj)) this.argsObj.features = [];
        let el = E(  (<any[]>Arguments[0]).concat({innerHTML: ""})  );

        this.argsObj.features.push( el, M(this.o.label,{dragdown:dragbarFeature.dragdown,
                                                        dragmove:dragbarFeature.dragmove,
                                                        dragup:dragbarFeature.dragup}));
        let THIS = this;
        Display.when(`${this.o.label}_Dragbar_Class_Assign_Waiting_for_parent_Container`, function(THIS_Display:Display){
            let exists = dragbarFeature.exists( THIS,"parent.o.parent.o.parent.o.features");
            if (exists != undefined) {
                el.o.el.className = el.class = ( dragbarFeature.getDirection(THIS) ) ? "hDragbar" : "vDragbar";
                return true;
            }
            return false;
        });
        d[this.o.label] = F[this.o.label] = this;
    }
}



// Object.defineProperty(
//     Object.prototype, 
//     'renameProperty',
//     {
//         writable : false, // Cannot alter this property
//         enumerable : false, // Will not show up in a for-in loop.
//         configurable : false, // Cannot be deleted via the delete operator
//         value : function (oldName, newName) {
//             // Do nothing if the names are the same
//             if (oldName == newName) {
//                 return this;
//             }
//             // Check for the old property name to 
//             // avoid a ReferenceError in strict mode.
//             if (this.hasOwnProperty(oldName)) {
//                 this[newName] = this[oldName];
//                 delete this[oldName];
//             }
//             return this;
//         }
//     }
// );
interface dropFunction {
    (SOURCE:dragFeature, DEST:dragFeature): void;
}
interface dragFunction {
    (SOURCE:dragFeature): void;
}
interface onDropFunctions {
    onHover?: dropFunction|dropFunction[];
    onLeave?: dropFunction|dropFunction[];
    onDrop: dropFunction|dropFunction[];
}
interface onDragFunctions {
    onDragStart?: dragFunction;
    onDragFail?: dragFunction;
    onDragSuccess?: dragFunction;
}
interface dropObj{
    drag?: onDragFunctions;
    drop?: {[prop:string]: onDropFunctions};
}
interface dragFeatureOptions {
    label?: string;

    type: string;
    dropobj: dropObj;
    dragable: boolean;
    dropable: boolean;

    dragFuns: Function[];
    dropFuns: Function[];

    children?: Display[];
    features?: Feature[];
}
function drag(...Arguments:any){
    return new dragFeature(...Arguments);
}
class dragFeature extends Feature {
    debugLabel = "(Drag) drag";
    o: dragFeatureOptions;

    static typeObj:dropObj = {
        "drag": {
            onDragStart: function(SOURCE:dragFeature) {},
            onDragFail: function(SOURCE:dragFeature) {},
            onDragSuccess: function(SOURCE:dragFeature) {},
        },
        "drop": {
            "item" : {
                onHover:function(SOURCE:dragFeature, DEST:dragFeature) {},
                onLeave:function(SOURCE:dragFeature, DEST:dragFeature) {},
                onDrop:function(SOURCE:dragFeature, DEST:dragFeature) {}
            },
            "container" : {
                onHover:function(SOURCE:dragFeature, DEST:dragFeature) {},
                onLeave:function(SOURCE:dragFeature, DEST:dragFeature) {},
                onDrop:function(SOURCE:dragFeature, DEST:dragFeature) {}
            }
        }
        
    }

    Arguments:argumentsOptions = {
        argsMap: {
            string: "label"
        },
        defaults: {label: undefined},
        options: {typeCheck: itemFeature.typeCheck}
    }  
    constructor(...Arguments: any) {
        super(...Arguments);
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);
        let typeObj = this.argInstance.typeObj;

        if (this.o.label == undefined) {this.o.label = `drag_${dragbarFeature.namingIndex++}`};
        
        drag[this.o.label] = F[this.o.label] = this;
    }
    init():void {
        let DISPLAY = this.parent, THIS = this;

   }
    update():void {
   }
}
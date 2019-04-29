interface dragbarFeatureOptions {
    label?: string;

    min: number;
    max: number;
    dimmax: string;
    dimmin: string;
    start: number;
    direction: boolean;
    isLast: boolean;

    children?: Display[];
    features?: Feature[];
}
function db(...Arguments:any){
    return new dragbarFeature(...Arguments);
}
class dragbarFeature extends Feature {
    debugLabel = "(DragBar) db";
    o: dragbarFeatureOptions;
    displayObj:Object_Any;

    Arguments:argumentsOptions = {
        argsMap: {
            string: "label",
            number: ["min", "max"],
            dim: ["dimmax", "dimmin"]
        },
        defaults: {dim: undefined, label: undefined, features:[], children:[], direction: true},
        options: {typeCheck: itemFeature.typeCheck}
    }  
    constructor(...Arguments: any) {
        super(...Arguments);
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);
        let typeObj = this.argInstance.typeObj;

        if (this.o.dimmax) this.o.max = itemFeature.dimToNumber(this.o.dimmax);
        if (this.o.dimmin) this.o.min = itemFeature.dimToNumber(this.o.dimmax);

        if (this.o.label == undefined) {this.o.label = `dragbar_${dragbarFeature.namingIndex++}`};
        
        db[this.o.label] = F[this.o.label] = this;
    }
    init():void {
        let DISPLAY = this.parent, THIS = this;
        this.o.start = itemFeature.dimToNumber( DISPLAY["dim"] );
        setTimeout(function(){ 
            let container = <containerFeature>Display.feature( DISPLAY.o.parent, "containerFeature" );
            THIS.o.direction = container.o.direction;
            THIS.o.isLast = (container.o.children.indexOf(DISPLAY) == container.o.children.length-1);
         }, 0);
        
        DISPLAY.addFeatures(
            S(
                [{
                    MAPCHILD: function(sourceCoord:Coord, destCoord:Coord, DISPLAY:Display, pixels:number = spawnFeature.pixels){
                        let container = DISPLAY.o.parent.o.parent.feature("containerFeature");
                        let DRAG = DISPLAY.o.parent.feature("dragbarFeature");
                        let margin = container.o.margin;
                        if (container.o.direction)
                            destCoord.copy(pixels, sourceCoord.height - 2*pixels,
                                (sourceCoord.x-pixels/2) + ((DRAG.o.isLast) ? -margin/2 : sourceCoord.width + margin/2) , sourceCoord.y + pixels);
                        else
                            destCoord.copy(sourceCoord.width - 2*pixels, pixels,
                                sourceCoord.x + pixels, (sourceCoord.y-pixels/2) + ((DRAG.o.isLast) ? -margin/2 : sourceCoord.height + margin/2));
                    },
                    MAKEDISPLAY: function(label:string, DISPLAY:Display){
                        let direction = DISPLAY.o.parent.feature("containerFeature").o.direction;
                        return new Display(label, E(label+"_db", "", (direction) ? "ew": "ns"),
                                    M({ label:label+"_db",
                                        dragdown:function(mObj:mouseReturnObject){
                                            let itemDisplay = mObj.display.o.parent.o.parent;
                                            let itemFeat = <itemFeature>itemDisplay.feature("itemFeature");
                                            let dbFeat = <dragbarFeature>itemDisplay.feature("dragbarFeature");
                                            dbFeat.o.start = itemFeature.dimToNumber( itemFeat.o.dim );

                                            spawnFeature.dragtype = "db";
                                            spawnFeature.dragDown(mObj);
                                        },
                                        dragmove:function(mObj:mouseReturnObject){
                                            let itemDisplay = mObj.display.o.parent.o.parent;
                                            let itemFeat = <itemFeature>itemDisplay.feature("itemFeature");
                                            let dbFeat = <dragbarFeature>itemDisplay.feature("dragbarFeature");
                                            let check = dbFeat.o.start + ((dbFeat.o.direction) ? mObj.deltaX : mObj.deltaY)*((dbFeat.o.isLast)?-1:1);
                                            if (check < dbFeat.o.min) check = dbFeat.o.min;
                                            if (check > dbFeat.o.max) check = dbFeat.o.max;
                                            itemFeat.o.dim = itemFeature.dimToString(check);
                                            itemDisplay.o.parent.update();
                                        },
                                        dragup:function(mObj:mouseReturnObject){} })
                        )
                    },
                    ONDRAG: function(sourceCoord: Coord, mObj:mouseReturnObject){
                    }
                }]
            )
        );

   }
    update():void {
   }
}
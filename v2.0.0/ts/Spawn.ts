interface spawnFeatureOptions {
    label?: string;
    display?: Display;
    maps?:any[]; // of functions or strings
    pixels?: number;

    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;

    children?: Display[];
    features?: Feature[];    
}
interface spanMapObj {
    MAPCHILD?: Function;
    MAKEDISPLAY: Function;
    ONDRAG: Function;
}
interface spanMapObjObj {
    [propName: string] : spanMapObj
}
function S(...Arguments:any){
    return new spawnFeature(...Arguments);
}
class spawnFeature extends Feature {
    static pixels = 6;
    static dragtype = "";
    static dragDisplay: Display;
    static startCoord = new Coord();
    static dragDown(mrObj:mouseReturnObject){
        let DISPLAY = mrObj.display;
        let msDISPLAY = DISPLAY.o.parent;
        let sourceDisplay = msDISPLAY.o.parent
        spawnFeature.startCoord.copy( sourceDisplay.o.size );
    }
    static dragUp(e:mouseReturnObject){
        // console.log("Up", e);
        spawnFeature.dragtype = "";
    }
    static dragMove(mObj:mouseReturnObject){
        mObj.event.preventDefault();
        let DISPLAY = mObj.display, msDISPLAY = DISPLAY.o.parent, sourceDisplay = msDISPLAY.o.parent;
        spawnFeature.maps[spawnFeature.dragtype].ONDRAG(sourceDisplay.o.size, mObj);
    }
    static maps:spanMapObjObj = {
        w:{
            MAPCHILD: function(souceCoord:Coord, destCoord:Coord, pixels:number = spawnFeature.pixels){
                destCoord.copy(pixels, souceCoord.height - 2*pixels, (souceCoord.x-pixels/2), souceCoord.y + pixels)
            },
            MAKEDISPLAY: function(label:string){
                return new Display(label, E(label+"_w", "", "ew"),
                            M({ label:label+"_w",
                                dragdown:function(mObj:mouseReturnObject){
                                    spawnFeature.dragtype = "w";
                                    spawnFeature.dragDown(mObj);
                                },
                                dragmove:spawnFeature.dragMove,
                                dragup:spawnFeature.dragUp })
                )
            },
            ONDRAG: function(sourceCoord: Coord, mObj:mouseReturnObject){
                let spawn = <spawnFeature>Display.feature(mObj.display.o.parent.o.parent, "spawnFeature");
                let dx = mObj.deltaX, {width, height, x, y} = spawnFeature.startCoord;
                if (spawnFeature.validate(spawn, width - dx, height, x + dx, y))
                    sourceCoord.copy(width - dx, height, x + dx, y);
            }
        },
        e:{
            MAPCHILD: function(souceCoord:Coord, destCoord:Coord, pixels:number = spawnFeature.pixels){
                destCoord.copy(pixels, souceCoord.height - 2*pixels, (souceCoord.x-pixels/2+souceCoord.width), souceCoord.y + pixels)
            },
            MAKEDISPLAY: function(label:string){
                return new Display(label, E(label+"_e", "", "ew"),
                            M({ label:label+"_e",
                                dragdown:function(mObj:mouseReturnObject){
                                    spawnFeature.dragtype = "e";
                                    spawnFeature.dragDown(mObj);
                                },
                                dragmove:spawnFeature.dragMove,
                                dragup:spawnFeature.dragUp })
                )
            },
            ONDRAG: function(sourceCoord: Coord, mObj:mouseReturnObject){
                let spawn = <spawnFeature>Display.feature(mObj.display.o.parent.o.parent, "spawnFeature");
                let dx = mObj.deltaX, {width, height, x, y} = spawnFeature.startCoord;
                if (spawnFeature.validate(spawn, width + dx, height, x, y))
                    sourceCoord.copy(width + dx, height, x, y);
            }
        },
        n:{
            MAPCHILD: function(sourceCoord:Coord, destCoord:Coord, pixels:number = spawnFeature.pixels){
                destCoord.copy(sourceCoord.width - 2*pixels, pixels, sourceCoord.x+pixels, sourceCoord.y - pixels/2)
            },
            MAKEDISPLAY: function(label:string){
                return new Display(label, E(label+"_n", "", "ns"),
                            M({ label:label+"_n",
                                dragdown:function(mObj:mouseReturnObject){
                                    spawnFeature.dragtype = "n";
                                    spawnFeature.dragDown(mObj);
                                },
                                dragmove:spawnFeature.dragMove,
                                dragup:spawnFeature.dragUp })
                )
            },
            ONDRAG: function(sourceCoord: Coord, mObj:mouseReturnObject){
                let spawn = <spawnFeature>Display.feature(mObj.display.o.parent.o.parent, "spawnFeature");
                let dy = mObj.deltaY, {width, height, x, y} = spawnFeature.startCoord;
                if (spawnFeature.validate(spawn, width, height - dy, x, y + dy))
                    sourceCoord.copy(width, height - dy, x, y + dy);
            }
        },
        s:{
            MAPCHILD: function(sourceCoord:Coord, destCoord:Coord, pixels:number = spawnFeature.pixels){
                destCoord.copy(sourceCoord.width - 2*pixels, pixels, sourceCoord.x+pixels, sourceCoord.y - pixels/2 + sourceCoord.height)
            },
            MAKEDISPLAY: function(label:string){
                return new Display(label, E(label+"_s", "", "ns"),
                            M({ label:label+"_s",
                                dragdown:function(mObj:mouseReturnObject){
                                    spawnFeature.dragtype = "s";
                                    spawnFeature.dragDown(mObj);
                                },
                                dragmove:spawnFeature.dragMove,
                                dragup:spawnFeature.dragUp })
                )
            },
            ONDRAG: function(sourceCoord: Coord, mObj:mouseReturnObject){
                let spawn = <spawnFeature>Display.feature(mObj.display.o.parent.o.parent, "spawnFeature");
                let dy = mObj.deltaY, {width, height, x, y} = spawnFeature.startCoord;
                if (spawnFeature.validate(spawn, width, height + dy, x, y))
                    sourceCoord.copy(width, height + dy, x, y);
            }
        },
        nw:{
            MAPCHILD: function(source:Coord, destCoord:Coord, pixels:number = spawnFeature.pixels){
                destCoord.copy(2*pixels, 2*pixels, source.x - pixels/2, source.y-pixels/2)
            },
            MAKEDISPLAY: function(label:string){
                return new Display(label, E(label+"_nw", "", "nw"),
                            M({ label:label+"_nw",
                                dragdown:function(mObj:mouseReturnObject){
                                    spawnFeature.dragtype = "nw";
                                    spawnFeature.dragDown(mObj);
                                },
                                dragmove:spawnFeature.dragMove,
                                dragup:spawnFeature.dragUp })
                )
            },
            ONDRAG: function(sourceCoord: Coord, mObj:mouseReturnObject){
                let spawn = <spawnFeature>Display.feature(mObj.display.o.parent.o.parent, "spawnFeature");
                let dx = mObj.deltaX, dy = mObj.deltaY, {width, height, x, y} = spawnFeature.startCoord;
                if (spawnFeature.validate(spawn, width - dx, height - dy, x + dx, y + dy))
                    sourceCoord.copy(width - dx, height - dy, x + dx, y + dy);
            }
        },
        sw:{
            MAPCHILD: function(source:Coord, destCoord:Coord, pixels:number = spawnFeature.pixels){
                destCoord.copy(2*pixels, 2*pixels, source.x - pixels/2, source.y-pixels*1.5 + source.height)
            },
            MAKEDISPLAY: function(label:string){
                return new Display(label, E(label+"_sw", "", "sw"),
                            M({ label:label+"_sw",
                                dragdown:function(mObj:mouseReturnObject){
                                    spawnFeature.dragtype = "sw";
                                    spawnFeature.dragDown(mObj);
                                },
                                dragmove:spawnFeature.dragMove,
                                dragup:spawnFeature.dragUp })
                )
            },
            ONDRAG: function(sourceCoord: Coord, mObj:mouseReturnObject){
                let spawn = <spawnFeature>Display.feature(mObj.display.o.parent.o.parent, "spawnFeature");
                let dx = mObj.deltaX, dy = mObj.deltaY, {width, height, x, y} = spawnFeature.startCoord;
                if (spawnFeature.validate(spawn, width - dx, height + dy, x + dx, y))
                    sourceCoord.copy(width - dx, height + dy, x + dx, y);
            }
        },
        ne:{
            MAPCHILD: function(source:Coord, destCoord:Coord, pixels:number = spawnFeature.pixels){
                destCoord.copy(2*pixels, 2*pixels, source.x + source.width - pixels*1.5, source.y-pixels*.5)
            },
            MAKEDISPLAY: function(label:string){
                return new Display(label, E(label+"_ne", "", "sw"),
                            M({ label:label+"_ne",
                                dragdown:function(mObj:mouseReturnObject){
                                    spawnFeature.dragtype = "ne";
                                    spawnFeature.dragDown(mObj);
                                },
                                dragmove:spawnFeature.dragMove,
                                dragup:spawnFeature.dragUp })
                )
            },
            ONDRAG: function(sourceCoord: Coord, mObj:mouseReturnObject){
                let spawn = <spawnFeature>Display.feature(mObj.display.o.parent.o.parent, "spawnFeature");
                let dx = mObj.deltaX, dy = mObj.deltaY, {width, height, x, y} = spawnFeature.startCoord;
                if (spawnFeature.validate(spawn, width + dx, height - dy, x, y + dy))
                    sourceCoord.copy(width + dx, height - dy, x, y + dy);
            }
        },
        se:{
            MAPCHILD: function(source:Coord, destCoord:Coord, pixels:number = spawnFeature.pixels){
                destCoord.copy(2*pixels, 2*pixels, source.x + source.width - pixels*1.5, source.y-pixels*1.5 + source.height)
            },
            MAKEDISPLAY: function(label:string){
                return new Display(label, E(label+"_se", "", "nw"),
                            M({ label:label+"_se",
                                dragdown:function(mObj:mouseReturnObject){
                                    spawnFeature.dragtype = "se";
                                    spawnFeature.dragDown(mObj);
                                },
                                dragmove:spawnFeature.dragMove,
                                dragup:spawnFeature.dragUp })
                )
            },
            ONDRAG: function(sourceCoord: Coord, mObj:mouseReturnObject){
                let spawn = <spawnFeature>Display.feature(mObj.display.o.parent.o.parent, "spawnFeature");
                let dx = mObj.deltaX, dy = mObj.deltaY, {width, height, x, y} = spawnFeature.startCoord;
                // let spawn = mObj.display
                if (spawnFeature.validate(spawn, width + dx, height + dy, x, y))
                    sourceCoord.copy(width + dx, height + dy, x, y);
            }
        }
    }
    static validate(spawn:spawnFeature, width: number, height:number, x:number, y:number){
        let {width:ssw, height:ssh} = rootFeature.screenSize();
        if (x < 0  || x + width > ssw ||
            y < 0 || y + height > ssh ||
            width < spawn.o.minWidth ||
            height < spawn.o.minHeight ||
            ( (spawn.o.maxWidth !== undefined) ? width > spawn.o.maxWidth : false)
            )
            return false;
        return true;
    }
    
    Arguments:argumentsOptions = {
        argsMap: {
            string: "label",
            array: "maps",
            number: ["minWidth", "minHeight", "maxWidth", "maxHeight"]
        },
        defaults: {label: undefined, children:[], features:[], minHeight: 150, minWidth: 150},
        options: {typeCheck: itemFeature.typeCheck}
    }
    debugLabel = "(Spawn) S";
    o: spawnFeatureOptions;

    constructor(...Arguments: any) {
        super(...Arguments);
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);

        if (Object.keys(S).length == 0) { // on first call...
            El_Feature.addClass(".ew", "cursor: ew-resize");
            El_Feature.addClass(".ns", "cursor: ns-resize");
            El_Feature.addClass(".nw", "cursor: nw-resize");
            El_Feature.addClass(".sw", "cursor: sw-resize");
        }

        // if ("array" in this.argInstance.typeObj) this.o.maps = this.argInstance.typeObj.array[0];

        if (this.o.label == undefined) {this.o.label = `spawn_${spawnFeature.namingIndex++}`};
        S[this.o.label] = F[this.o.label] = this;
    }

    set visible(value:boolean){
        // console.log(value);
        let children = this.o.display.o.children;
        for(let i=0; i < children.length; i++)
            children[i].visible = value;
    }
    init():void {
        let mapObj:spanMapObj|string;
        let label:string = this.o.label;
        let child:Display;
        this.o.display = new Display(this.o.label);
        this.o.display.o.parent = this.parent;
        this.parent.o.children.push( this.o.display );
        if ("maps" in this.o)
            for(let i=0; i < this.o.maps.length; i++) {
                //retObj = this.o.maps[i]
                mapObj = this.o.maps[i];
                if (argsClass.TypeOf(mapObj) == "string") {
                    label = `${this.o.label}_${ (<string>mapObj) }`;
                    mapObj = this.o.maps[i] = spawnFeature.maps[ (<string>mapObj) ];
                }
                // let FUNCTION = (<spanMapObj>mapObj).FUNCTION;
                let displayFromFunction = (<spanMapObj>mapObj).MAKEDISPLAY;

                // new ITEM
                child = displayFromFunction(label);
                child.o.parent = this.o.display;
                this.o.display.o.children.push( child );
            }
    }
    update():void {
        let mapObj:spanMapObj;
        this.o.display.o.size.copy( this.parent.o.size );
        for(let i=0; i< this.o.maps.length; i++) {
            mapObj = this.o.maps[i];
            if ("MAPCHILD" in mapObj)
                mapObj.MAPCHILD( this.o.display.o.size, this.o.display.o.children[i].o.size);
        }
    }

}
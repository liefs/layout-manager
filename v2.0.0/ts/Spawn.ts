interface spawnFeatureOptions {
    label?: string;
    display?: Display;
    maps?:any[]; // of functions or strings
    pixels?: number;

    children?: Display[];
    features?: Feature[];    
}
interface spanMapObj {
    FUNCTION?: Function;
    DISPLAY: Function;
}
function S(...Arguments:any){
    return new spawnFeature(...Arguments);
}
class spawnFeature extends Feature {
    static pixels = 6;
    static maps = {
        w:{ FUNCTION: function(a:Coord, pixels = spawnFeature.pixels){
                        return new Coord(pixels,
                                        a.height - 2*pixels,
                                        (a.x-pixels/2),
                                        a.y + pixels)},
            DISPLAY: function(label:string){
                let dragdown = function(){};
                let dragmove = function(){};
                let dragup = function(){};
                return new Display(label, E(label, "", "ew"),
                            M({ label, dragdown, dragmove, dragup })
                )
            }
        },
    }
    
    Arguments:argumentsOptions = {
        argsMap: {
            string: "label"
        },
        defaults: {label: undefined, children:[], features:[]},
        options: {typeCheck: itemFeature.typeCheck}
    }
    debugLabel = "(Spawn) S";
    o: spawnFeatureOptions;

    constructor(...Arguments: any) {
        super(...Arguments);
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);

        if (this.o.label == undefined) {this.o.label = `spawn_${spawnFeature.namingIndex++}`};
        S[this.o.label] = F[this.o.label] = this;
    }

    set visible(value:boolean){
        console.log(value);
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
                let displayFromFunction = (<spanMapObj>mapObj).DISPLAY;

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
            if ("FUNCTION" in mapObj)
                this.o.display.o.children[i].o.size.copy( mapObj.FUNCTION( this.o.display.o.size  ) );
        }
    }

}
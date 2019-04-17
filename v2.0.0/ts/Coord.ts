interface CoordOptions {
    DISPLAY?: any;
    label?:string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    callBack?: Function;
    offset?: Coord;
}
class Coord {
    isPointIn(x:number, y:number){return  (this.o.x <= x) && (this.o.x + this.o.width >= x ) && (this.o.y <= y) && (this.o.y + this.o.height >= y );}
    static newOrupdate(test:any, width:number, height:number, x:number, y:number) {
        if (argsClass.TypeOf(test) == "Coord") {test.copy(width, height, x, y);return test;}
        return new Coord(width, height, x, y);
    }
    static namingIndex = 0;
    Arguments:argumentsOptions = {
        argsMap: {
            string: "label",
            number: ["width", "height", "x", "y"],
            function: "callBack",
            Coord: "offset",
            Display: "DISPLAY"
        },
        defaults: {x:0, y:0, width:0, height:0, DISPLAY:undefined, label: undefined},
    }        
    o: CoordOptions;
    argInstance: argsClass;
    constructor(...Arguments: any) {
        this.argInstance = new argsClass(this, Arguments);
        if (this.o.label == undefined) {this.o.label = `Coord_${Coord.namingIndex++}`};
    }
    cback(){if ("callBack" in this.o) this.o.callBack(this.o.DISPLAY);}
    set width(value:number) {let old = this.o.width;this.o.width = value;if (value != old) this.cback();}
    set height(value:number) {let old = this.o.height;this.o.height = value;if (value != old) this.cback();}
    set x(value:number) {let old = this.o.x;this.o.x = value;if (value != old) this.cback();}
    set y(value:number) {let old = this.o.y;this.o.y = value;if (value != old) this.cback();}

    get label() {return this.o.label};
    get width() {return this.o.width + ((this.o.offset) ? this.o.offset.o.width : 0)}
    get height() {return this.o.height + ((this.o.offset) ? this.o.offset.o.height : 0)}
    get x() {return this.o.x + ((this.o.offset) ? this.o.offset.o.x : 0)}
    get y() {return this.o.y + ((this.o.offset) ? this.o.offset.o.y : 0)}
    copy(width:number|Coord = this.o.width, height:number = this.o.height, x:number = this.o.x, y:number = this.o.y) {
        let isCoord = false; let ref: Coord;
        if ( argsClass.TypeOf(width) == "Coord" ) {
            isCoord = true; ref = <Coord>width;
        }
        this.width = (isCoord) ? ref.width : <number>width;
        this.height = (isCoord) ? ref.height : height;
        this.x = (isCoord) ? ref.x : x;
        this.y = (isCoord) ? ref.y : y;
    }
}

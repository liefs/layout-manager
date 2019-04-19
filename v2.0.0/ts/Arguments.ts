interface ArgOptions {
    mergeObj?: boolean;
    mergeArray?: boolean;
    typeCheck?: Function;
}
interface argumentsOptions {
    argsMap?: Object_Any;
    defaults?:Object_Any;
    options?: ArgOptions;
}
interface ArgMatchObject {
    string?: string|string[];
    function?: Function|Function[];
    number?: number|number[];
    boolean?: boolean|boolean[];
    object?: Object_Any;
    array?: any[];
    [property:string] :any;
}
class argsClass {
    sourceInstance: any;
    Arguments:any[];
    argsMap:Object_Any;
    defaults:Object_Any;
    options:ArgOptions = {mergeObj:true, mergeArray:true, typeCheck:undefined};
    returnObj: Object_Any = {};
    typeObj: Object_Any = {};

    constructor(sourceInstance:any, Arguments:any[]){
        // debugger;
        this.sourceInstance = sourceInstance;
        this.Arguments = Arguments.slice();
        this.argsMap = sourceInstance.Arguments.argsMap;
        this.defaults = sourceInstance.Arguments.defaults;
        Object.assign(this.options, sourceInstance.Arguments.options);
        Object.assign(this.returnObj, this.defaults);
        let Argument:any, type:string, valueArray:any[], value:any;
        for (let i = 0; i < this.Arguments.length; i++) {
            Argument = this.Arguments[i];
            type = argsClass.TypeOf(Argument);
            if (this.options.typeCheck) type = this.options.typeCheck(Argument, type);
            argsClass.vArray(this.typeObj , type).push(Argument);
            if (type == "object" && this.options.mergeObj) 
                Object.assign(this.returnObj, Argument);
            if (type == "array" && this.options.mergeArray)
                this.Arguments = this.Arguments.concat( Argument );
        }
        for (let mapType in this.argsMap) {
            valueArray = this.argsMap[mapType];
            if (argsClass.TypeOf(valueArray) != "array") valueArray = [ valueArray ];
            for (let i=0; i < valueArray.length; i++) 
                if (mapType in this.typeObj && i < this.typeObj[mapType].length) {
                    this.returnObj[ valueArray[i] ] = this.typeObj[mapType][i];
                }
        }
        this.sourceInstance["o"] = this.returnObj;
    }
    static TypeOf(value: any): string {
        let valueType: string = typeof value;
        if (valueType === "object")
        {
            if (Array.isArray(value)) {
                valueType = "array"; }
            else if ((value["constructor"] && value.constructor["name"])
                    && (typeof value["constructor"] === "function")
                    && (["Object", "Array"].indexOf(value.constructor.name) === -1)) {
                valueType = value.constructor.name; }
        }
        if (valueType.endsWith("Element")) valueType = "Element";
        return valueType;
    }
    static vArray(obj:Object_Any, key:string): any[] {if (!(key in obj)) obj[key] = [];return obj[key];}
    static vObject(obj:Object_Any, key:string) : Object_Any {if (!(key in obj)) obj[key] = {};return obj[key];}
}
// class ttt {
//     Arguments:argumentsOptions = {
//         argsMap: {
//             string: ["label", "yay"]
//         },
//         defaults: {
//             dim:"120px"
//         },
//     }
//     argInstance: argsClass;
//     o: Object_Any;
//     constructor(...Arguments:any){
//         this.argInstance = new argsClass(this, Arguments);
//     }
// }
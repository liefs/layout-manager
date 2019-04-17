let F:Object_Any = {};
class Feature {
    findEl(){
        for(let i=0; i < this.o.features.length; i++)
            if ("el" in this.o.features[i].o && this.o.features[i].o.el != undefined)
            this.o.el = this.o.features[i].o.el;
    }
    static namingIndex:number = 0;
    Arguments:argumentsOptions; // = {argsMap: {},defaults: {}}
    argInstance: argsClass;
    parent: Display;
    o:any;

    displayObj:Object_Any; // to pass up to Display;

    constructor(...Arguments:any){
    }
    // get tree(){
    //     Debug.Ftree(this);
    //     return this;
    // }
}

interface modalFeatureOptions {
    label?: string;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    child?: Display;
    coord?: Coord;

    innerHTML?: string;
    header?:string;
    footer?:string;

    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
    dragSpawn: string[];

    features?: Feature[];
    children?: Display[];
}
function Modal_(...Arguments:any){
    let root = new modalFeature(...Arguments);
    return root.o.child;  //new Display(root.o.label, root);
}
class modalFeature extends Feature {
    static activeModals:modalFeature[] = [];
    static use = {close:true};
    static modalHeader = "background-color: blue;color: white;text-align: center;outline: 1px solid black;cursor: pointer";
    static modalFooter = "background-color: blue;color: white;outline: 1px solid black";
    static modalMain = "background-color: white;outline: 1px solid black";
    static modalClose = "background-color: red;outline: 1px solid black; color: white;cursor: pointer";
    static modalHeaderHeight = 20;
    static modalFooterHeight = 20;
    static movetotop(mouseRtrnObj:mouseReturnObject){
        mouseRtrnObj.event.preventDefault();
        let DISPLAY = modalFeature.display(mouseRtrnObj.display);
        let MODAL:modalFeature = <modalFeature>Display.feature(DISPLAY, "modalFeature");        
        let index = modalFeature.activeModals.indexOf(MODAL);
        let modalfeature: modalFeature;
        if (index < modalFeature.activeModals.length-1 ) {
            modalFeature.activeModals.push( MODAL );
            modalFeature.activeModals.splice(index, 1);
            for(let i=0; i< modalFeature.activeModals.length; i++) {
                modalfeature = modalFeature.activeModals[i];
                modalfeature.parent.o.size.copy(0,0,0,0);
                modalfeature.parent.o.size.copy(modalfeature.o.coord);
            }
        }
    }
    static dragdown(obj:mouseReturnObject){
        obj.event.preventDefault();
        let DISPLAY = modalFeature.display(obj.display);
        let MODAL:modalFeature = <modalFeature>Display.feature(DISPLAY, "modalFeature");
        MODAL.o.coord.copy(DISPLAY.o.size);
        MODAL.isDrag = true;
    }
    static display(DISPLAY:Display) {
        while(Display.feature(DISPLAY, "modalFeature") == undefined) DISPLAY = DISPLAY.o.parent;
        return DISPLAY;
    }
    static dragmove(obj:mouseReturnObject){
        obj.event.preventDefault();
        let DISPLAY = modalFeature.display(obj.display)
        let MODAL:modalFeature = <modalFeature>Display.feature(DISPLAY, "modalFeature");

        if (MODAL.isDrag) {
            let mSize = MODAL.o.coord;
            let dx = obj.deltaX, dy = obj.deltaY;
            let newx = mSize.o.x + dx, newy = mSize.o.y + dy;
            let ss = rootFeature.screenSize();
            if (newx < 0) newx = 0;
            if (newx > ss.width - mSize.o.width) newx = ss.width - mSize.o.width;
            if (newy < 0) newy = 0;
            if (newy > ss.height - mSize.o.height) newy = ss.height - mSize.o.height;
            
            DISPLAY.o.size.copy( mSize.o.width, mSize.o.height, newx, newy);
        }
    }
    static dragup(obj:mouseReturnObject){
        obj.event.preventDefault();
        let DISPLAY = modalFeature.display(obj.display);
        let MODAL:modalFeature = <modalFeature>Display.feature(DISPLAY, "modalFeature");
        if (MODAL.isDrag) {
            MODAL.o.coord.copy( DISPLAY.o.size );
            MODAL.isDrag = false;
        }
    }
    static close(obj:mouseReturnObject){
        modalFeature.display(obj.display).visible = false;
    }    

    debugLabel = "(Modal) Modal";
    o: modalFeatureOptions;
    isDrag:boolean = false;


    allDivsWithEls(containerDisplay = this.o.child){
        let displaysWithElementsList = [];
        let ElfInstance = Display.feature(containerDisplay, "El_Feature");
        if (ElfInstance != undefined) displaysWithElementsList.push( containerDisplay );
        for(let i=0; i < containerDisplay.o.children.length; i++) 
            displaysWithElementsList = displaysWithElementsList.concat( this.allDivsWithEls(containerDisplay.o.children[i]) );
        return displaysWithElementsList;
    }
    Arguments:argumentsOptions = {
        argsMap: {
            string: ["innerHTML", "header", "footer", "label"],
            number: ["width", "height", "x", "y"],
            children: "child", // --------------------------------------------------- come back here!
            Coord: "coord",
        },
        defaults: {label: undefined, features:[], children:[], dragSpawn:["w", "e", "n", "s", "nw", "sw", "ne", "se"], minHeight:150, minWidth:150},
    }
    constructor(...Arguments: any) {
        super(...Arguments);
        this.argInstance = new argsClass(this, Arguments);
        Display.featuresAndChildren(this);
        if (Object.keys(Modal_).length == 0) { // on first call...
            El_Feature.addClass(".modalHeader", modalFeature.modalHeader);
            El_Feature.addClass(".modalFooter", modalFeature.modalFooter);
            El_Feature.addClass(".modalMain", modalFeature.modalMain);
            El_Feature.addClass(".modalClose", modalFeature.modalClose);
        }
        if (this.o.label == undefined) {this.o.label = `modal_${modalFeature.namingIndex++}`};
        if (modalFeature.activeModals.indexOf(this) == -1 ) modalFeature.activeModals.push(this);

        let ss=rootFeature.screenSize();
        let sw = ss.width;
        let sh = ss.height;
        
        if (!(this.o.width)) this.o.width = Math.round(sw/3);
        if (!(this.o.height)) this.o.height = Math.round(sh/3);
        if (!(this.o.x)) this.o.x = (sw - this.o.width)/2;
        if (!(this.o.y)) this.o.y = (sh - this.o.height)/2;
        if (!("coord" in this.o)) this.o.coord = new Coord(this.o.width, this.o.height, this.o.x, this.o.y);

        if (!("child" in this.o)) {
            Arguments.push({class:"modalMain"});
            this.o.child = this.make();
            this.o.child.addFeatures( this );
        }
        let allDivsWithEls = this.allDivsWithEls();
        for (let i=0; i < allDivsWithEls.length ; i++) {
            allDivsWithEls[i].addFeatures( M({mousedown: modalFeature.movetotop}) );
        }
        this.o.child.addFeatures( S(this.o.dragSpawn , {minWidth:this.o.minWidth, minHeight:this.o.minHeight, maxWidth:this.o.maxWidth, maxHeight:this.o.maxHeight}) );
        this.o.child.o.size.copy( this.o.coord );
        Modal_[this.o.label] = F[this.o.label] = this;
    
    }
    init():void {
    }
    update():void {
    }
    set visible(value:boolean){
        let index = modalFeature.activeModals.indexOf(this);
        if (value == true) {
            if ( index == -1 ) modalFeature.activeModals.push(this);
            this.parent.o.size.copy(0,0,0,0);
            this.parent.o.size.copy(this.o.coord);
        }
        else if (index != -1 ) modalFeature.activeModals.splice(index, 1);
    }
    make( ){
        let children: Display[] = [];
        if ("header" in this.o) {
            let newI = I(   `${this.o.label}_header`,
                            this.o.header,
                            "modalHeader",
                            M({ dragdown:modalFeature.dragdown, dragmove:modalFeature.dragmove,
                                dragup:modalFeature.dragup, label:`${this.o.label}_header` })
                            )
            let newIf = Display.feature(newI, "itemFeature");
            if (!modalFeature.use.close) {
                newIf.o.dim = `${modalFeature.modalHeaderHeight}px`;
                children.push( newI );
            }
            else {
                let hor = h(`${this.o.label}_HeaderHor`, `${modalFeature.modalHeaderHeight}px`, 0,
                            newI, I(`${this.o.label}_closeX`,
                                    `${modalFeature.modalHeaderHeight}px`,
                                    "&nbsp;X",
                                    "modalClose",
                                    M({label: `${this.o.label}_closeX`, click:modalFeature.close}))
                        );
                children.push( hor );
            }
        }
        children.push( I(`${this.o.label}_Main`, this.o.innerHTML, "modalMain") );
        if ("footer" in this.o) {
        children.push( I(`${modalFeature.modalFooterHeight}px`,
                            `${this.o.label}_footer`,
                            this.o.footer,
                            "modalFooter"));
        }
        return v(`${this.o.label}`,{margin: 0, children})
    }
}
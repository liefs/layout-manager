
class Designer{
    static cntx = {
        "split Vertically": function(mObj:mouseReturnObject){Designer.split(mObj, true)},
        "split Horizontally": function(mObj:mouseReturnObject){Designer.split(mObj, false)},
    }
    static mousemove(mObj:mouseReturnObject){}
    static buildInit(){
El_Feature.addClass("horTree","color:blue;cursor:pointer;");
El_Feature.addClass("horTree:hover","color:lightblue;");
El_Feature.addClass("horTreeSelected","color:white;background-color:blue;cursor:pointer;");
El_Feature.addClass("verTree","color:red;cursor:pointer;");
El_Feature.addClass("verTree:hover","color:pink;");
El_Feature.addClass("verTreeSelected","color:white;background-color:red;cursor:pointer;");
El_Feature.addClass("itemTree","color:green;cursor:pointer;");
El_Feature.addClass("itemTree:hover","color:lightgreen;");
El_Feature.addClass("itemTreeSelected","color:rgb(180, 240, 165);background-color:green;cursor:pointer;");
El_Feature.addClass("itemBack","background-color:rgb(180, 240, 165)");
El_Feature.addClass("itemBackSelected","color:rgb(180, 240, 165);background-color:green;");


let myContext = context(Designer.cntx, 200,20);

let contextFunction = 

Designer.root = I("Body","Body", M({
    "contextmenu":function(mObj:mouseReturnObject){
        console.log("Here",mObj);
        myContext.parent = mObj.display;
        dropFeature.onContext(mObj, myContext);
    },
    "mousemove":function(mObj:mouseReturnObject){Designer.mousemove(mObj)}
}));
H("DesignerMain",
    v("VertMain",
        h("TopLine", "30px",
            I(),
            I("tlContainer",`<i class="fas fa-boxes fa-2x" title="Create Container"></i>`, "30px", "dButtons"),
            I("tlItem",`<i class="fas fa-book fa-2x" title="Create Item"></i>`, "30px", "dButtons")
        ),
        h("MainBody",
            I("tree",'<ul id="tree"></ul)', "200px", db(100,300)),
            v("MainVert",
                Designer.root,
            )
        )
    )
)
Designer.makeTree();
    }
    static deepIncr = 2;
    static root:Display;
    static screen:Display;
    static split(mObj:mouseReturnObject, direction:boolean) {
        let DISPLAY = mObj.display.o.parent.o.parent;        
        let parent = DISPLAY.o.parent;
        let index = parent.o.children.indexOf(DISPLAY);
        

        if (direction !== (<containerFeature>parent.feature("containerFeature")).o.direction) {
            let item = I({innerHTML:"NewItem"});
            item.o.parent = parent;
            let elFeat = <El_Feature>item.feature("El_Feature");
            if (elFeat)
                elFeat.innerHTML = item.o.label;
            parent.o.children.splice(index+1, 0, item);
        } else {
            let item = I({innerHTML:"NewItem"});
            let elFeat = <El_Feature>item.feature("El_Feature");
            if (elFeat)
                elFeat.innerHTML = item.o.label;
            let container = C(!direction, DISPLAY, item);
            container.o.parent = parent;
            parent.o.children[index] = container;
        }


        parent.update();
        
        Designer.root = D["MainBody"].o.children[1];
        Designer.makeTree();
        console.log(Designer.root);


        // if (DISPLAY == Designer.root) {
        //     Designer.root = C(DISPLAY,I({innerHTML:"New"}), direction);
        // }
        // C["MainBody"].o.children[1] = Designer.root;
        // rootFeature.resizeEvent();
    }
    constructor(...Arguments: any) {
        Designer.screen = D("screen", E("screen",""));
        Designer.buildInit();
        document.body.addEventListener('ResizeEvent', e => Designer.updateScreen());
    }
    static makeTree(root = Designer.root, deep = 0){
        let str="";
        let className:String;
        if (!root.o.label.startsWith("drop")) {
            let container = root.feature("containerFeature");
            let pdir = root.o.parent.feature("containerFeature").o.direction;
            className = ((container) ? ((container.o.direction) ? "horTree" : "verTree") : ((pdir)?"verTree":"horTree"));
            str += "&nbsp;".repeat(deep) + `<span   id="${root.o.label}_tree"
                                                    onclick="Designer.onclick(this, '${root.o.label}');"
                                                    class="${className}${(container)?"":" itemBack"}">${root.o.label}</span><br>\n`;
            if (root.o.children && root.o.children.length > 0) {
                deep += Designer.deepIncr;
                for(let i=0; i < root.o.children.length; i++)
                    str += Designer.makeTree(root.o.children[i], deep);
                deep -= Designer.deepIncr;
            }
            if (root == Designer.root)document.getElementById("tree").innerHTML = str;
        }
        return str;
    }
    static lastTree:HTMLElement;
    static lastclass:string;
    static lastlabel:string;
    static onclick(THIS:HTMLElement, label:string){
        if (Designer.lastTree) 
            Designer.lastTree.className = Designer.lastclass;
        Designer.lastTree = THIS;
        Designer.lastclass = THIS.className;
        THIS.className += "Selected";

        Designer.lastlabel = label;

        Designer.updateScreen(label);

        // console.log(D[label]);
    }
    static updateScreen(label:string = Designer.lastlabel){
        if (D[label]) {
            let {width, height, x, y} = D[label].o.size;
            let DISPLAY = D[label];
            let containerFeature = DISPLAY.o.parent.feature("containerFeature")
            let direction = (containerFeature) ? containerFeature.o.direction : true;
            let [mainColor, subColor] = (DISPLAY.feature("itemFeature")) ? ["green", "lightgreen"] : ((direction) ? ["red","pink"] : ["blue", "lightblue"]);
            Designer.screen.o.size.copy( DISPLAY.o.size );
            Designer.screen.el.innerHTML = `
            <svg width="${width}" height="${height}">
            <rect x="0" y="0" width="${width}" height="${height}"
                style="fill:${mainColor};stroke:${subColor};stroke-width:5;fill-opacity:0.1;stroke-opacity:0.9"/>        
            `;
        }
    }
}
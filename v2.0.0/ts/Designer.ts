
class Designer{
    // static cntx = {
    //     "split Vertically": function(mObj:mouseReturnObject){Designer.split(mObj, true)},
    //     "split Horizontally": function(mObj:mouseReturnObject){Designer.split(mObj, false)},
    // }
    static mousedown(e:MouseEvent) {
        let mousedownItem =  <itemFeature>Designer.moItem(e.clientX, e.clientY);
        if (mousedownItem) {
            let mousedownDisplay = mousedownItem.parent;
            let butNo = Designer.buttonsSelect.currentNo;
            let itemParent = mousedownDisplay.o.parent;
            let container = <containerFeature>itemParent.feature("containerFeature");
            let direction = container.o.direction;
            let Cindex = container.o.children.indexOf(mousedownDisplay);
            let Dindex = itemParent.o.children.indexOf(mousedownDisplay);
            if (butNo == 1) {
                let dim = e.clientX - mousedownDisplay.o.size.o.x;
                mousedownItem.o.dim = itemFeature.dimToString(dim);
                let newitem = I({innerHTML:"New Item"});
                if (direction) {
                    let newVert = v(newitem);
                    mousedownDisplay.o.parent = newVert;
                    mousedownItem.o.dim = itemFeature.dimToString(e.clientY - mousedownDisplay.o.size.o.y);
                    newVert.o.children.unshift(mousedownDisplay);
                    newVert.o.parent = itemParent;
                    // console.log(newVert);
                    container.o.children[Cindex] = newVert;
                    itemParent.o.children[Dindex] = newVert;
                    Designer.buttonsSelect.current = 0;
                    itemParent.update();
                    Designer.makeTree();
                } else {
                    mousedownItem.o.dim = itemFeature.dimToString(e.clientY - mousedownDisplay.o.size.o.y);
                    newitem.o.parent = itemParent;
                    container.o.children.splice(Cindex+1, 0, newitem);
                    itemParent.o.children.splice(Dindex+1,0, newitem);
                    Designer.buttonsSelect.current = 0;
                    itemParent.update();
                    Designer.makeTree();
                }

            }            
            if (butNo == 2) {
                let dim = e.clientX - mousedownDisplay.o.size.o.x;
                mousedownItem.o.dim = itemFeature.dimToString(dim);
                let newitem = I({innerHTML:"New Item"});
                if (direction) {
                    newitem.o.parent = itemParent;
                    container.o.children.splice(Cindex+1, 0, newitem);
                    itemParent.o.children.splice(Dindex+1,0, newitem);
                    Designer.buttonsSelect.current = 0;
                    itemParent.update();
                    Designer.makeTree();
                } else {
                    let newHor = h(newitem);
                    mousedownDisplay.o.parent = newHor;
                    mousedownItem.o.dim = itemFeature.dimToString(e.clientX - mousedownDisplay.o.size.o.x);
                    newHor.o.children.unshift(mousedownDisplay);
                    newHor.o.parent = itemParent;
                    //console.log(newHor);
                    container.o.children[Cindex] = newHor;
                    itemParent.o.children[Dindex] = newHor;
                    Designer.buttonsSelect.current = 0;
                    itemParent.update();
                    Designer.makeTree();
                }
            }
        }
    }
    static mousemove(e:MouseEvent){
        let isin:boolean;
        let mouseOverItem: itemFeature;
        if (Designer.buttonsSelect.currentNo > 0) {
            mouseOverItem =  Designer.moItem(e.clientX, e.clientY);
//            if (mouseOverItem) {
                Designer.updateHorVerPointer(e, mouseOverItem);
//            }
        }
    }
    static updateHorVerPointer(e:MouseEvent, mouseOverItem: itemFeature){
        // console.log(mouseOverItem.o.label);
        Designer.updateScreen( ((mouseOverItem) ? mouseOverItem.parent : undefined), e);
    }
    static moItem(x:number, y:number, check = Designer.root): itemFeature {
        let itemf:itemFeature;
        let temp:any;
        if (check.pointInDisplay(x,y)) {
            itemf = <itemFeature>check.feature("itemFeature");
            if (!itemf) {
                let children = check.o.children;
                if (children.length > 0) {
                    for(let i=0; i < children.length; i++) {
                        temp = Designer.moItem(x, y, children[i]);
                        if (temp) return temp;
                    }
                }
            } else return itemf;
        }
        return undefined;
    }
    static buttonsSelect: SelectSet;
    static PointerButton:Display;
    static VContButton:Display;
    static HContButton:Display;
    static modal:Display;
    constructor(...Arguments: any) {
        Designer.screen = D("screen", E("screen",""));
        Designer.buildInit();
        // document.body.addEventListener('ResizeEvent', e => Designer.updateScreen());
        document.body.onmousemove = Designer.mousemove;
        document.body.onmousedown = Designer.mousedown;
        Designer.modal = Modal_("One", "Two", "Three");
        Designer.modal.visible = false;
    }
    static buildInit(){
El_Feature.addClass("ddMenu","color:white;cursor:pointer;background-color:blue;");
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
El_Feature.addClass("dButtons","cursor: pointer;");
El_Feature.addClass("dButtons:hover","cursor: pointer; border: 1px solid black;");
El_Feature.addClass("dButtonsSelected","cursor: pointer;background-color:DarkGreen;");



// let myContext = context(Designer.cntx, 200,20);

// let contextFunction = 

Designer.root = h("HorBody", I("Body","Body"));
Designer.PointerButton = I("PointerButton", `<svg  style="transform:scale(1.5);-webkit-transform:scale(1.5)"  width="32" height="32">
<title>Select Mode</title>
<polygon fill="#FFFFFF" points="8.2,20.9 8.2,4.9 19.8,16.5 13,16.5 12.6,16.6 "/>
<polygon fill="#FFFFFF" points="17.3,21.6 13.7,23.1 9,12 12.7,10.5 "/>
<rect x="12.5" y="13.6" transform="matrix(0.9221 -0.3871 0.3871 0.9221 -5.7605 6.5909)" width="2" height="8"/>
<polygon points="9.2,7.3 9.2,18.5 12.2,15.6 12.6,15.5 17.4,15.5 "/>
</svg>
`, "30px", "dButtons", M("pointButton", {mousedown:Designer.onPoint}), {selectedClass:"dButtonsSelected"});
Designer.VContButton = I("VContainer",`<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
<title>Vertical Container Mode</title>
<rect stroke="#fff" id="svg_1" height="8.290152" width="26.424859" y="22.366576" x="2.476688" stroke-width="0" />
<rect stroke="#fff" id="svg_10" height="8.290152" width="26.424859" y="1.207971" x="2.492801" stroke-width="0"/>
<rect stroke="#fff" id="svg_11" height="8.290152" width="26.424859" y="11.65359" x="2.476688" stroke-width="0"/>
</g>
</svg>`, "30px", "dButtons", M("vertButton", {mousedown:Designer.onVer}), {selectedClass:"dButtonsSelected"});

Designer.HContButton = I("HContainer",`<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
<title>Horizontal Container Mode</title>
<rect stroke="#fff" id="svg_1" height="26.113978" width="7.564764" y="2.988346" x="2.683942" stroke-width="0"/>
<rect stroke="#fff" id="svg_5" height="26.113978" width="7.564764" y="2.988346" x="22.683934" stroke-width="0"/>
<rect stroke="#fff" id="svg_6" height="26.113978" width="7.564764" y="2.988346" x="12.632124" stroke-width="0"/>
</g>
</svg>`, "30px", "dButtons", M("horButton", {mousedown:Designer.onHor}), {selectedClass:"dButtonsSelected"});

Designer.buttonsSelect = new SelectSet([ (<El_Feature>Designer.PointerButton.feature("El_Feature")),
                                         (<El_Feature>Designer.VContButton.feature("El_Feature")),
                                         (<El_Feature>Designer.HContButton.feature("El_Feature")) ]);
Designer.buttonsSelect.current = 0;                                         

H("DesignerMain",
    v("VertMain", 0 ,
        h("Dropdowns", "16px", 0,
            I("ddFile","File", "ddMenu", "50px", drop({"hey":function(){console.log("hey")}})),
            I("ddEdit","Edit", "ddMenu", "50px"),
            I("ddView","View", "ddMenu", "50px"),
            I("ddSpace", "", "ddMenu")
        ),
        h("TopLine", "30px",
            Designer.PointerButton,
            Designer.VContButton,
            Designer.HContButton,
            I()
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
    static onPoint=function(mObj:mouseReturnObject){
        // console.log("P", mObj);
        Designer.buttonsSelect.current = 0;
    }    
    static onVer=function(mObj:mouseReturnObject){
        // console.log("V", mObj);
        Designer.buttonsSelect.current = 1;
    }    
    static onHor=function(mObj:mouseReturnObject){
        // console.log("H", mObj);
        Designer.buttonsSelect.current = 2;
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
    static optionsHTML(itemF:itemFeature):string {
        let retString = `<form><span>label: </span><input type="text" name="ilabel" id="ilabel" value="${itemF.o.label}" oninput="Designer.itemLabelChange('${itemF.o.label}', this)"><br>
dim: <input type="text" name="idim" value="${(itemF.o.dim) ? itemF.o.dim : ""}"><br></form>`;
        let keys = Object.keys(itemF.o);
        // console.log("keys", keys);
        // retString += "label:"
        return retString;
    }
    static itemLabelChange(label:string, el:HTMLInputElement) {
        let value = el.value;
        let DISPLAY = <Display>D[label];
        D[value] = DISPLAY;
        delete D[label];
        let ITEM = <itemFeature>I[label];
        I[value] = ITEM;
        delete I[label];
        let EL = <El_Feature>E[label];
        E[value] = EL;
        delete E[label];        
        // console.log(DISPLAY, ITEM, EL);
        DISPLAY.o.label = value;
        ITEM.o.label = value;
        EL.o.label = value;
        EL.o.el.id = value;

        let mf = <modalFeature>Designer.modal.feature("modalFeature");
        mf.headHTML.innerHTML = "Item - " + ITEM.o.label;
        mf.footHTML.innerHTML = "Item - " + ITEM.o.label;
        el.setAttribute('oninput',`Designer.itemLabelChange('${ITEM.o.label}', this)`);
        Designer.makeTree();
    }
    // static repaintModal(itemF:itemFeature, mf = <modalFeature>Designer.modal.feature("modalFeature")){
    //     mf.headHTML.innerHTML = "Item - " + itemF.o.label;
    //     mf.footHTML.innerHTML = "Item - " + itemF.o.label;
    //     mf.bodyHTML.o.el.setAttribute('oninput', `Designer.itemLabelChange("${itemF.o.label}", this)`);
    //     // mf.bodyHTML.innerHTML = Designer.optionsHTML(itemF);
    //     // console.log(document.getElementById("ilabel"));
    // }
    static onclick(THIS:HTMLElement, label:string){
        let DISPLAY = D[label];
        if (DISPLAY) {
            if (!Designer.modal.visible) Designer.modal.visible = true;
            let itemF = DISPLAY.feature("itemFeature");
            if (itemF) {
                // let Head_elf = Designer.modal.o.children[0].o.children[0].feature("El_Feature");
                let mf = <modalFeature>Designer.modal.feature("modalFeature");
                mf.headHTML.innerHTML = "Item - " + itemF.o.label;
                mf.footHTML.innerHTML = "Item - " + itemF.o.label;
                mf.bodyHTML.innerHTML = Designer.optionsHTML(itemF);
            }
        }


        

        // if (Designer.lastTree) 
        //     Designer.lastTree.className = Designer.lastclass;
        // Designer.lastTree = THIS;
        // Designer.lastclass = THIS.className;
        // THIS.className += "Selected";
        // Designer.lastlabel = label;
        // console.log(label, THIS, D[label]);

        // Designer.updateScreen(label);

        // console.log(D[label]);
    }
    static updateScreen(DISPLAY:Display = undefined, e:MouseEvent){
        if (DISPLAY) {
            Designer.screenOn = true;Designer.screen.visible = true;
            let {width, height, x, y} = DISPLAY.o.size;
            let containerFeature = DISPLAY.o.parent.feature("containerFeature")
            let direction = (containerFeature) ? containerFeature.o.direction : true;
            let [mainColor, subColor] = (DISPLAY.feature("itemFeature")) ? ["green", "lightgreen"] : ((direction) ? ["red","pink"] : ["blue", "lightblue"]);
            let fullBlock = `
            <svg width="${width}" height="${height}">
            <rect x="0" y="0" width="${width}" height="${height}"
                style="fill:${mainColor};stroke:${subColor};stroke-width:5;fill-opacity:0.1;stroke-opacity:0.9"/>        
            </svg>`;
            let hLine = `<svg width="${width}" height="${height}">
            <line x1="0" y1="${e.clientY-y}" x2="${width}" y2="${e.clientY - y}" style="stroke:rgb(0,255,0);stroke-width:2" />
            </svg>`;
            let vLine = `<svg width="${width}" height="${height}">
            <line x1="${e.clientX-x}" y1="0" x2="${e.clientX - x}" y2="${height}" style="stroke:rgb(0,255,0);stroke-width:2" />
            </svg>`;            
            Designer.screen.o.size.copy( DISPLAY.o.size );
            let butNo = Designer.buttonsSelect.currentNo;
            if (butNo == 1)
                Designer.screen.el.innerHTML = hLine;
            if (butNo == 2)
                Designer.screen.el.innerHTML = vLine;
        } else if (Designer.screenOn) {Designer.screen.visible = false; Designer.screenOn = false}
     }
    static screenOn = false;
}
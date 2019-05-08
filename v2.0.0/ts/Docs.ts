class Docs {
    static treeItem = `
<span class="llmtreeel" onclick="Docs.mainPages.currentPage = 0">Introduction</span><br>
<span class="llmtreeel" onclick="Docs.mainPages.currentPage = 1">Some Other Thing</span><br>
    `;
    static homePage = `
<H2 style="text-align:center">Liefs Layout Manager - Introduction</H2>
<H3>What Is Liefs Layout Manager (llm)?</H3>
Liefs Layout Manager (llm) is a Javascript (/Typescript) component based solution to manage elements on a webpage.
It simplifies html development in to easy to work with Javascript Objects.<br><br>

<H3>How Does llm position elements on the screen?</H3>
Rather than rely on html defaults, llm uses an "Item" and "Container" System, where "Items"
are elements on the page, and a container controls it's position on the screen.  By dividing,
and subdividing the screen in to horizontal and vertical containers with "n" items in each container,
any page layout can be achieved. (See Items & Containers)
    `;
    static itemPage = `
    <H2 style="text-align:center">Liefs Layout Manager - Items</H2>    
    `;
    static mainPages:Display;
    static init(){

Docs.mainPages = P("MainPages",
    I("homePage", Docs.homePage),
    I("itemPage", Docs.itemPage),
);

H("MainHandler", 0,
    v("MainVert", 0, 
        I("Title","Liefs Layout Manager Docs", "llmtitle", "60px"),
        h("HorMain", 10,
            I("Tree", Docs.treeItem, "llmtree", "200px"),
            Docs.mainPages
        )
    )
);

    }
}

window.addEventListener('load', function() {
El_Feature.addClass("llmtitle",`
text-align:center;
font-size:48px;
background-color:lightblue;
`);
El_Feature.addClass("llmtree",`
text-align:left;
font-size:14px;
background-color:lightgreen;
`);
El_Feature.addClass("llmtreeel:hover",`
text-align:left;
font-size:14px;
background-color:green;
cursor: pointer;
`);
El_Feature.addClass("pages",`
text-align:left;
font-size:18px;
`);
Docs.init();
})
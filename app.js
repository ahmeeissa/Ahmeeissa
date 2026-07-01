fetch("./data/capabilities.json")

.then(r=>r.json())

.then(data=>{

const cy = cytoscape({

container:document.getElementById("cy"),

elements:[

...data.nodes,

...data.links

],

style:[

{

selector:"node",

style:{

label:"data(label)",

width:80,

height:80,

"text-valign":"center",

"text-halign":"center",

"font-size":"12px",

color:"#fff",

"background-color":"#238636",

"text-wrap":"wrap",

"text-max-width":"100px"

}

},

{

selector:'node[type="core"]',

style:{

width:120,

height:120,

"background-color":"#58a6ff",

"font-size":"16px"

}

},

{

selector:"edge",

style:{

width:2,

"line-color":"#444",

opacity:.5

}

},

{

selector:".fade",

style:{

opacity:.08

}

}

],

layout:{

name:"cose",

animate:true,

padding:100

}

});

cy.on("tap","node",evt=>{

const node=evt.target;

const connected=node.closedNeighborhood();

cy.elements().addClass("fade");

connected.removeClass("fade");

document.getElementById("title").innerText=node.data("label");

document.getElementById("description").innerText=node.data("description");

});

});
layout:{
    name:"cose",
    animate:true,
    padding:100
}
layout:{
    name:"cose",
    animate:"end",
    animationDuration:2000,
    idealEdgeLength:180,
    nodeRepulsion:600000,
    padding:120
}

fetch("./data/capabilities.json")
.then(r => r.json())
.then(data => {

const cy = cytoscape({

container: document.getElementById("cy"),

elements: [
...data.nodes,
...data.links
],

style: [

{
selector:"node",

style:{

label:"data(label)",

width:90,
height:90,

"text-valign":"center",
"text-halign":"center",

"text-wrap":"wrap",
"text-max-width":"110px",

"font-size":"12px",

color:"#ffffff",

"background-color":"#1f6feb",

"border-width":1.5,

"border-color":"rgba(255,255,255,.15)"
}
},

{
selector:".core",

style:{

width:180,
height:180,

"background-color":"#58a6ff",

"font-size":"20px",

"font-weight":"200"
}
},

{
selector:"edge",

style:{

width:1.2,

"line-color":"rgba(255,255,255,.18)",

"curve-style":"bezier"
}
}
,

{
selector:".fade",

style:{
opacity:0.08
}
}

],

layout:{

name:"cose",

animate:true,

idealEdgeLength:150,

nodeRepulsion:300000,

padding:100

}

});


cy.on("tap","node",evt=>{

const node=evt.target;

const connected=node.closedNeighborhood();

cy.elements().addClass("fade");

connected.removeClass("fade");

document.getElementById("title").innerText=
node.data("label");

document.getElementById("description").innerText=
node.data("description");

});

});

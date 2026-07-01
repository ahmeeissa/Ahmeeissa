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

width:90,

height:90,

"text-valign":"center",

"text-halign":"center",

"font-size":"13px",

color:"#fff",

"background-color":"#1f6feb",

"text-wrap":"wrap",

"text-max-width":"110px",

"border-width":2,

"border-color":"rgba(255,255,255,.15)"
}

},

{

selector:'node[type="core"]',

style:{

width:150,

height:150,

"background-color":"#58a6ff",

"font-size":"18px",

"font-weight":"300"
}

},

{

selector:"edge",

style:{

width:1.5,

"line-color":"rgba(255,255,255,.25)",

opacity:.7,

"curve-style":"bezier"

}

},

{

selector:".fade",

style:{

opacity:.08

}

}

],

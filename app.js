/* ==========================================================
   Ahmeeissa v1
   Interactive Capability Map
   ========================================================== */

"use strict";

/* ----------------------------------------------------------
   Language
---------------------------------------------------------- */

const state = {
    language: "en",
    capabilities: [],
    concepts: [],
    timeline: [],
    relations: []
};

const dictionary = {

    en: {

        explore: "Explore",

        about:
            "Engineering is presented here as a way of thinking rather than a profession.",

        loading:
            "Loading..."
    },

    ar: {

        explore: "استكشف",

        about:
            "الهندسة هنا ليست وظيفة، بل طريقة في التفكير وبناء الأنظمة.",

        loading:
            "جارٍ التحميل..."
    }

};


/* ----------------------------------------------------------
   DOM
---------------------------------------------------------- */

const languageButton =
    document.querySelector(".lang-btn");

const network =
    document.getElementById("network");

const canvas =
    network.getContext("2d");


let nodes = [];
let edges = [];

let mouse = {
    x:0,
    y:0
};


/* ----------------------------------------------------------
   Helpers
---------------------------------------------------------- */

async function loadJSON(file){

    const response =
        await fetch(file);

    return response.json();

}

function random(min,max){

    return Math.random()*(max-min)+min;

}


/* ----------------------------------------------------------
   Load Data
---------------------------------------------------------- */

async function initialize(){

    const [

        capabilities,
        concepts,
        timeline,
        relations

    ] = await Promise.all([

        loadJSON("data/capabilities.json"),

        loadJSON("data/concepts.json"),

        loadJSON("data/timeline.json"),

        loadJSON("data/relations.json")

    ]);

    state.capabilities = capabilities;

    state.concepts = concepts;

    state.timeline = timeline;

    state.relations = relations;

    buildGraph();

    renderTimeline();

    animate();

}

initialize();


/* ----------------------------------------------------------
   Build Network
---------------------------------------------------------- */

function buildGraph(){

    nodes = [];

    edges = [];

    state.capabilities.forEach(cap=>{

        nodes.push({

            id:cap.id,

            title:cap.title,

            group:"capability",

            radius:18,

            x:random(120,network.width-120),

            y:random(120,network.height-120),

            vx:0,

            vy:0

        });

    });

    state.concepts.forEach(con=>{

        nodes.push({

            id:con.id,

            title:con.title,

            group:"concept",

            radius:13,

            x:random(120,network.width-120),

            y:random(120,network.height-120),

            vx:0,

            vy:0

        });

    });

    state.relations.forEach(r=>{

        edges.push(r);

    });

}


/* ----------------------------------------------------------
   Physics
---------------------------------------------------------- */

function simulate(){

    for(let i=0;i<nodes.length;i++){

        for(let j=i+1;j<nodes.length;j++){

            let a=nodes[i];

            let b=nodes[j];

            let dx=b.x-a.x;

            let dy=b.y-a.y;

            let d=Math.sqrt(dx*dx+dy*dy);

            if(d<1)d=1;

            let force=2500/(d*d);

            let fx=force*dx/d;

            let fy=force*dy/d;

            a.vx-=fx;

            a.vy-=fy;

            b.vx+=fx;

            b.vy+=fy;

        }

    }

    edges.forEach(edge=>{

        let a=nodes.find(n=>n.id===edge.from);

        let b=nodes.find(n=>n.id===edge.to);

        if(!a||!b)return;

        let dx=b.x-a.x;

        let dy=b.y-a.y;

        let d=Math.sqrt(dx*dx+dy*dy);

        let desired=170;

        let diff=d-desired;

        let k=0.003;

        let fx=k*diff*dx;

        let fy=k*diff*dy;

        a.vx+=fx;

        a.vy+=fy;

        b.vx-=fx;

        b.vy-=fy;

    });

    nodes.forEach(node=>{

        node.vx*=0.90;

        node.vy*=0.90;

        node.x+=node.vx;

        node.y+=node.vy;

        node.x=Math.max(40,Math.min(network.width-40,node.x));

        node.y=Math.max(40,Math.min(network.height-40,node.y));

    });

}


/* ----------------------------------------------------------
   Draw
---------------------------------------------------------- */

function draw(){

    canvas.clearRect(

        0,
        0,
        network.width,
        network.height

    );

    canvas.lineWidth=1.2;

    canvas.strokeStyle="rgba(120,170,255,.18)";

    edges.forEach(edge=>{

        let a=nodes.find(n=>n.id===edge.from);

        let b=nodes.find(n=>n.id===edge.to);

        if(!a||!b)return;

        canvas.beginPath();

        canvas.moveTo(a.x,a.y);

        canvas.lineTo(b.x,b.y);

        canvas.stroke();

    });

    nodes.forEach(node=>{

        canvas.beginPath();

        canvas.fillStyle=

            node.group==="capability"

            ?"#63b3ff"

            :"#3ee0b3";

        canvas.arc(

            node.x,

            node.y,

            node.radius,

            0,

            Math.PI*2

        );

        canvas.fill();

        canvas.fillStyle="#ffffff";

        canvas.font="13px Inter";

        canvas.textAlign="center";

        canvas.fillText(

            node.title,

            node.x,

            node.y+34

        );

    });

}


/* ----------------------------------------------------------
   Animation
---------------------------------------------------------- */

function animate(){

    simulate();

    draw();

    requestAnimationFrame(animate);

}


/* ----------------------------------------------------------
   Timeline
---------------------------------------------------------- */

function renderTimeline(){

    const container=document.querySelector(".timeline");

    if(!container)return;

    container.innerHTML="";

    state.timeline.forEach(item=>{

        const div=document.createElement("div");

        div.className="timeline-item";

        div.innerHTML=`

            <span>${item.year}</span>

            <h4>${item.title}</h4>

            <p>${item.description}</p>

        `;

        container.appendChild(div);

    });

}


/* ----------------------------------------------------------
   Resize
---------------------------------------------------------- */

function resize(){

    network.width=
        network.clientWidth;

    network.height=
        network.clientHeight;

}

window.addEventListener("resize",resize);

resize();


/* ----------------------------------------------------------
   Language Switch
---------------------------------------------------------- */

languageButton?.addEventListener("click",()=>{

    state.language=

        state.language==="en"

        ?"ar"

        :"en";

    document.body.classList.toggle(

        "ar",

        state.language==="ar"

    );

});

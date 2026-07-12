/* ==========================================================
   Ahmeeissa v1
   Interactive Capability Map
   ========================================================== */

const state = {
    lang: "en",
    capabilities: [],
    concepts: [],
    projects: [],
    archive: [],
    relations: []
};

const $ = (selector) => document.querySelector(selector);

async function loadJSON(path) {
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(`Cannot load ${path}`);
    }

    return await response.json();
}

async function loadData() {

    const [
        capabilities,
        concepts,
        projects,
        archive,
        relations
    ] = await Promise.all([
        loadJSON("data/capabilities.json"),
        loadJSON("data/concepts.json"),
        loadJSON("data/projects.json"),
        loadJSON("data/archive.json"),
        loadJSON("data/relations.json")
    ]);

    state.capabilities = capabilities;
    state.concepts = concepts;
    state.projects = projects;
    state.archive = archive;
    state.relations = relations;

    renderCapabilities();
    renderConcepts();
    renderProjects();
    renderArchive();

    initializeNetwork();

}

function card(title, text, tag = "") {

    return `
        <article class="card">

            ${
                tag
                    ? `<span class="tag">${tag}</span>`
                    : ""
            }

            <h3>${title}</h3>

            <p>${text}</p>

        </article>
    `;

}

function renderCapabilities() {

    const container = $("#capabilities");

    if (!container) return;

    container.innerHTML =
        state.capabilities
            .map(item =>
                card(
                    item.title,
                    item.description,
                    item.category
                )
            )
            .join("");

}

function renderConcepts() {

    const container = $("#concepts");

    if (!container) return;

    container.innerHTML =
        state.concepts
            .map(item =>
                card(
                    item.name,
                    item.summary,
                    "Concept"
                )
            )
            .join("");

}

function renderProjects() {

    const container = $("#projects");

    if (!container) return;

    container.innerHTML =
        state.projects
            .map(project =>
                card(
                    project.name,
                    project.description,
                    project.status
                )
            )
            .join("");

}

function renderArchive() {

    const container = $("#archive");

    if (!container) return;

    container.innerHTML =
        state.archive
            .map(entry => `
                <article class="timeline-item">

                    <span>${entry.date}</span>

                    <h4>${entry.title}</h4>

                    <p>${entry.description}</p>

                </article>
            `)
            .join("");

}

function initializeNetwork() {

    if (typeof vis === "undefined") {

        console.warn("vis-network not loaded");

        return;

    }

    const container = document.getElementById("network");

    if (!container) return;

    const nodes = [];
    const edges = [];

    state.capabilities.forEach(cap => {

        nodes.push({

            id: cap.id,

            label: cap.title,

            shape: "dot",

            size: 18

        });

    });

    state.relations.forEach(rel => {

        edges.push({

            from: rel.from,

            to: rel.to

        });

    });

    const network = new vis.Network(

        container,

        {

            nodes,

            edges

        },

        {

            autoResize: true,

            physics: {

                stabilization: true,

                barnesHut: {

                    gravitationalConstant: -6000,

                    springLength: 180,

                    springConstant: 0.02

                }

            },

            interaction: {

                hover: true,

                navigationButtons: true,

                keyboard: true

            },

            nodes: {

                color: {

                    background: "#63b3ff",

                    border: "#3ee0b3"

                },

                font: {

                    color: "#ffffff"

                }

            },

            edges: {

                color: "#7f8fa4",

                width: 2

            }

        }

    );

    network.on("click", params => {

        if (!params.nodes.length) return;

        const nodeId = params.nodes[0];

        const capability =
            state.capabilities.find(c => c.id === nodeId);

        if (!capability) return;

        alert(
`${capability.title}

${capability.description}`
        );

    });

}

function switchLanguage() {

    state.lang =
        state.lang === "en"
            ? "ar"
            : "en";

    document.body.classList.toggle(
        "ar",
        state.lang === "ar"
    );

    const btn = $("#langButton");

    if (btn) {

        btn.textContent =
            state.lang === "ar"
                ? "English"
                : "العربية";

    }

}

document.addEventListener("DOMContentLoaded", async () => {

    try {

        await loadData();

    }

    catch(error){

        console.error(error);

    }

    const langButton = $("#langButton");

    if(langButton){

        langButton.addEventListener(
            "click",
            switchLanguage
        );

    }

});

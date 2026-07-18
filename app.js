/* ==========================================================
   Ahmeeissa
   Interactive Knowledge Graph
   ========================================================== */

const DATASETS = {
    capabilities: "data/capabilities.json",
    concepts: "data/concepts.json",
    projects: "data/projects.json",
    archive: "data/archive.json",
    relations: "data/relations.json",
    entities: "data/entities.json"
};

const state = {
    nodes: [],
    edges: [],
    cy: null,
    selectedId: null
};

const $ = (selector) => document.querySelector(selector);

function setStatus(message) {
    const status = $("#status");
    if (status) status.textContent = message;
}

function embeddedDatasetKey(path) {
    return path.replace("data/", "").replace(".json", "");
}

function loadEmbeddedJSON(path) {
    const data = window.AHMEEISSA_DATA;
    const key = embeddedDatasetKey(path);

    if (!data || !data[key]) {
        throw new Error(`Cannot load ${path}`);
    }

    return typeof structuredClone === "function" ? structuredClone(data[key]) : JSON.parse(JSON.stringify(data[key]));
}

async function loadJSON(path) {
    if (window.location.protocol === "file:") {
        return loadEmbeddedJSON(path);
    }

    try {
        const response = await fetch(path);

        if (!response.ok) {
            throw new Error(`Cannot load ${path}`);
        }

        return response.json();
    } catch (error) {
        console.warn(`Falling back to embedded data for ${path}`, error);
        return loadEmbeddedJSON(path);
    }
}

function normalizeCapability(capability) {
    return {
        id: `capability-${capability.id}`,
        label: capability.title,
        type: "Capability",
        description: capability.description,
        meta: capability.category,
        keywords: capability.keywords || []
    };
}

function normalizeConcept(concept) {
    return {
        id: `concept-${concept.id}`,
        label: concept.name,
        type: "Concept",
        description: concept.summary,
        meta: concept.group,
        keywords: [concept.group]
    };
}

function normalizeProject(project) {
    return {
        id: `project-${project.id}`,
        label: project.name,
        type: "Project",
        description: project.description,
        meta: `${project.status} · ${project.year}`,
        keywords: project.focus || []
    };
}

function normalizeArchive(entry) {
    return {
        id: `archive-${entry.id}`,
        label: entry.title,
        type: "Archive",
        description: entry.description,
        meta: `${entry.date} · ${entry.type}`,
        keywords: entry.tags || []
    };
}

function normalizeEntity(entity) {
    return {
        id: `entity-${entity.id}`,
        label: entity.label,
        type: entity.type.replace("-", " "),
        description: "عنصر معرفي عربي داخل خريطة Ahmeeissa.",
        meta: "Arabic knowledge node",
        keywords: [entity.type]
    };
}

function buildElements(data) {
    const capabilities = data.capabilities.map(normalizeCapability);
    const concepts = data.concepts.map(normalizeConcept);
    const projects = data.projects.map(normalizeProject);
    const archive = data.archive.map(normalizeArchive);
    const entities = data.entities.map(normalizeEntity);

    const nodes = [
        {
            id: "root",
            label: "Ahmeeissa",
            type: "Environment",
            description: "بيئة معرفية حيّة تجمع القدرات والمفاهيم والمشاريع والأرشيف في خريطة واحدة.",
            meta: "Knowledge Environment",
            keywords: ["Ahmeeissa", "Knowledge", "Graph"]
        },
        ...capabilities,
        ...concepts,
        ...projects,
        ...archive,
        ...entities
    ];

    const edges = [];

    for (const node of nodes) {
        if (node.id !== "root") {
            edges.push({ id: `root-${node.id}`, source: "root", target: node.id, label: "contains" });
        }
    }

    for (const relation of data.relations) {
        edges.push({
            id: `rel-${relation.from}-${relation.to}`,
            source: `capability-${relation.from}`,
            target: `capability-${relation.to}`,
            label: relation.label || relation.type
        });
    }

    for (const project of data.projects) {
        const projectId = `project-${project.id}`;
        for (const focus of project.focus || []) {
            const match = capabilities.find((capability) =>
                capability.label.toLowerCase().includes(focus.toLowerCase()) ||
                capability.keywords.some((keyword) => keyword.toLowerCase().includes(focus.toLowerCase()))
            );

            if (match) {
                edges.push({ id: `${projectId}-${match.id}`, source: projectId, target: match.id, label: "uses" });
            }
        }
    }

    return { nodes, edges };
}

function nodeToElement(node) {
    return { data: node, classes: node.type.toLowerCase().replace(/\s+/g, "-") };
}

function edgeToElement(edge) {
    return { data: edge };
}

function updatePanel(node) {
    state.selectedId = node.id;
    $("#title").textContent = node.label;
    $("#description").textContent = node.description;
    $("#type").textContent = node.meta ? `${node.type} · ${node.meta}` : node.type;
    $("#nodeId").textContent = node.id;

    const connected = state.edges.filter((edge) => edge.source === node.id || edge.target === node.id);
    $("#connections").textContent = String(connected.length);
    setStatus(`Selected: ${node.label}`);
}

function resetPanel() {
    const root = state.nodes.find((node) => node.id === "root");
    if (root) updatePanel(root);
}

function initializeGraph() {
    const container = $("#cy");

    if (!container || typeof cytoscape === "undefined") {
        throw new Error("Cytoscape is not available");
    }

    state.cy = cytoscape({
        container,
        elements: [
            ...state.nodes.map(nodeToElement),
            ...state.edges.map(edgeToElement)
        ],
        layout: {
            name: "cose",
            animate: true,
            fit: true,
            padding: 70,
            nodeRepulsion: 9000,
            idealEdgeLength: 130
        },
        style: [
            {
                selector: "node",
                style: {
                    "background-color": "#63b3ff",
                    "border-color": "#3ee0b3",
                    "border-width": 2,
                    color: "#eef3f8",
                    label: "data(label)",
                    "font-family": "Cairo, Inter, sans-serif",
                    "font-size": 12,
                    "text-wrap": "wrap",
                    "text-max-width": 110,
                    "text-valign": "center",
                    "text-halign": "center",
                    width: 46,
                    height: 46
                }
            },
            { selector: ".environment", style: { width: 78, height: 78, "background-color": "#3ee0b3", color: "#07111c", "font-weight": 700 } },
            { selector: ".concept", style: { "background-color": "#9f7aea" } },
            { selector: ".project", style: { "background-color": "#f6ad55" } },
            { selector: ".archive", style: { "background-color": "#48bb78" } },
            { selector: "edge", style: { width: 1.8, "line-color": "rgba(159,177,196,.55)", "target-arrow-color": "rgba(159,177,196,.7)", "target-arrow-shape": "triangle", "curve-style": "bezier" } },
            { selector: ":selected", style: { "border-width": 5, "border-color": "#ffffff" } },
            { selector: ".hidden", style: { display: "none" } }
        ]
    });

    state.cy.on("tap", "node", (event) => updatePanel(event.target.data()));
    state.cy.on("tap", (event) => {
        if (event.target === state.cy) resetPanel();
    });

    resetPanel();
}

function applySearch(query) {
    const normalized = query.trim().toLowerCase();

    state.cy.elements().removeClass("hidden");

    if (!normalized) {
        setStatus("Ready");
        return;
    }

    const matchingIds = new Set(
        state.nodes
            .filter((node) => [node.label, node.type, node.description, node.meta, ...(node.keywords || [])]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(normalized))
            .map((node) => node.id)
    );

    state.cy.nodes().forEach((node) => {
        const connectedToMatch = node.connectedEdges().some((edge) =>
            matchingIds.has(edge.source().id()) || matchingIds.has(edge.target().id())
        );

        if (!matchingIds.has(node.id()) && !connectedToMatch) node.addClass("hidden");
    });

    state.cy.edges().forEach((edge) => {
        if (edge.source().hasClass("hidden") || edge.target().hasClass("hidden")) edge.addClass("hidden");
    });

    setStatus(`${matchingIds.size} result(s) for "${query}"`);
}

function bindControls() {
    $("#search")?.addEventListener("input", (event) => applySearch(event.target.value));
    $("#resetView")?.addEventListener("click", () => {
        $("#search").value = "";
        applySearch("");
        state.cy.layout({ name: "cose", animate: true, fit: true, padding: 70 }).run();
        resetPanel();
    });
}

async function boot() {
    try {
        setStatus("Loading knowledge graph…");
        const entries = await Promise.all(Object.entries(DATASETS).map(async ([key, path]) => [key, await loadJSON(path)]));
        const data = Object.fromEntries(entries);
        const { nodes, edges } = buildElements(data);
        state.nodes = nodes;
        state.edges = edges;
        initializeGraph();
        bindControls();
        setStatus("Ready — open nodes or search the map");
    } catch (error) {
        console.error(error);
        setStatus("Unable to load the graph. Start a local server and refresh.");
    }
}

document.addEventListener("DOMContentLoaded", boot);

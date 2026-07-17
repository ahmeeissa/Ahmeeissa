 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/app.js b/app.js
index ff4eaed771bb8fb5f19d49c755f3020503016f44..41fc0a9709a21b67844b30f78a82959a1fb00413 100644
--- a/app.js
+++ b/app.js
@@ -1,346 +1,320 @@
 /* ==========================================================
-   Ahmeeissa v1
-   Interactive Capability Map
+   Ahmeeissa
+   Interactive Knowledge Graph
    ========================================================== */
 
+const DATASETS = {
+    capabilities: "data/capabilities.json",
+    concepts: "data/concepts.json",
+    projects: "data/projects.json",
+    archive: "data/archive.json",
+    relations: "data/relations.json",
+    entities: "data/entities.json"
+};
+
 const state = {
-    lang: "en",
-    capabilities: [],
-    concepts: [],
-    projects: [],
-    archive: [],
-    relations: []
+    nodes: [],
+    edges: [],
+    cy: null,
+    selectedId: null
 };
 
 const $ = (selector) => document.querySelector(selector);
 
-async function loadJSON(path) {
-    const response = await fetch(path);
-
-    if (!response.ok) {
-        throw new Error(`Cannot load ${path}`);
-    }
-
-    return await response.json();
+function setStatus(message) {
+    const status = $("#status");
+    if (status) status.textContent = message;
 }
 
-async function loadData() {
-
-    const [
-        capabilities,
-        concepts,
-        projects,
-        archive,
-        relations
-    ] = await Promise.all([
-        loadJSON("data/capabilities.json"),
-        loadJSON("data/concepts.json"),
-        loadJSON("data/projects.json"),
-        loadJSON("data/archive.json"),
-        loadJSON("data/relations.json")
-    ]);
-
-    state.capabilities = capabilities;
-    state.concepts = concepts;
-    state.projects = projects;
-    state.archive = archive;
-    state.relations = relations;
-
-    renderCapabilities();
-    renderConcepts();
-    renderProjects();
-    renderArchive();
-
-    initializeNetwork();
-
+function embeddedDatasetKey(path) {
+    return path.replace("data/", "").replace(".json", "");
 }
 
-function card(title, text, tag = "") {
-
-    return `
-        <article class="card">
+function loadEmbeddedJSON(path) {
+    const data = window.AHMEEISSA_DATA;
+    const key = embeddedDatasetKey(path);
 
-            ${
-                tag
-                    ? `<span class="tag">${tag}</span>`
-                    : ""
-            }
-
-            <h3>${title}</h3>
-
-            <p>${text}</p>
-
-        </article>
-    `;
+    if (!data || !data[key]) {
+        throw new Error(`Cannot load ${path}`);
+    }
 
+    return typeof structuredClone === "function" ? structuredClone(data[key]) : JSON.parse(JSON.stringify(data[key]));
 }
 
-function renderCapabilities() {
-
-    const container = $("#capabilities");
+async function loadJSON(path) {
+    if (window.location.protocol === "file:") {
+        return loadEmbeddedJSON(path);
+    }
 
-    if (!container) return;
+    try {
+        const response = await fetch(path);
 
-    container.innerHTML =
-        state.capabilities
-            .map(item =>
-                card(
-                    item.title,
-                    item.description,
-                    item.category
-                )
-            )
-            .join("");
+        if (!response.ok) {
+            throw new Error(`Cannot load ${path}`);
+        }
 
+        return response.json();
+    } catch (error) {
+        console.warn(`Falling back to embedded data for ${path}`, error);
+        return loadEmbeddedJSON(path);
+    }
 }
 
-function renderConcepts() {
-
-    const container = $("#concepts");
-
-    if (!container) return;
-
-    container.innerHTML =
-        state.concepts
-            .map(item =>
-                card(
-                    item.name,
-                    item.summary,
-                    "Concept"
-                )
-            )
-            .join("");
-
+function normalizeCapability(capability) {
+    return {
+        id: `capability-${capability.id}`,
+        label: capability.title,
+        type: "Capability",
+        description: capability.description,
+        meta: capability.category,
+        keywords: capability.keywords || []
+    };
 }
 
-function renderProjects() {
-
-    const container = $("#projects");
-
-    if (!container) return;
-
-    container.innerHTML =
-        state.projects
-            .map(project =>
-                card(
-                    project.name,
-                    project.description,
-                    project.status
-                )
-            )
-            .join("");
-
+function normalizeConcept(concept) {
+    return {
+        id: `concept-${concept.id}`,
+        label: concept.name,
+        type: "Concept",
+        description: concept.summary,
+        meta: concept.group,
+        keywords: [concept.group]
+    };
 }
 
-function renderArchive() {
-
-    const container = $("#archive");
-
-    if (!container) return;
-
-    container.innerHTML =
-        state.archive
-            .map(entry => `
-                <article class="timeline-item">
-
-                    <span>${entry.date}</span>
-
-                    <h4>${entry.title}</h4>
-
-                    <p>${entry.description}</p>
-
-                </article>
-            `)
-            .join("");
-
+function normalizeProject(project) {
+    return {
+        id: `project-${project.id}`,
+        label: project.name,
+        type: "Project",
+        description: project.description,
+        meta: `${project.status} · ${project.year}`,
+        keywords: project.focus || []
+    };
 }
 
-function initializeNetwork() {
-
-    if (typeof vis === "undefined") {
-
-        console.warn("vis-network not loaded");
-
-        return;
+function normalizeArchive(entry) {
+    return {
+        id: `archive-${entry.id}`,
+        label: entry.title,
+        type: "Archive",
+        description: entry.description,
+        meta: `${entry.date} · ${entry.type}`,
+        keywords: entry.tags || []
+    };
+}
 
-    }
+function normalizeEntity(entity) {
+    return {
+        id: `entity-${entity.id}`,
+        label: entity.label,
+        type: entity.type.replace("-", " "),
+        description: "عنصر معرفي عربي داخل خريطة Ahmeeissa.",
+        meta: "Arabic knowledge node",
+        keywords: [entity.type]
+    };
+}
 
-    const container = document.getElementById("network");
+function buildElements(data) {
+    const capabilities = data.capabilities.map(normalizeCapability);
+    const concepts = data.concepts.map(normalizeConcept);
+    const projects = data.projects.map(normalizeProject);
+    const archive = data.archive.map(normalizeArchive);
+    const entities = data.entities.map(normalizeEntity);
 
-    if (!container) return;
+    const nodes = [
+        {
+            id: "root",
+            label: "Ahmeeissa",
+            type: "Environment",
+            description: "بيئة معرفية حيّة تجمع القدرات والمفاهيم والمشاريع والأرشيف في خريطة واحدة.",
+            meta: "Knowledge Environment",
+            keywords: ["Ahmeeissa", "Knowledge", "Graph"]
+        },
+        ...capabilities,
+        ...concepts,
+        ...projects,
+        ...archive,
+        ...entities
+    ];
 
-    const nodes = [];
     const edges = [];
 
-    state.capabilities.forEach(cap => {
-
-        nodes.push({
-
-            id: cap.id,
-
-            label: cap.title,
-
-            shape: "dot",
-
-            size: 18
-
-        });
-
-    });
-
-    state.relations.forEach(rel => {
+    for (const node of nodes) {
+        if (node.id !== "root") {
+            edges.push({ id: `root-${node.id}`, source: "root", target: node.id, label: "contains" });
+        }
+    }
 
+    for (const relation of data.relations) {
         edges.push({
-
-            from: rel.from,
-
-            to: rel.to
-
+            id: `rel-${relation.from}-${relation.to}`,
+            source: `capability-${relation.from}`,
+            target: `capability-${relation.to}`,
+            label: relation.label || relation.type
         });
+    }
 
-    });
-
-    const network = new vis.Network(
-
-        container,
-
-        {
-
-            nodes,
-
-            edges
-
-        },
-
-        {
-
-            autoResize: true,
-
-            physics: {
-
-                stabilization: true,
-
-                barnesHut: {
-
-                    gravitationalConstant: -6000,
-
-                    springLength: 180,
-
-                    springConstant: 0.02
-
-                }
-
-            },
-
-            interaction: {
-
-                hover: true,
-
-                navigationButtons: true,
+    for (const project of data.projects) {
+        const projectId = `project-${project.id}`;
+        for (const focus of project.focus || []) {
+            const match = capabilities.find((capability) =>
+                capability.label.toLowerCase().includes(focus.toLowerCase()) ||
+                capability.keywords.some((keyword) => keyword.toLowerCase().includes(focus.toLowerCase()))
+            );
 
-                keyboard: true
+            if (match) {
+                edges.push({ id: `${projectId}-${match.id}`, source: projectId, target: match.id, label: "uses" });
+            }
+        }
+    }
 
-            },
+    return { nodes, edges };
+}
 
-            nodes: {
+function nodeToElement(node) {
+    return { data: node, classes: node.type.toLowerCase().replace(/\s+/g, "-") };
+}
 
-                color: {
+function edgeToElement(edge) {
+    return { data: edge };
+}
 
-                    background: "#63b3ff",
+function updatePanel(node) {
+    state.selectedId = node.id;
+    $("#title").textContent = node.label;
+    $("#description").textContent = node.description;
+    $("#type").textContent = node.meta ? `${node.type} · ${node.meta}` : node.type;
+    $("#nodeId").textContent = node.id;
 
-                    border: "#3ee0b3"
+    const connected = state.edges.filter((edge) => edge.source === node.id || edge.target === node.id);
+    $("#connections").textContent = String(connected.length);
+    setStatus(`Selected: ${node.label}`);
+}
 
-                },
+function resetPanel() {
+    const root = state.nodes.find((node) => node.id === "root");
+    if (root) updatePanel(root);
+}
 
-                font: {
+function initializeGraph() {
+    const container = $("#cy");
 
-                    color: "#ffffff"
+    if (!container || typeof cytoscape === "undefined") {
+        throw new Error("Cytoscape is not available");
+    }
 
+    state.cy = cytoscape({
+        container,
+        elements: [
+            ...state.nodes.map(nodeToElement),
+            ...state.edges.map(edgeToElement)
+        ],
+        layout: {
+            name: "cose",
+            animate: true,
+            fit: true,
+            padding: 70,
+            nodeRepulsion: 9000,
+            idealEdgeLength: 130
+        },
+        style: [
+            {
+                selector: "node",
+                style: {
+                    "background-color": "#63b3ff",
+                    "border-color": "#3ee0b3",
+                    "border-width": 2,
+                    color: "#eef3f8",
+                    label: "data(label)",
+                    "font-family": "Cairo, Inter, sans-serif",
+                    "font-size": 12,
+                    "text-wrap": "wrap",
+                    "text-max-width": 110,
+                    "text-valign": "center",
+                    "text-halign": "center",
+                    width: 46,
+                    height: 46
                 }
-
             },
+            { selector: ".environment", style: { width: 78, height: 78, "background-color": "#3ee0b3", color: "#07111c", "font-weight": 700 } },
+            { selector: ".concept", style: { "background-color": "#9f7aea" } },
+            { selector: ".project", style: { "background-color": "#f6ad55" } },
+            { selector: ".archive", style: { "background-color": "#48bb78" } },
+            { selector: "edge", style: { width: 1.8, "line-color": "rgba(159,177,196,.55)", "target-arrow-color": "rgba(159,177,196,.7)", "target-arrow-shape": "triangle", "curve-style": "bezier" } },
+            { selector: ":selected", style: { "border-width": 5, "border-color": "#ffffff" } },
+            { selector: ".hidden", style: { display: "none" } }
+        ]
+    });
 
-            edges: {
+    state.cy.on("tap", "node", (event) => updatePanel(event.target.data()));
+    state.cy.on("tap", (event) => {
+        if (event.target === state.cy) resetPanel();
+    });
 
-                color: "#7f8fa4",
+    resetPanel();
+}
 
-                width: 2
+function applySearch(query) {
+    const normalized = query.trim().toLowerCase();
 
-            }
+    state.cy.elements().removeClass("hidden");
 
-        }
+    if (!normalized) {
+        setStatus("Ready");
+        return;
+    }
 
+    const matchingIds = new Set(
+        state.nodes
+            .filter((node) => [node.label, node.type, node.description, node.meta, ...(node.keywords || [])]
+                .filter(Boolean)
+                .join(" ")
+                .toLowerCase()
+                .includes(normalized))
+            .map((node) => node.id)
     );
 
-    network.on("click", params => {
-
-        if (!params.nodes.length) return;
-
-        const nodeId = params.nodes[0];
-
-        const capability =
-            state.capabilities.find(c => c.id === nodeId);
-
-        if (!capability) return;
-
-        alert(
-`${capability.title}
-
-${capability.description}`
+    state.cy.nodes().forEach((node) => {
+        const connectedToMatch = node.connectedEdges().some((edge) =>
+            matchingIds.has(edge.source().id()) || matchingIds.has(edge.target().id())
         );
 
+        if (!matchingIds.has(node.id()) && !connectedToMatch) node.addClass("hidden");
     });
 
-}
-
-function switchLanguage() {
-
-    state.lang =
-        state.lang === "en"
-            ? "ar"
-            : "en";
-
-    document.body.classList.toggle(
-        "ar",
-        state.lang === "ar"
-    );
-
-    const btn = $("#langButton");
-
-    if (btn) {
-
-        btn.textContent =
-            state.lang === "ar"
-                ? "English"
-                : "العربية";
-
-    }
+    state.cy.edges().forEach((edge) => {
+        if (edge.source().hasClass("hidden") || edge.target().hasClass("hidden")) edge.addClass("hidden");
+    });
 
+    setStatus(`${matchingIds.size} result(s) for “${query}”`);
 }
 
-document.addEventListener("DOMContentLoaded", async () => {
+function bindControls() {
+    $("#search")?.addEventListener("input", (event) => applySearch(event.target.value));
+    $("#resetView")?.addEventListener("click", () => {
+        $("#search").value = "";
+        applySearch("");
+        state.cy.layout({ name: "cose", animate: true, fit: true, padding: 70 }).run();
+        resetPanel();
+    });
+}
 
+async function boot() {
     try {
-
-        await loadData();
-
-    }
-
-    catch(error){
-
+        setStatus("Loading knowledge graph…");
+        const entries = await Promise.all(Object.entries(DATASETS).map(async ([key, path]) => [key, await loadJSON(path)]));
+        const data = Object.fromEntries(entries);
+        const { nodes, edges } = buildElements(data);
+        state.nodes = nodes;
+        state.edges = edges;
+        initializeGraph();
+        bindControls();
+        setStatus("Ready — open nodes or search the map");
+    } catch (error) {
         console.error(error);
-
-    }
-
-    const langButton = $("#langButton");
-
-    if(langButton){
-
-        langButton.addEventListener(
-            "click",
-            switchLanguage
-        );
-
+        setStatus("Unable to load the graph. Start a local server and refresh.");
     }
+}
 
-});
+document.addEventListener("DOMContentLoaded", boot);
 
EOF
)

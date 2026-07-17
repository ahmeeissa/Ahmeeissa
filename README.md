# Ahmeeissa

An interactive capability map that presents knowledge, relationships, projects, and the evolution of ideas instead of a traditional portfolio or résumé.

---

## Vision

Ahmeeissa is designed around a simple principle:

> People are better understood through recurring capabilities than through job titles.

Rather than presenting experience as a chronological list, the platform visualizes how capabilities appear across different professional contexts and how ideas evolve over time.

---

## Core Components

- Interactive Capability Map
- Concepts Library
- Project Explorer
- Living Archive
- Relationship Graph
- Timeline of Transformations

---

## Project Structure

```
Ahmeeissa/
│
├── index.html
├── style.css
├── app.js
│
├── data/
│   ├── capabilities.json
│   ├── concepts.json
│   ├── projects.json
│   ├── archive.json
│   └── relations.json
│
└── README.md
```

---

## Data Files

### capabilities.json

Stores the major capabilities represented in the project.

Example:

```json
{
  "id": 1,
  "title": "Systems Thinking",
  "category": "Engineering"
}
```

---

### concepts.json

Contains conceptual ideas and recurring principles.

---

### projects.json

Stores projects, their descriptions and current status.

---

### archive.json

Represents milestones and historical knowledge.

---

### relations.json

Defines the graph connections used by the interactive visualization.

Example:

```json
{
  "from": 1,
  "to": 2,
  "type": "supports"
}
```

---

## Technologies

Current version:

- HTML5
- CSS3
- Vanilla JavaScript
- JSON
- Vis Network

No backend is required.

---

## Features

- Interactive capability graph
- Responsive layout
- Knowledge cards
- Timeline visualization
- Expandable architecture
- Lightweight static deployment
- GitHub Pages compatible

---

## Running Locally

Simply open:

```
index.html
```

or use any local server.

Example:

```
python -m http.server
```

or

```
npx serve
```

---

## Deployment

The project can be deployed directly to:

- GitHub Pages
- Cloudflare Pages
- Netlify
- Vercel

No server-side configuration is required.

---

## Roadmap

### Version 1

- Interactive capability graph
- Concepts
- Projects
- Archive
- Relationships

---

### Version 2

- Search engine
- Filters
- Dark/Light mode
- Multi-language content
- Rich project pages

---

### Version 3

- Interactive knowledge graph
- Semantic relationships
- Timeline navigation
- Dynamic data loading
- Personal knowledge architecture

---

## Philosophy

This project treats engineering as a way of thinking rather than a profession.

Capabilities are represented as interconnected systems.

Projects are expressions of capabilities.

Knowledge is treated as a living structure that evolves over time.

---

## License

MIT License

---

## Author

Ahmed Eissa

Biomedical Engineer

Systems Thinker

Knowledge Architecture

Business Development

Ahmeeissa Project
 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/README.md b/README.md
index bf881c39695a59a25af705d60bd917c0606075e0..0118e2e51a4326a2156a80bb24dd6390f137b8dd 100644
--- a/README.md
+++ b/README.md
@@ -110,51 +110,51 @@ Current version:
 
 No backend is required.
 
 ---
 
 ## Features
 
 - Interactive capability graph
 - Responsive layout
 - Knowledge cards
 - Timeline visualization
 - Expandable architecture
 - Lightweight static deployment
 - GitHub Pages compatible
 
 ---
 
 ## Running Locally
 
 Simply open:
 
 ```
 index.html
 ```
 
-or use any local server.
+The app also includes `data/inline-data.js`, so the graph can load when the HTML file is opened directly from disk. You may still use any local server.
 
 Example:
 
 ```
 python -m http.server
 ```
 
 or
 
 ```
 npx serve
 ```
 
 ---
 
 ## Deployment
 
 The project can be deployed directly to:
 
 - GitHub Pages
 - Cloudflare Pages
 - Netlify
 - Vercel
 
 No server-side configuration is required.
 
EOF
)

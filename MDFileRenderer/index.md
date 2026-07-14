Here is a single-file solution (`index.html`) that uses Zero-MD for rendering Markdown and `js-yaml` to parse a `mkdocs.yml` formatted file. It implements a professional two-pane layout with a responsive "Back to Index" mobile view.

### `index.html`

Save this file in the root of your folder alongside your `mkdocs.yml` and `.md`/`.html` files.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentation</title>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js"></script>
    <script type="module" src="https://cdn.jsdelivr.net/gh/zerodevx/zero-md@2/dist/zero-md.min.js"></script>

    <style>
        :root {
            --sidebar-width: 300px;
            --primary-color: #0f172a;
            --text-color: #334155;
            --bg-color: #f8fafc;
            --border-color: #e2e8f0;
            --hover-bg: #f1f5f9;
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            height: 100vh;
            color: var(--text-color);
            background: #ffffff;
            overflow: hidden;
        }

        /* Sidebar Navigation */
        #sidebar {
            width: var(--sidebar-width);
            background: var(--bg-color);
            border-right: 1px solid var(--border-color);
            height: 100vh;
            overflow-y: auto;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
        }

        #sidebar h1 {
            font-size: 1.25rem;
            color: var(--primary-color);
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--border-color);
        }

        #nav-tree ul {
            list-style: none;
            padding-left: 1rem;
        }

        #nav-tree > ul { padding-left: 0; }

        #nav-tree li { margin: 0.25rem 0; }

        .section-title {
            display: block;
            font-weight: 600;
            color: var(--primary-color);
            margin-top: 1rem;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        #nav-tree a {
            text-decoration: none;
            color: var(--text-color);
            display: block;
            padding: 0.4rem 0.5rem;
            border-radius: 4px;
            font-size: 0.95rem;
            transition: all 0.2s;
        }

        #nav-tree a:hover {
            background: var(--hover-bg);
            color: var(--primary-color);
        }

        /* Main Content */
        #main-content {
            flex: 1;
            height: 100vh;
            overflow-y: auto;
            position: relative;
        }

        .content-wrapper {
            max-width: 900px;
            margin: 0 auto;
            padding: 3rem 2rem;
        }

        /* Mobile Header & Back Button */
        #mobile-header {
            display: none;
            padding: 1rem;
            background: var(--bg-color);
            border-bottom: 1px solid var(--border-color);
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 10;
        }

        #back-btn {
            background: transparent;
            border: 1px solid var(--border-color);
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            color: var(--primary-color);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            body { flex-direction: column; }
            #sidebar { 
                width: 100%; 
                height: 100vh;
                display: block; 
            }
            #main-content { 
                display: none; 
                width: 100%;
            }
            body.viewing-content #sidebar { display: none; }
            body.viewing-content #main-content { display: block; }
            #mobile-header { display: flex; }
            .content-wrapper { padding: 1.5rem 1rem; }
        }
    </style>
</head>
<body>

    <nav id="sidebar">
        <h1 id="site-title">Documentation</h1>
        <div id="nav-tree"></div>
    </nav>

    <main id="main-content">
        <div id="mobile-header">
            <button id="back-btn">← Back to Index</button>
        </div>
        <div class="content-wrapper">
            <zero-md id="md-viewer" src=""></zero-md>
        </div>
    </main>

    <script>
        const navTreeContainer = document.getElementById('nav-tree');
        const mdViewer = document.getElementById('md-viewer');
        const backBtn = document.getElementById('back-btn');
        const siteTitle = document.getElementById('site-title');

        // Handles routing for clicks
        function loadContent(path) {
            if (path.endsWith('.html')) {
                window.location.href = path;
                return;
            }
            mdViewer.src = path;
            document.body.classList.add('viewing-content');
            window.scrollTo(0,0);
        }

        backBtn.addEventListener('click', () => {
            document.body.classList.remove('viewing-content');
        });

        // Recursively build the DOM for the navigation sidebar
        function buildNavDOM(navData, container) {
            const ul = document.createElement('ul');
            
            navData.forEach(item => {
                for (const [key, value] of Object.entries(item)) {
                    const li = document.createElement('li');
                    
                    if (typeof value === 'string') {
                        // It's a file link
                        const a = document.createElement('a');
                        a.textContent = key;
                        a.href = "#";
                        a.onclick = (e) => {
                            e.preventDefault();
                            loadContent(value);
                        };
                        li.appendChild(a);
                    } else if (Array.isArray(value)) {
                        // It's a sub-topic / category
                        const span = document.createElement('span');
                        span.className = 'section-title';
                        span.textContent = key;
                        li.appendChild(span);
                        buildNavDOM(value, li);
                    }
                    ul.appendChild(li);
                }
            });
            container.appendChild(ul);
        }

        // Fetch and parse the YAML configuration
        async function initialize() {
            try {
                const response = await fetch('mkdocs.yml');
                if (!response.ok) throw new Error("Could not load mkdocs.yml");
                
                const yamlText = await response.text();
                const config = jsyaml.load(yamlText);

                if (config.site_name) {
                    siteTitle.textContent = config.site_name;
                    document.title = config.site_name;
                }

                if (config.nav) {
                    buildNavDOM(config.nav, navTreeContainer);
                    
                    // Load the first available markdown file by default
                    const firstEntry = Object.values(config.nav[0])[0];
                    if (typeof firstEntry === 'string') {
                        mdViewer.src = firstEntry;
                    }
                }
            } catch (error) {
                navTreeContainer.innerHTML = `<p style="color:red">Error initializing: ${error.message}. Ensure you are running this via a local HTTP server.</p>`;
            }
        }

        initialize();
    </script>
</body>
</html>

```

### Required Configuration Structure

The script expects a file named `mkdocs.yml` in the exact same directory, formatted following standard MkDocs syntax:

```yaml
site_name: Project Concept Papers
nav:
  - Introduction: index.md
  - Architecture:
    - Overview: docs/architecture/overview.md
    - Database Schema: docs/architecture/schema.md
  - External Resources: custom_dashboard.html

```

### Execution Note

Because the application relies on the Javascript `fetch()` API to read the YAML file and load local `.md` files dynamically, modern web browsers will block it if you simply double-click `index.html` (due to CORS restrictions on the `file://` protocol).

You must serve the directory over a local HTTP server. For example:

* **Python:** `python -m http.server`
* **Node.js:** `npx serve`
* **VS Code:** Use the "Live Server" extension.
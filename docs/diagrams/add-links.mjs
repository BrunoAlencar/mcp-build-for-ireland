// Adds click-to-open links to the Archify usage map. Archify nodes have no link field,
// so run this after every render: node docs/diagrams/add-links.mjs
import { readFile, writeFile } from "node:fs/promises";

const HTML_PATH = new URL("usage-map.html", import.meta.url);
const MARKER = "usage-map-links";

// Node id (from usage-map.workflow.json) -> repository-relative document.
const LINKS = {
  client: "docs/mcp-guide.md#run-locally",
  projectdocs: "docs/mcp-guide.md#available-now-project-docs",
  dgserver: "docs/mcp-guide.md#available-now-data-gov-ie",
  "ref-datagov": "docs/apis/data-gov-ie.md",
  "ref-dublinked": "docs/apis/dublinked.md",
  "ref-cso": "docs/apis/cso-pxstat.md",
  "ref-nta": "docs/apis/nta-tfi.md",
  "ref-eirgrid": "docs/apis/eirgrid.md",
  "ref-epa": "docs/apis/epa.md",
  "ref-met": "docs/apis/met-eireann.md",
};

const script = `<script id="${MARKER}">
(function () {
  var links = ${JSON.stringify(LINKS)};
  // On GitHub Pages (or with ?repo=owner/name) open the rendered file on github.com;
  // anywhere else open the file next to this page.
  function repo() {
    var param = new URLSearchParams(location.search).get("repo");
    if (param) return param;
    var host = /^([^.]+)\\.github\\.io$/.exec(location.hostname);
    var name = location.pathname.split("/")[1];
    return host && name ? host[1] + "/" + name : null;
  }
  function urlFor(path) {
    var r = repo();
    return r ? "https://github.com/" + r + "/blob/HEAD/" + path : "../" + path.replace(/^docs\\//, "");
  }
  var down = null;
  document.addEventListener("pointerdown", function (e) { down = { x: e.clientX, y: e.clientY }; }, true);
  function open(node) {
    var path = links[node.getAttribute("data-node-id")];
    if (path) window.open(urlFor(path), "_blank", "noopener");
  }
  document.querySelectorAll("[data-node-id]").forEach(function (node) {
    if (!links[node.getAttribute("data-node-id")]) return;
    node.style.cursor = "pointer";
    node.setAttribute("aria-label", node.getAttribute("aria-label") + ". Opens its document.");
    node.addEventListener("click", function (e) {
      // A drag pans the diagram; only a still click opens the document.
      if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
      open(node);
    });
    node.addEventListener("keydown", function (e) { if (e.key === "Enter") open(node); });
  });
})();
</script>`;

const html = await readFile(HTML_PATH, "utf8");
if (html.includes(`id="${MARKER}"`)) {
  console.error("Links already present; re-render the diagram before running this again.");
  process.exit(1);
}
const at = html.lastIndexOf("</body>");
if (at === -1) throw new Error("usage-map.html has no </body> tag.");
await writeFile(HTML_PATH, html.slice(0, at) + script + "\n" + html.slice(at));
console.error(`Added ${Object.keys(LINKS).length} links to usage-map.html`);

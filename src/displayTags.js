let i = 0;
function webComponent(name, style, template) {
  class WebComp extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: "open" });
      shadow.innerHTML = `
        <style>
          ${style}
        </style>
        ${template}
      `;
    }
  }
  const tag = name[0].toLowerCase() + name.slice(1).replaceAll(/[A-Z]/g, (m) => "-" + m.toLowerCase()) + "-" + i++;
  customElements.define(tag, WebComp);
  return new WebComp();
}

export function displayTokens(processed) {
  const css = /*css*/`
  div { white-space: pre; border: 5px solid green; }
  :hover > span[taggatty=""]{ color: transparent; }
  .t { color: steelblue; }
  .w { color: darkgrey; }
  .v { color: green; }
  .x { color: orange; }
  .\\= { color: lightblue; }
  .n { color: blue; }
  .error { color: red; }
  .diff { background-color: yellow; }
  `;
  let { tokens, types, taggatty, diff = [] } = processed;
  tokens = tokens.map((t) => t.replaceAll("<", "&lt;"));
  const spans = tokens.map((t, i) => { return `<span taggatty="${taggatty[i]}" class="${types[i]} ${+diff[i] ? "diff" : ""}">${t}</span>` }).join("");
  return webComponent("TextElement", css, `<div>${spans}</div>`);
}

export function displayDiffTable(diffTable) {
  let html = '<table>';
  html += '<tr><th>x</th>' + Object.keys(Object.values(diffTable)[0]).map(page => `<th>${page}</th>`).join("") + '</tr>';
  let i = 0;
  for (const [page, diffs] of Object.entries(diffTable)) {
    html += `<tr><th>${page}</th>`;
    html += "<td>.</td>".repeat(i++);
    for (const [page2, diff] of Object.entries(diffs)) {
      html += `<td page="${page}" page2="${page2}">${diff}</td>`;
    }
    html += '</tr>';
  }
  return webComponent("DiffTable", "", html + '</table>');
}

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
  :host { display: block; }
  :host { white-space: pre; border: 5px solid green; }
  div:hover span[taggatty=""]{ color: transparent; }
  span.t { color: steelblue; }
  span.w { color: darkgrey; }
  span.v { color: green; }
  span.x { color: orange; }
  span.\= { color: lightblue; }
  span.n { color: blue; }
  span.error { color: red; }
  `;
  let { tokens, types, taggatty } = processed;
  tokens = tokens.map((t) => t.replaceAll("<", "&lt;"));
  const spans = tokens.map((t, i) => `<span taggatty="${taggatty[i]}" class="${types[i]}">${t}</span>`).join("");
  return webComponent("TextElement", css, spans);
}

export function displayDiffTable(diffTable) {
  let html = '<table>';
  html += '<tr>' + Object.keys(diffTable).map(page => `<th>${page}</th>`).join("") + '</tr>';
  let i = 0;
  for (const [page, diffs] of Object.entries(diffTable)) {
    html += `<tr><th>${page}</th>`;
    html += "<td>.</td>".repeat(i++);
    for (const [page2, diff] of Object.entries(diffs)) {
      html += `<td>${diff.length}</td>`;
    }
    html += '</tr>';
  }
  return webComponent("DiffTable", "", html + '</table>');
}

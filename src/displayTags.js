

export function displayTokens(processed) {
  let { tokens, types, taggatty } = processed;
  tokens = tokens.map((t) => t.replaceAll("<", "&lt;"));
  const styles = Object.entries({
    t: "steelblue",
    w: "darkgrey",
    v: "green",
    x: "orange",
    "=": "lightblue",
    n: "blue",
    error: "red",
  }).map(([k, v]) => `span.${k} { color: ${v}; }`).join("\n");
  const style = `<style>
  div:hover span[taggatty=""]{ color: transparent;}
  ${styles}
  </style>`;

  const spans = tokens.map((t, i) => `<span taggatty="${taggatty[i]}" class="${types[i]}">${t}</span>`).join("");
  return `${style}\n<div class="textDisplay" style="white-space: pre; border: 5px solid green;">${spans}</div>`;
}

function toTaggatty(tokens, types) { //
  let res = [];
  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    if (type === "t" || type === "n") res.push(tokens[i]);
    else if (type === "s") res.push(" ");
    else if (type === "U") res.push("$");
    else if (type === "x") res.push("!");
    else res.push("");
  }
  return res;
}

export function TaggattyMap(pages) {
  const res = {};
  for (const [url, { raw, tokens, types }] of Object.entries(pages)) {
    const taggatty = toTaggatty(tokens, types);
    (res[taggatty.join("")] ??= []).push({ url, raw, tokens, types, taggatty });
  }
  return res;
}


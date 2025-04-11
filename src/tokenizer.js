const TAGnoTAG = /([^<]+)|(<!--)(.*?)(-->)|(<\/?[a-z][a-z-_0-9]*)(\s*)(\/?>)|(<\/?[a-z][a-z-_0-9]*(?:"[^"]*"|'[^']*'|[^>])+(?:\/?>|$))|(<[^>]+>)/gis;
const COMPLEX_TAG = /(<\/?[a-z][a-z-_0-9]*)|(\/?>)|(\s+)|([a-z:_][a-z:_0-9.-]*)(?:=(?:'([^']*)'|"([^"]*)"|([^\s"'`=<>]+)))?/gi;

export function tokenize(html) {
  const tokens = [];
  let types = "";
  for (const [, text, commentStart, comment, commentEnd, plainStart, plainSpace, plainEnd, tag, strangeTag] of html.trim().matchAll(TAGnoTAG)) {
    if (plainStart)
      tokens.push(plainStart, plainSpace, plainEnd), (types += "tsz");
    else if (text)
      tokens.push(text), (types += "W");
    else if (commentStart, comment, commentEnd)
      tokens.push(commentStart, comment, commentEnd), (types += "cUc");
    else if (strangeTag)
      tokens.push(strangeTag), (types += "X");
    else if (tag)
      for (const [, start, end, space, name, v1, v2, value = v1 ?? v2] of tag.matchAll(COMPLEX_TAG))
        start ? (tokens.push(start), (types += "t")) :
          end ? (tokens.push(end), (types += "z")) :
            space ? (tokens.push(space), (types += "s")) :
              (tokens.push(name, '="', value, '"'), (types += "neVq")); //name
  }
  return { tokens, types };
}

export function toTaggatty({ tokens, types }) { //
  let res = [];
  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    if (type === "t" || type === "n" || type === "c") res.push(tokens[i]);
    else if (type === "s") res.push(" ");
    else if (type === "x") res.push("!");
    else res.push("");
  }
  return res;
}
const TAGnoTAG = /([^<]+)|(<!--)(.*?)(-->)|(<\/?[a-z][a-z-_0-9]*)(\s*)(\/?>)|(<\/?[a-z][a-z-_0-9]*(?:"[^"]*"|'[^']*'|[^>])+(?:\/?>|$))|(<[^>]+>)/gis;
const COMPLEX_TAG = /(<\/?[a-z][a-z-_0-9]*)|(\/?>)|(\s+)|([a-z:_][a-z:_0-9.-]*)(?:=(?:'([^']*)'|"([^"]*)"|([^\s"'`=<>]+)))?/gi;

const getKey = (function () {
  let i = 0;
  const memory = {};
  return function getKey(str) {
    return memory[str] ??= "_" + i++;
  }
})();

export function tokenize(url, html) {
  const tokens = [];
  const json = {};
  let types = "";
  let key;
  for (const [, text, commentStart, comment, commentEnd, plainStart, plainSpace, plainEnd, tag, strangeTag] of html.trim().matchAll(TAGnoTAG)) {
    if (plainStart)
      tokens.push(plainStart, plainSpace, plainEnd), (types += "tsz");
    else if (text)
      tokens.push(key = getKey(text)), (types += "W"), json[key] = text;
    else if (commentStart, comment, commentEnd)
      tokens.push(commentStart, key = getKey(text), commentEnd), (types += "cUc"), json[key] = comment;
    else if (strangeTag)
      tokens.push(strangeTag), (types += "X");
    else if (tag)
      for (const [, start, end, space, name, v1, v2, value = v1 ?? v2] of tag.matchAll(COMPLEX_TAG))
        start ? (tokens.push(start), (types += "t")) :
          end ? (tokens.push(end), (types += "z")) :
            space ? (tokens.push(space), (types += "s")) :
              (tokens.push(name, '="', key = getKey(text), '"'), (types += "neVq"), (json[key] = value));
  }
  tokens = Object.freeze(tokens);
  json = Object.freeze(json);
  const jsons = Object.freeze({ [url]: json });
  return Object.freeze({ tokens, types, jsons }); //template object tokens/types/jsons
}

function doDiff(tokens, types, tokensB, typesB) {
  const res = diffAsArray(tokens, tokensB);
  let A = 0, B = 0;
  for (const d of res) {
    d.typea = types.slice(A, A += d.a.length);
    if (d.b) d.typeb = typesB.slice(B, B += d.b.length)
    else B += d.a.length;
  }
  return res;
}


function mergeTemplates(transforms, templateA, templateB) {
  const { types, tokens, jsons } = templateA;
  const { types: typesB, tokens: tokensB, jsons: jsonsB } = templateB;
  const diff = doDiff(tokens, types, tokensB, typesB);
  return doTransformFunnel(transforms, diff, jsons, jsonsB);
}



//create a new json dictionary map pointing from 
function jsonableDifference({ typea, typeb, a, b }) {
  return !b || a === b || a.every((A, i) => (typea[i] === typeb[i]) && (A === b[i] || "UVW".includes(typea[i])));
}

function mapProperties(typea, a, b) {
  const rename = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i] == b[i])
      continue;
    if (typea[i] === "U" || typea == "V" || typea == "W")
      rename[b[i]] = a[i];
    return;
  }
  return rename;
}

function renameProps(renames, target) {
  const res = {};
  for (let k in target)
    res[renames[k] ?? k] = target[k];
  return res;
}

function renameMultipleJsons(renames, jsons) {
  const res = {};
  for (let jsonK in jsons)
    res[jsonK] = renameProps(renames, jsons[jsonK])
  return res;
}

//diff has a=[],b=[],typea, typeb
//jsons {url: {}, url2: {}}
//creates a new template object from scratch
function doTransformFunnel(transforms, diff, jsonsA, jsonsB) {
  const tokens = [];
  let types = "";
  const jsonsB2 = { ...jsonsB };
  const jsonsA2 = { ...jsonsA };

  main: for (const { a, b, typea, typeb } of diff) {
    if (!b) {
      tokens.push(...a);
      types += typea;
    } else if (typea === typeb) {
      const renames = mapProperties(typea, a, b);
      if (!renames)
        return false;
      jsonsB2 = renameMultipleJsons(renames, jsonsB2);
    } else {
      for (const transform of transforms) {
        const res = transform(a, b, typea, typeb, jsonsA, jsonsB2);
        if (!res)
          continue;
        const { jsonsA_renameMap, jsonsB2_renameMap, tokens: tokens2, types: types2 } = res;
        if (jsonsA_renameMap) jsonsA2 = renameMultipleJsons(jsonsA_renameMap, jsonsA2);
        if (jsonsB2_renameMap) jsonsB2 = renameMultipleJsons(jsonsB2_renameMap, jsonsB2);
        tokens.push(...tokens2);
        types += types2;
        continue main;
      }
      return false;
    }
  }
  const jsons = { ...jsonsA2, ...jsonsB2 };
  Object.freeze(jsons);
  for (let k in jsons)
    Object.freeze(jsons[k]);
  tokens = Object.freeze(tokens);
  return Object.freeze({ tokens, types, jsons });
}


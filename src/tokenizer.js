// step 3.a
// Tokenize HTML and normalize empty attributes
const TAGnoTAG = /([^<]+)|(<!--)(.*)(-->)|(<\/?[a-z][a-z-_0-9]*)(\s*)(\/?>)|(<\/?[a-z][a-z-_0-9]*(?:"[^"]*"|'[^']*'|[^>])+(?:\/?>|$))|(<[^>]+>)/gis;
const COMPLEX_TAG = /(<\/?[a-z][a-z-_0-9]*)|(\/?>)|(\s+)|([a-z:_][a-z:_0-9.-]*)(?:(=)('[^']*'|"[^"]*"|[^\s"'`=<>]+))?|./gi;

export function tokenize(html) {
  const tokens = [];
  let types = "";
  for (const [unit, text, commentStart, comment, commentEnd, plainStart, plainSpace, plainEnd, tag, strangeTag] of html.trim().matchAll(TAGnoTAG)) {
    if (plainStart)
      tokens.push(plainStart, plainSpace, plainEnd), (types += "tst");
    else if (text)
      tokens.push(text), (types += "W");
    else if (commentStart, comment, commentEnd)
      tokens.push(commentStart, comment, commentEnd), (types += "cUc");
    else if (strangeTag)
      tokens.push(strangeTag), (types += "X");
    else if (tag)
      for (const [u, start, end, space, name, e = "=", value = '""', error] of unit.matchAll(COMPLEX_TAG))
        (start || end) ? (tokens.push(u), (types += "t")) :
          space ? (tokens.push(space), (types += "s")) :
            name ? (tokens.push(name, e, value), (types += "n=V")) :
              (tokens.push(error), (types += "E"));
  }
  return { tokens, types };
}
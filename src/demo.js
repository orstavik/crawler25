const DB = await (await fetch(new URL('./demo.json', import.meta.url))).json();

function getByRef(ref) {
  const [table, id] = ref.split('/');
  return DB[table].find(item => item.id == id);
}

const URLS = [];
for (const table in DB) {
  for (const item of DB[table])
    URLS.push(`${table}/${item.id}`);
  URLS.push(`${table}/unknown`);
}

function smallBook(book) {
  const authors = book.author.map(getByRef).map(a => `<a href="/author/${a.id}">${a.name}</a>`).join(', ');
  return `
    <div>
      <h2><a href="/book/${book.id}">${book.title}</a> (${book.year})</h2>
      <img src="${book.cover_url}" alt="Cover of ${book.title}" />
      <p>Author${book.author.length > 1 ? 's' : ''}: ${authors}</p>
    </div>
  `;
}

function renderHomePage(page) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${page.title}</title>
      </head>
      <body uid="page${page.id}">
        <h1>Book List</h1>
        <hr />
        <h2>${page.description}</h2>
        <div>
        ${page.books.map(getByRef).map(smallBook).join('')}
        </div>
      </body>
    </html>
  `;
}

function renderBookPage(book) {
  const authors = book.author.map(getByRef).map(a => `<a href="/author/${a.id}">${a.name}</a>`).join(', ');
  const publisher = getByRef(book.publisher[0]);
  return `
    <!DOCTYPE html>
    <html>
      <body uid="book-${book.id}">
        <h1>${book.title} (${book.year})</h1>
        <img src="${book.cover_url}" alt="Cover of ${book.title}" />
        <p>Author${book.author.length > 1 ? 's' : ''}: ${authors}</p>
        <p>Publisher: <a href="/publisher/${publisher.id}">${publisher.name}</a></p>
        <a href="/">Back to list</a>
      </body>
    </html>
  `;
}

function renderAuthorPage(author) {
  const books = DB.book.filter(b => b.author[0] === `author/${author.id}`);
  const bookLinks = books.map(b => `<li><a href="/book/${b.id}">${b.title}</a></li>`).join('');

  return `
    <!DOCTYPE html>
    <html>
      <body uid="author-${author.id}">
        <h1>${author.name}</h1>
        <img src="${author.image_url}" alt="${author.name}" />
        <p>Country: ${author.country}</p>
        <h3>Books</h3>
        <ul>
          ${bookLinks}
        </ul>
        <a href="/">Back to list</a>
      </body>
    </html>
  `;
}

function renderPublisherPage(publisher) {
  const books = DB.book.filter(b => b.publisher[0] === `publisher/${publisher.id}`);
  const bookLinks = books.map(b => `<li><a href="/book/${b.id}">${b.title}</a></li>`).join('');

  return `
    <!DOCTYPE html>
    <html>
      <body uid="publisher-${publisher.id}">
        <h1>${publisher.name}</h1>
        <img src="${publisher.logo_url}" alt="${publisher.name} logo" />
        <p>Country: ${publisher.country}</p>
        <h3>Books Published</h3>
        <ul>
          ${bookLinks}
        </ul>
        <a href="/">Back to list</a>
      </body>
    </html>
  `;
}

const RENDERERS = {
  page: renderHomePage,
  book: renderBookPage,
  author: renderAuthorPage,
  publisher: renderPublisherPage
};


function generateSitePages(urls, renderers) {
  const res = {};
  for (const url of urls) {
    const [table, id] = url.split('/');
    const entity = getByRef(url);
    res[url] = entity ? renderers[table](entity) :
      `<!DOCTYPE html>
    <html><body><h1>Page not found</h1></body></html>`;
  }
  return res;
}

export const pages = generateSitePages(URLS, RENDERERS);
// console.log(JSON.stringify(pages, null, 2));

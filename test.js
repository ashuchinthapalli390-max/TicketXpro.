import https from "https";

async function getPoster(title) {
  return new Promise((resolve) => {
    https.get(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(title)}`, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId !== "-1" && pages[pageId].original) {
            console.log(`${title} | ${pages[pageId].original.source}`);
            resolve(pages[pageId].original.source);
          } else {
            console.log(`${title} | NOT FOUND`);
            resolve(null);
          }
        } catch { resolve(null); }
      });
    }).on("error", () => resolve(null));
  });
}

async function main() {
  const titles = [
    "Inception",
    "Kalki 2898 AD",
    "Aadujeevitham",
    "Sathi Leelavathi",
    "Mortal Kombat (1995 film)",
    "The Devil Wears Prada (film)",
    "Ninnu Kori",
    "Kanchana 2",
    "Drishyam 2",
    "Star Wars: The Force Awakens"
  ];
  for (const t of titles) { await getPoster(t); }
}
main();

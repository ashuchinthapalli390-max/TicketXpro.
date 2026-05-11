import https from "https";

async function getPoster(title) {
  return new Promise((resolve) => {
    https.get(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(title)}`, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json && json[0] && json[0].show && json[0].show.image) {
            console.log(`${title} | ${json[0].show.image.original}`);
            resolve(json[0].show.image.original);
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
    "Kalki",
    "Aadujeevitham",
    "Mortal Kombat",
    "Prada",
    "Star Wars",
    "Drishyam"
  ];
  for (const t of titles) { await getPoster(t); }
}
main();

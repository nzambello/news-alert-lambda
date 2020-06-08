const Parser = require("rss-parser");
const uniqBy = require("lodash.uniqby");
const parser = new Parser();

const rssFeeds = {
  ANSA: [
    "https://www.ansa.it/sito/ansait_rss.xml",
    "https://www.ansa.it/sito/notizie/politica/politica_rss.xml"
  ],
  Repubblica: ["http://www.repubblica.it/rss/homepage/rss2.0.xml"],
  Open: ["https://www.open.online/feed/"],
  "Il Corriere": ["http://xml2.corriereobjects.it/rss/homepage.xml"],
  "Il Sole 24 Ore": ["https://www.ilsole24ore.com/rss/italia.xml"],
  "Il Giornale": ["https://www.ilgiornale.it/feed.xml"],
  Internazionale: ["https://www.internazionale.it/sitemaps/rss.xml"],
  "Il Manifesto": ["https://ilmanifesto.it/feed/"]
};

exports.handler = async function(event) {
  const sources =
    event &&
    event.multiValueQueryStringParameters &&
    event.multiValueQueryStringParameters.sources
      ? event.multiValueQueryStringParameters.sources.filter(
          source => rssFeeds[source]
        )
      : Object.keys(rssFeeds);

  const feed = await Promise.all(
    sources.map(async key => ({
      title: key,
      data: uniqBy(
        (
          await Promise.all(
            rssFeeds[key].map(async feedURL => {
              let feed = await parser.parseURL(feedURL);
              return feed.items.map(item => ({
                ...item,
                feedURL,
                feedTitle: feed.title,
                feedKey: key
              }));
            })
          )
        ).flat(),
        "link"
      )
    }))
  );

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE"
    },
    body: JSON.stringify(feed)
  };
};

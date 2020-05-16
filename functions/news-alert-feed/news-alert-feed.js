const Parser = require("rss-parser");
const uniqBy = require("lodash.uniqby");
const parser = new Parser();

const rssFeeds = {
  ANSA: [
    "https://www.ansa.it/sito/ansait_rss.xml",
    // 'https://www.ansa.it/sito/notizie/cronaca/cronaca_rss.xml',
    "https://www.ansa.it/sito/notizie/politica/politica_rss.xml",
    "https://www.ansa.it/sito/notizie/topnews/topnews_rss.xml",
    "https://www.ansa.it/emiliaromagna/notizie/emiliaromagna_rss.xml",
    "https://www.ansa.it/liguria/notizie/liguria_rss.xml"
  ],
  Repubblica: [
    "http://www.repubblica.it/rss/homepage/rss2.0.xml"
    // 'http://www.repubblica.it/rss/esteri/rss2.0.xml',
    // 'http://www.repubblica.it/rss/economia/rss2.0.xml',
    // 'http://www.repubblica.it/rss/esteri/rss2.0.xml',
    // 'http://www.repubblica.it/rss/solidarieta/rss2.0.xml',
    // 'http://www.repubblica.it/rss/ambiente/rss2.0.xml'
  ]
};

exports.handler = async function() {
  const feed = await Promise.all(
    Object.keys(rssFeeds).map(async key => ({
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

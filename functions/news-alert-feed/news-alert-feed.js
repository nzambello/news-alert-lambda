const Parser = require('rss-parser')
const parser = new Parser()

const rssFeeds = {
  ansa: [
    'https://www.ansa.it/sito/ansait_rss.xml',
    'https://www.ansa.it/sito/notizie/cronaca/cronaca_rss.xml',
    'https://www.ansa.it/sito/notizie/politica/politica_rss.xml',
    'https://www.ansa.it/sito/notizie/topnews/topnews_rss.xml',
    'https://www.ansa.it/emiliaromagna/notizie/emiliaromagna_rss.xml',
    'https://www.ansa.it/liguria/notizie/liguria_rss.xml'
  ]
}

exports.handler = async function () {
  const feed = await Promise.all(
    Object.keys(rssFeeds).map(async (key) => ({
      title: key,
      data: (
        await Promise.all(
          rssFeeds[key].map(async (feedURL) => {
            let feed = await parser.parseURL(feedURL)
            return feed.items.map((item) => ({
              ...item,
              feedURL,
              feedTitle: feed.title
            }))
          })
        )
      ).flat()
    }))
  )

  return {
    statusCode: 200,
    body: JSON.stringify(feed)
  }
}

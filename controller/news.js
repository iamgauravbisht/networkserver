const NewsAPI = require("newsapi");
const newsapi = new NewsAPI("87c3e217160645a09f076c32b697aabc");

module.exports.getHeadlines = async (req, res) => {
  try {
    const data = await newsapi.v2
      .topHeadlines({
        language: "en",
        country: "us",
      })
      .then((response) => {
        return response;
      });
    res.status(200).json({ articles: data.articles });
  } catch (err) {
    console.log(err);
    res.status(400).json({ errors: err });
  }
};

const { postDocument } = require("../model/networkSchemas");

module.exports.createPost = async (req, res) => {
  const { userId, username, post, _id } = req.body;
  if (!userId || !username || !post || !_id) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  try {
    const newPost = await postDocument.create({
      userId,
      username,
      post,
      _id,
      venue: "heaven",
    });
    if (newPost) res.json({ message: "post created successfully" });
  } catch (err) {
    console.log(err);
  }
};

module.exports.getPosts = async (req, res) => {
  const { start, end } = req.body;
  try {
    const result = await postDocument.find();
    const post = result.reverse();
    const posts = post.slice(start, end + 1);
    if (posts) res.json({ posts });
  } catch (err) {
    console.log(err);
  }
};

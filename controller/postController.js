const { postDocument } = require("../model/networkSchemas");

function calculateTimeDifference(targetDate) {
  const currentDate = new Date();

  // Calculate the time difference in milliseconds
  const timeDifference = currentDate.getTime() - targetDate.getTime();

  // Calculate years, days, hours, minutes, and seconds
  const years = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 365.25));
  const days = Math.floor(
    (timeDifference % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24)
  );
  const hours = Math.floor(
    (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

  // Determine the most appropriate unit of time
  if (years > 0) {
    return `${years} Years, ${days} Days`;
  } else if (days > 0) {
    return `${days} Days, ${hours} Hours`;
  } else if (hours > 0) {
    return `${hours} Hours, ${minutes} Minutes`;
  } else if (minutes > 0) {
    return `${minutes} Minutes, ${seconds} Seconds`;
  } else if (seconds > 0) {
    return `${seconds} Seconds`;
  } else {
    return `0 Seconds`;
  }
}

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
    const post = result.reverse().map((post) => {
      return {
        userId: post.userId,
        username: post.username,
        post: post.post,
        time: calculateTimeDifference(post.date),
        likes: post.likes,
        noOfLikes: post.noOfLikes,
        comments: post.comments,
        _id: post._id,
      };
    });
    const posts = post.slice(start, end + 1);
    if (posts) res.json({ posts });
  } catch (err) {
    console.log(err);
  }
};

module.exports.likePost = async (req, res) => {
  const { postId, userId } = req.body;
  if (!postId || !userId) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  try {
    const post = await postDocument.findByIdAndUpdate(
      postId,
      {
        $inc: { noOfLikes: 1 },
        $push: { likes: userId },
      },
      { new: true }
    );
    if (post) res.status(200).json({ message: "liked successfully" });
  } catch (err) {
    res.status(500).json({ message: "internal server error" });
  }
};
module.exports.unlikePost = async (req, res) => {
  const { postId, userId } = req.body;
  if (!postId || !userId) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  try {
    const post = await postDocument.findByIdAndUpdate(
      postId,
      {
        $inc: { noOfLikes: -1 }, // Decrease the number of likes by 1
        $pull: { likes: userId }, // Remove the userId from the likes array
      },
      { new: true }
    );
    if (post) res.status(200).json({ message: "unliked successfully" });
    else res.status(404).json({ message: "Post not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports.postComment = async (req, res) => {
  const { postId, userId, username, comment } = req.body;
  if (!postId || !userId || !username || !comment) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  try {
    const post = await postDocument.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            userId,
            username,
            comment,
          },
        },
      },
      { new: true }
    );
    if (post) res.status(200).json({ message: "commented successfully" });
    else res.status(404).json({ message: "Post not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getComments = async (req, res) => {
  const { postId } = req.body;
  if (!postId) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  try {
    const post = await postDocument.findById(postId);

    if (post) {
      const comments = post.comments
        .map((comment) => {
          return {
            userId: comment.userId,
            username: comment.username,
            comment: comment.comment,
            time: calculateTimeDifference(comment.date),
          };
        })
        .reverse();
      res.status(200).json({ comments });
    } else res.status(404).json({ message: "Post not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

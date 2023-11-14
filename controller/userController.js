const { User } = require("../model/networkSchemas");

const removeDuplicatefromResults = (results) => {
  // console.log("results", results);
  const seen = new Set();
  const filteredResults = results.filter((el) => {
    const duplicate = seen.has(el.email);
    seen.add(el.email);
    return !duplicate;
  });
  // console.log("filteredResults", filteredResults);
  return filteredResults;
};

module.exports.search = async (req, res) => {
  const { name } = req.body;

  try {
    // Use a regular expression to perform a case-insensitive search
    const regex = new RegExp(name, "i");

    // Find matching people in the database
    const results = await User.find({ username: regex });
    const filteredResults = removeDuplicatefromResults(results);
    res.json(filteredResults);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.draft = async (req, res) => {
  const { post, userId } = req.body;
  // Validate request body
  if (!post || !userId) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    // Find the user by ID and update the drafts array
    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { drafts: { post } } },
      { new: true }
    );

    // Handle case where user is not found
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Respond with the updated user document
    res.json({ message: "Draft added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.getDraft = async (req, res) => {
  const { userId } = req.body;
  // Validate request body
  if (!userId) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const drafts = user.drafts.reverse();
    res.json({ drafts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports.deleteDraft = async (req, res) => {
  const { userId, draftId } = req.body;
  // Validate request body
  if (!userId || !draftId) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { drafts: { _id: draftId } },
      },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "Draft deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

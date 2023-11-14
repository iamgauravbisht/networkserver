const { chatDocument } = require("../model/networkSchemas");

module.exports.search = async (req, res) => {
  const { name } = req.body;

  try {
    // Use a regular expression to perform a case-insensitive search
    const regex = new RegExp(name, "i");

    // Find matching people in the database
    const results = await chatDocument.find({ username: regex });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.create = async (details) => {
  try {
    // Create a new document
    const newDocument = await chatDocument.create(details);
    return newDocument;
  } catch (error) {
    console.log(error);
  }
};

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

module.exports.getChat = async ({ user1, user2 }) => {
  //find chat document with user1 and user2 ids if not found create one and return it
  try {
    const chat = await chatDocument.findOne({
      $or: [
        { $and: [{ user1Id: user1 }, { user2Id: user2 }] },
        { $and: [{ user1Id: user2 }, { user2Id: user1 }] },
      ],
    });
    if (chat) {
      return chat;
    } else {
      const newChat = await chatDocument.create({
        user1Id: user1,
        user2Id: user2,
      });
      return newChat;
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports.saveChat = async ({ user1, user2, message }) => {
  if (!message || !user1 || !user2) {
    return console.log("message or user1 or user2 is not defined");
  }
  try {
    const chat = await chatDocument.findOneAndUpdate(
      {
        $or: [
          { $and: [{ user1Id: user1 }, { user2Id: user2 }] },
          { $and: [{ user1Id: user2 }, { user2Id: user1 }] },
        ],
      },
      {
        $push: { arrayOfChat: message },
      },
      { new: true }
    );
    if (chat) {
      return chat;
    }
  } catch (error) {
    console.log(error);
  }
};

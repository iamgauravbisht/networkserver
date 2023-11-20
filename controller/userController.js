const { User } = require("../model/networkSchemas");

async function checkFriendStatus(userId, arrayOfUsers) {
  const user = await User.findById(userId);
  const friendsStatus = user.friendsStatus;

  const updatedArray = arrayOfUsers.map((user) => {
    const friend = friendsStatus.find(
      (friend) => friend.userIdOfSender == user._id
    );

    if (friend) {
      // If a friend is found, return the friend status
      return {
        id: user._id,
        username: user.username,
        isFriend: friend.statusOfRequest,
      };
    } else {
      // If no friend is found, set isFriend to "false"
      return {
        id: user._id,
        username: user.username,
        isFriend: "false",
      };
    }
  });

  return updatedArray;
}

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
  const { name, userId } = req.body;

  try {
    // Use a regular expression to perform a case-insensitive search
    const regex = new RegExp(name, "i");

    // Find matching people in the database
    const results = await User.find({ username: regex });
    //remove duplicate from results
    const filteredResults = removeDuplicatefromResults(results);
    //remove current user from results
    const filteredResults2 = filteredResults.filter(
      (user) => user._id != userId
    );
    //check user is freind or not then add isFriend property
    const updatedResults = await checkFriendStatus(userId, filteredResults2);

    res.json(updatedResults);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
async function updateStatusOfRequest(userId, friendId, status) {
  const user = await User.findById(userId);

  // Check if a friend request already exists
  const existingRequestIndex = user.friendsStatus.findIndex(
    (friend) => friend.userIdOfSender === friendId
  );

  if (existingRequestIndex !== -1) {
    // If a friend request already exists, update its status
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "friendsStatus.$[elem].statusOfRequest": status,
        },
      },
      {
        arrayFilters: [{ "elem.userIdOfSender": friendId }],
        new: true,
      }
    );
    if (!updatedUser) {
      return false;
    }
    return true;
  }

  // If no existing friend request, add a new one
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $push: {
        friendsStatus: { userIdOfSender: friendId, statusOfRequest: status },
      },
    },
    { new: true }
  );

  if (!updatedUser) {
    return false;
  }

  return true;
}
module.exports.sendFreindRequest = async (req, res) => {
  const { userId, friendId } = req.body;
  // Validate request body
  if (!userId || !friendId) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    // Find the user by ID and update the friends array
    const userUpdateSuccess = await updateStatusOfRequest(
      userId,
      friendId,
      "sent"
    );
    const friendUpdateSuccess = await updateStatusOfRequest(
      friendId,
      userId,
      "received"
    );

    // Handle case where user is not found
    if (!userUpdateSuccess) {
      return res
        .status(404)
        .json({ error: "updateStatusOfRequest with userId giving error" });
    }
    if (!friendUpdateSuccess) {
      return res
        .status(404)
        .json({ error: "updateStatusOfRequest with friendId giving error" });
    }

    // Respond with the updated user document
    res.json({ message: "Friend request sent successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
async function addingUsername(arrayWithUserId) {
  const updatedArray = [];
  for (let i = 0; i < arrayWithUserId.length; i++) {
    const user = await User.findById(arrayWithUserId[i].userIdOfSender);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const updatedObject = {
      id: arrayWithUserId[i].userIdOfSender,
      username: user.username,
    };
    updatedArray.push(updatedObject);
  }
  return updatedArray;
}
module.exports.sentFriendRequests = async (req, res) => {
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
    const sentFriendRequests = user.friendsStatus.filter(
      (friend) => friend.statusOfRequest === "sent"
    );
    const updatedList = await addingUsername(sentFriendRequests);
    res.json({ results: updatedList });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports.allFriends = async (req, res) => {
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
    const friends = user.friendsStatus.filter(
      (friend) => friend.statusOfRequest == "true"
    );
    const updatedList = await addingUsername(friends);
    res.json({ results: updatedList });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports.recievedFriendRequestst = async (req, res) => {
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
    const recievedFriendRequests = user.friendsStatus.filter(
      (friend) => friend.statusOfRequest == "received"
    );
    const updatedRecievedFriendRequests = await addingUsername(
      recievedFriendRequests
    );
    res.json({ results: updatedRecievedFriendRequests });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports.acceptFriendRequest = async (req, res) => {
  const { userId, friendId } = req.body;
  // Validate request body
  if (!userId || !friendId) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    // Find the user by ID and update the friends array
    const userUpdateSuccess = await updateStatusOfRequest(
      userId,
      friendId,
      "true"
    );
    const friendUpdateSuccess = await updateStatusOfRequest(
      friendId,
      userId,
      "true"
    );

    // Handle case where user is not found
    if (!userUpdateSuccess) {
      return res
        .status(404)
        .json({ error: "updateStatusOfRequest with userId giving error" });
    }
    if (!friendUpdateSuccess) {
      return res
        .status(404)
        .json({ error: "updateStatusOfRequest with friendId giving error" });
    }

    // Respond with the updated user document
    res.json({ message: "Friend request accepted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports.rejectFriendRequest = async (req, res) => {
  const { userId, friendId } = req.body;
  // Validate request body
  if (!userId || !friendId) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  try {
    // Find the user by ID and update the friends array
    const userUpdateSuccess = await updateStatusOfRequest(
      userId,
      friendId,
      "false"
    );
    const friendUpdateSuccess = await updateStatusOfRequest(
      friendId,
      userId,
      "false"
    );

    // Handle case where user is not found
    if (!userUpdateSuccess) {
      return res
        .status(404)
        .json({ error: "updateStatusOfRequest with userId giving error" });
    }
    if (!friendUpdateSuccess) {
      return res
        .status(404)
        .json({ error: "updateStatusOfRequest with friendId giving error" });
    }

    // Respond with the updated user document
    res.json({ message: "Friend request rejected successfully" });
  } catch (err) {
    console.log(err);
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

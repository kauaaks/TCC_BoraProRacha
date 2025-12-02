const path = require("path");
const fs = require("fs");
const Users = require("../models/user");

async function updateAvatar({ firebaseUid, avatarRelativePath }) {
  const user = await Users.findOne({ firebaseUid });

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  if (
    user.avatar &&
    user.avatar.startsWith("/uploads/avatars/") &&
    user.avatar !== avatarRelativePath
  ) {
    const oldPath = path.join(__dirname, "..", user.avatar);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  user.avatar = avatarRelativePath;
  await user.save();

  return {
    uid: user.firebaseUid,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  };
}

module.exports = {
  updateAvatar,
};

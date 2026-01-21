const User = require("./userModel");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-security.password -security.otp -security.otpExpires"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { _id, email, profile, security } = user;
    const { publicName, firstName, lastName, profilePicture, bio } =
      profile || {};
    const { walletAddress } = security || {};

    res.status(200).json({
      _id,
      email,
      publicName,
      firstName,
      lastName,
      profilePicture,
      bio,
      walletAddress,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { publicName, firstName, lastName, bio, phone, dni, address } =
      req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (!user.profile) {
      user.profile = {};
    }

    // Actualización independiente de cada campo:
    if (publicName !== undefined) {
      user.profile.publicName = publicName;
    }
    if (firstName !== undefined) {
      user.profile.firstName = firstName;
    }
    if (lastName !== undefined) {
      user.profile.lastName = lastName;
    }
    if (bio !== undefined) {
      user.profile.bio = bio;
    }
    if (phone !== undefined) {
      user.profile.phone = phone;
    }
    if (dni !== undefined) {
      user.profile.dni = dni;
    }
    if (address !== undefined) {
      user.profile.address = address;
    }

    await user.save();

    res.status(200).json({
      message: "Perfil actualizado correctamente.",
      profile: user.profile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

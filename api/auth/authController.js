const User = require("../users/userModel");
const { sendOTP } = require("../utils/mailer");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const ethers = require("ethers");
const { encryptPrivateKey } = require("../utils/encryption");
const axios = require("axios");

exports.sendOTP = async (req, res) => {
  const { email, captcha_token } = req.body;
  if (!email)
    return res
      .status(400)
      .json({ message: "El correo electrónico es obligatorio" });

  if (!captcha_token)
    return res
      .status(400)
      .json({ message: "El token de CAPTCHA es obligatorio" });

  try {
    const recaptchaResponse = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captcha_token,
        },
      }
    );

    if (!recaptchaResponse.data.success) {
      return res.status(400).json({ message: "CAPTCHA inválido" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, security: { otp, otpExpires } });
    } else {
      user.security.otp = otp;
      user.security.otpExpires = otpExpires;
    }

    await user.save();
    await sendOTP(email, otp);

    res.status(200).json({ message: "OTP enviado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error enviando OTP" });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      message: "El correo electrónico y OTP son obligatorios.",
    });
  }

  try {
    let user = await User.findOne({ email });

    if (
      !user ||
      user.security.otp !== otp ||
      user.security.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "OTP inválido o expirado." });
    }

    if (!user.security.walletAddress) {
      const wallet = ethers.Wallet.createRandom();
      const { encryptedData: encryptedPrivateKey, iv: privateKeyIv } =
        encryptPrivateKey(wallet.privateKey, process.env.ENCRYPTION_SECRET);
      const { encryptedData: encryptedMnemonic, iv: mnemonicKeyIv } =
        encryptPrivateKey(
          wallet.mnemonic.phrase,
          process.env.ENCRYPTION_SECRET
        );

      user.security.walletAddress = wallet.address;
      user.security.encryptedPrivateKey = encryptedPrivateKey;
      user.security.privateKeyIv = privateKeyIv;
      user.security.encryptedMnemonic = encryptedMnemonic;
      user.security.mnemonicKeyIv = mnemonicKeyIv;
    }

    user.security.otp = null;
    user.security.otpExpires = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        walletAddress: user.security.walletAddress,
        profile: {
          firstName: user.profile?.firstName || "",
          lastName: user.profile?.lastName || "",
          bio: user.profile?.bio || "",
          profilePicture: user.profile?.profilePicture || "",
          publicName: user.profile?.publicName || "",
          address: user.profile?.address || "",
          phone: user.profile?.phone || "",
          dni: user.profile?.dni || "",
        },
        manglaiCompanyId: user.manglaiCompanyId,
      },
    });
  } catch (error) {
    console.error("Error verificando OTP:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

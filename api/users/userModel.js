import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phone: String,
  dni: String,
  address: String,
  bio: String,
  profilePicture: { type: String, default: "" },
  publicName: String,
});

const SecuritySchema = new mongoose.Schema({
  password: String,
  otp: String,
  otpExpires: Date,
  walletAddress: { type: String, unique: true, sparse: true },
  encryptedPrivateKey: String,
  privateKeyIv: String,
  encryptedMnemonic: String,
  mnemonicKeyIv: String,
});

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    profile: ProfileSchema,
    security: SecuritySchema,
    manglaiCompanyId: String,
  },
  { timestamps: true },
);

export default mongoose.model("User", UserSchema);

// const mongoose = require("mongoose");

// const ProfileSchema = new mongoose.Schema({
//   firstName: { type: String, trim: true },
//   lastName: { type: String, trim: true },
//   phone: { type: String, trim: true },
//   dni: { type: String, trim: true },
//   address: { type: String, trim: true },
//   bio: { type: String, trim: true },
//   profilePicture: { type: String, default: "" },
//   publicName: { type: String, trim: true },
// });

// const SecuritySchema = new mongoose.Schema({
//   password: { type: String },
//   otp: { type: String },
//   otpExpires: { type: Date },
//   walletAddress: { type: String, unique: true, sparse: true },
//   encryptedPrivateKey: { type: String },
//   privateKeyIv: { type: String },
//   encryptedMnemonic: { type: String },
//   mnemonicKeyIv: { type: String },
// });

// const UserSchema = new mongoose.Schema(
//   {
//     email: { type: String, required: true, unique: true },
//     profile: ProfileSchema,
//     security: SecuritySchema,
//     manglaiCompanyId: { type: String },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", UserSchema);

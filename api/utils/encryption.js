import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";

export const encryptPrivateKey = (text, secret) => {
  const iv = crypto.randomBytes(16);

  const key = crypto.createHash("sha256").update(secret).digest();

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
  };
};

// const crypto = require("crypto");

// function encryptPrivateKey(privateKey, passphrase) {
//   // Derivar una clave de 32 bytes usando SHA-256
//   const key = crypto.createHash("sha256").update(passphrase).digest();

//   const iv = crypto.randomBytes(16); // Generar IV aleatorio
//   const cipher = crypto.createCipheriv("aes-256-ctr", key, iv);

//   let encryptedData = cipher.update(privateKey, "utf8", "hex");
//   encryptedData += cipher.final("hex");

//   return { encryptedData, iv: iv.toString("hex") };
// }

// module.exports = { encryptPrivateKey };

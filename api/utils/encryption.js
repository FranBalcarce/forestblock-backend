const crypto = require("crypto");

function encryptPrivateKey(privateKey, passphrase) {
  // Derivar una clave de 32 bytes usando SHA-256
  const key = crypto.createHash("sha256").update(passphrase).digest();

  const iv = crypto.randomBytes(16); // Generar IV aleatorio
  const cipher = crypto.createCipheriv("aes-256-ctr", key, iv);

  let encryptedData = cipher.update(privateKey, "utf8", "hex");
  encryptedData += cipher.final("hex");

  return { encryptedData, iv: iv.toString("hex") };
}

module.exports = { encryptPrivateKey };

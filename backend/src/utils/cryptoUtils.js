const CryptoJS = require('crypto-js');
require('dotenv').config();

const SECRET_KEY = process.env.CRYPTO_SECRET_KEY;

const encryptSKU = (sku) => {
  return CryptoJS.AES.encrypt(sku, SECRET_KEY).toString();
};

const decryptSKU = (encryptedSku) => {
  const bytes = CryptoJS.AES.decrypt(encryptedSku, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = {
  encryptSKU,
  decryptSKU
}; 
const qr = require('qr-image');
const createKeccakHash = require('keccak');
const sha3 = require('js-sha3');
const privateToAccount = require('ethjs-account').privateToAccount;
const chabi = 'kab00t4r';

const createEthaddress = (email) => {
  const emailHash = '0x'+createKeccakHash('keccak256').update(email).digest('hex');
  const ethAddress = privateToAccount(sha3.keccak256(chabi + emailHash)).address.toLowerCase();
  console.log("Ethaddress: ", ethAddress)
  return ethAddress;
}

const tollInfoHashes = (document_id, tollPricing) => {
    const tollData = document_id+";"+tollPricing;
    const tollInfoHash = '0x'+createKeccakHash('keccak256').update(tollData).digest('hex');
    console.log("Toll info hash: ", tollInfoHash);
    return tollInfoHash;
}

const userInfoHashes = (licence_id) => {
    const userInfoHash = '0x'+createKeccakHash('keccak256').update(licence_id).digest('hex');
    console.log("User info hash: ", userInfoHash);
    return userInfoHash;
}

const createHashes = (data) => {
    const dataHash = '0x'+createKeccakHash('keccak256').update(data).digest('hex');
    console.log("Data Hash: ", dataHash);
    return dataHash;
}

const generateTollQR = (ethaddress, data) => {
    let obj = {ethaddress, data}
    obj = JSON.stringify(obj);
    qr_svg = qr.image(obj, { type: 'svg' });
    return qr_svg;
}

module.exports = {
    createEthaddress,
    tollInfoHashes,
    userInfoHashes,
    createHashes,
    generateTollQR
}

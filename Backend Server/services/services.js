const qr = require('qr-image');
// const { SpaceClient } = require('@fleekhq/space-client');
const fleek = require('@fleekhq/fleek-storage-js');   
const { parse } = require('json2csv');
const createKeccakHash = require('keccak');
const sha3 = require('js-sha3');
const privateToAccount = require('ethjs-account').privateToAccount;
const chabi = 'kab00t4r';
const path = require('path');
const apiKey = process.env.APIKEY;
const apiSecret = process.env.APISECRET;


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

const getPayableAmount = (carNum, tollPrice) => {
    const carTypeCode = carNum[4]+carNum[5];
    if(carTypeCode === "CR"){
        return tollPrice.car;
    }
    else if(carTypeCode === "TR"){
        return tollPrice.truck;
    }
    else if(carTypeCode === "BK"){
        return tollPrice.bike;
    }
    return tollPrice.govt;
}

const createUpdateCSV = async (fields, data, fileName) => {
    let newLine= "\r\n";
    let quote= '';
    let opts = {fields, quote};

    const oldData = await getFileData(`${fileName}.csv`)
    if (oldData !== -1){
      var updateCsv = oldData + parse(data, {header : false, quote: ''}) + newLine;
      console.log('UPDATED DATA: ', updateCsv)
      FleekFileDataUpload(updateCsv,`${fileName}.csv`);
    }
    else{
      var createCsv = parse(data, opts) + newLine;
      console.log('CREATED DATA: ', createCsv)
      FleekFileDataUpload(createCsv,`${fileName}.csv`);
    }
}


  const FleekFileDataUpload = async (data, fileName) => {
    const input = {
      apiKey,
      apiSecret,
      key: fileName,
      data,
    };
  
    try {
      const result = await fleek.upload(input);
      console.log(result);
    } catch(e) {
      console.log('error', e);
    }
  }

  const getFileData = async (fileName) => {
    const key = fileName;
    const input = {
      apiKey,
      apiSecret,
      key,
      getOptions: ['hash']
    };  
    try {
      const hash = await fleek.get(input);
      const input1 = {
          hash
        };
      hash1 = input1.hash;
      console.log(hash1);
        try {
          return await fleek.getFileFromHash(hash1);
          // console.log('result', result1);
        } catch(e) {
          console.log('error', e);
          return -1;
        }
    } catch(e) {
      console.log('error', e);
      return -1;
    }
  }
  

const removeRowInCSV = async (ethaddress, fileName) => {
    let ethaddressToSearchFor = ethaddress;
    const fileData = await getFileData(`${fileName}.csv`)
    console.log("Before IF:", fileData);
    if(fileData !== -1)
    {
        console.log("Inside IF:", fileData);
        let linesExceptFirst = fileData.split('\n');
        console.log(linesExceptFirst)
        let linesArr = linesExceptFirst.map(line=>line.split(','));
        console.log(linesArr)
        let output = linesArr.filter(line => line[1] !== ethaddressToSearchFor).join("\n");
        console.log('OUTPUT: ', output);
        FleekFileDataUpload(output,`${fileName}.csv`);
        // fs.writeFileSync(`${filename}.csv`, output);
    }
    else{
      console.log("File not found!!!")
    };
}

module.exports = {
    createEthaddress,
    tollInfoHashes,
    userInfoHashes,
    createHashes,
    generateTollQR,
    getPayableAmount,
    createUpdateCSV,
    removeRowInCSV
}
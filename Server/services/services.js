const qr = require('qr-image');
// const fs = require('fs-extra');
const fs = require('fs');
const { parse } = require('json2csv');
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

const createUpdateCSV = (fields, data, filename) => {
    let newLine= "\r\n";
    let quote= '';
    let opts = {fields, quote};
    // var toCsv = {
    //     data: data,
    //     fields: fields,
    //     hasCSVColumnTitle: false
    // };

    fs.stat(`${filename}.csv`, function (err, stat) {
        if (err == null) {
            console.log('File exists');

            //write the actual data and end with newline
            var csv = parse(data, {header : false, quote: ''}) + newLine;
            console.log(csv)
            fs.appendFile(`${filename}.csv`, csv, function (err) {
                if (err) throw err;
                console.log('The "data to append" was appended to file!');
            });
        }
        else {
            //write the headers and newline
            console.log('New file, just writing headers');
            var csv = parse(data, opts) + newLine;

            fs.writeFile(`${filename}.csv`, csv, function (err) {
                if (err) throw err;
                console.log('file saved');
            });
        }
    });
}

const removeRowInCSV = (ethaddress, filename) => {
    let ethaddressToSearchFor = ethaddress;
    fs.readFile(`${filename}.csv`, 'utf8', function(err, data)
    {
        if (err)
        {
            throw err
            // check and handle err
        }
        let linesExceptFirst = data.split('\n');
        console.log(linesExceptFirst)
        let linesArr = linesExceptFirst.map(line=>line.split(','));
        console.log(linesArr)
        let output = linesArr.filter(line => line[1] !== ethaddressToSearchFor).join("\n");
        fs.writeFileSync(`${filename}.csv`, output);
    });
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

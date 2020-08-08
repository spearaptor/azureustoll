const qr = require('qr-image');
// const fs = require('fs-extra');
const fs = require('fs');
const { parse } = require('json2csv');
const createKeccakHash = require('keccak');
const sha3 = require('js-sha3');
const privateToAccount = require('ethjs-account').privateToAccount;
const chabi = 'kab00t4r';
const os = require('os');
global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { SpaceClient } = require('@fleekhq/space-client');

// const client = require('./client')
// import client from './client';

// default port exposed by the daemon for client connection is 9998
const client = new SpaceClient({
    url: 'http://0.0.0.0:9998',
    defaultBucket: 'sampleBucketTest_5',
});

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
    // var toCsv = {
    //     data: data,
    //     fields: fields,
    //     hasCSVColumnTitle: false
    // };
    console.log("Before Open File call....");
    const location = await openFile(fileName);
    console.log("After Open File call....", location);
    if(location === null){
        console.log("File do not exist. Creating new file.");

        var csv = parse(data, opts) + newLine;
        console.log("CSV on CREATION: ",csv)
        fs.writeFile(os.tmpdir() + '/' + `${fileName}.csv`, csv, function (err) {
            if (err) throw err;
            console.log('file saved');
        });
        await uploadFile(os.tmpdir() + '/' + `${fileName}.csv`);
        // delete file named 'sample.txt'
        // fs.unlink(os.tmpdir() + '/' + `${fileName}.csv`, function (err) {
        //     if (err) throw err;
        //     // if no error, file has been deleted successfully
        //     console.log('File deleted from local successfully!(in create file)');
        // });
    }
    else{
        var csv = parse(data, {header : false, quote: ''}) + newLine;
        console.log("UPDATED CSV: ",csv)
        fs.appendFile(location, csv, function (err) {
            if (err) throw err;
            console.log('The "data to append" was appended to file!');
        });
        await uploadFile(location);
        // fs.unlink(location, function (err) {
        //     if (err) throw err;
        //     // if no error, file has been deleted successfully
        //     console.log('File deleted from local successfully!(in update file)');
        // });
    }

    // fs.stat(`${filename}.csv`, function (err, stat) {
    //     if (err == null) {
    //         console.log('File exists');

    //         //write the actual data and end with newline
    //         var csv = parse(data, {header : false, quote: ''}) + newLine;
    //         console.log(csv)
    //         fs.appendFile(`${filename}.csv`, csv, function (err) {
    //             if (err) throw err;
    //             console.log('The "data to append" was appended to file!');
    //         });
    //     }
    //     else {
    //         //write the headers and newline
    //         console.log('New file, just writing headers');
    //         var csv = parse(data, opts) + newLine;

    //         fs.writeFile(`${filename}.csv`, csv, function (err) {
    //             if (err) throw err;
    //             console.log('file saved');
    //         });
    //     }
    // });
}

const removeRowInCSV = async (ethaddress, fileName) => {
    let ethaddressToSearchFor = ethaddress;
    console.log("Before Open File call....")
    const location = await openFile(fileName);
    console.log("After Open File call....", location);
    if(location === null){
        console.log("File not found.")
    }
    else{
        fs.readFile(location, 'utf8', function(err, data)
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
            console.log("CSV after DELETION", output);
            fs.writeFileSync(location, output);
        });
        await uploadFile(location);
        // fs.unlink(location, function (err) {
        //     if (err) throw err;
        //     // if no error, file has been deleted successfully
        //     console.log('File deleted from local successfully!(in remove row file)');
        // });
    }
}

const openFile = async (fileName) => {
    const dirRes = await client.listDirectories({
        // bucket,
    });

    const entriesList = dirRes.getEntriesList();
    let reqFile = null;

    entriesList.forEach((entry) => {
        if(entry.getName() === `${fileName}.csv`){
            console.log(entry.getPath());
            console.log(entry.getName());
            console.log(entry.getIsdir());
            console.log(entry.getCreated());
            console.log(entry.getUpdated());
            console.log(entry.getIpfshash());
            console.log(entry.getSizeinbytes());
            console.log(entry.getFileextension());
            reqFile = entry;
        }
    });
    if(reqFile === null){
        return null;
    }

    const openFileRes = await client.openFile({
        // bucket,
        path: reqFile.getPath(),
    });

    const location = openFileRes.getLocation();
    console.log(location); // "/path/to/the/copied/file"
    return location;
}

const uploadFile = (location) => {
    const stream = client.addItems({
        targetPath: '/', // path in the bucket to be saved
        sourcePaths: [location]      //[`‪D:/Endpoint/${fileName}.csv`]
    });

    stream.on('data', (data) => {
        console.log('DATA: ', data);
    });

    stream.on('error', (error) => {
        console.error('ERROR: ', error);
    });

    stream.on('end', () => {
        console.log('END');
    })
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

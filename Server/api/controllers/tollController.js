const request = require('request');
const axios = require('axios');
const config = require('./../../config.js');
const {
    createEthaddress,
    tollInfoHashes,
    userInfoHashes,
    createHashes,
    generateTollQR,
    getPayableAmount,
    createUpdateCSV
    } = require('./../../services/services');

const userFields = ['Email', 'Ethaddress', 'LicenceId', 'AccountVerified'];
const tollFields = ['Email', 'Ethaddress', 'DocumentId', 'Pricing', 'AccountApproved'];

const tokenInstance = axios.create({
	baseURL: config.apiPrefix + config.contractAddress,
	timeout: 5000,
	headers: {'X-API-KEY': config.apiKey}
});

const auditInstance = axios.create({
	baseURL: config.apiPrefix + config.auditContractAddress,
	timeout: 5000,
	headers: {'X-API-KEY': config.apiKey}
});

const erc20Mintable = axios.create({
    baseURL : config.apiPrefix + config.erc20minContractAddress,
    timeout: 5000,
	headers: {'X-API-KEY': config.apiKey}
})

// Create User Account By Email
exports.create_user = function(req, res) {
    const email = req.body.emailAddress;
    const licenceId = req.body.licence;
    const userEthaddress = createEthaddress(email);
    const userEmailHash = createHashes(email);
    const userInfoHash = userInfoHashes(licenceId);
    // console.log("POST REQUEST", req.body.emailAddress, req.body.licence, req.body);
    tokenInstance.post('/addUserByEmail', {
        ethAddress: userEthaddress,
        emailHash: userEmailHash,
        userInfoHash: userInfoHash
    })
    .then(function (response) {
        const data = response.data;
        data["ethAddress"] = userEthaddress;
        console.log("RESPONSE FROM API", data);
        let userFileData = {
            'Email' : email,
            'Ethaddress' : userEthaddress,
            'LicenceId' : licenceId,
            'AccountVerified' : '1'
        }//1 for approved and 0 for yet to approve and -1 for rejected.
        createUpdateCSV(userFields, userFileData, "userData");
        console.log( "UserCSV:",userFileData);
        res.send(data);
    })
    .catch(function (error) {
        console.log("ERRROR STARTS HERE::\n",error.response.data);
        console.log("\nERROR ENDS HERE")
        res.status(error.response.status);
        res.send(error.response.data)
    })

}

// Create Toll By Email
exports.create_toll = function(req, res) {
    const tollEthaddress = createEthaddress(req.body.emailAddress);
    const tollEmailHash = createHashes(req.body.emailAddress);
    const tollInforHash = tollInfoHashes(req.body.documentId, req.body.tollPricing);
    const qr = generateTollQR(tollEthaddress, req.body.tollPricing);
        tokenInstance.post('/addTollByEmail', {
            ethAddress: tollEthaddress,
            emailHash: tollEmailHash,
            tollInfoHash: tollInforHash
        })
        .then(function (response) {
            const data = response.data;
            data["ethAddress"] = tollEthaddress;
            let tollFileData = {
                'Email'         : req.body.emailAddress,
                'Ethaddress'    : tollEthaddress,
                'DocumentId'    : req.body.documentId,
                'Pricing'       : req.body.tollPricing,
                'AccountApproved':'1',
            }//1 for approved and 0 for yet to approve and -1 for rejected.
            createUpdateCSV(tollFields, tollFileData, "TollData")
            console.log("RESPONSE FROM API", data, tollFileData);
            res.type('svg');
            qr.pipe(res);
        })
        .catch(function (error) {
            console.log("ERRROR STARTS HERE::\n",error.response.data);
            console.log("\nERROR ENDS HERE")
            res.status(error.response.status);
            res.send(error.response.data)
        })
    }


//REVOKE USER Account
exports.revoke_user = function(req, res) {
    const userEthaddress = req.body.ethAddress;
    tokenInstance.post('/revokeUser', {
        ethAddress  : userEthaddress
    })
    .then(function (response) {
        const data = response.data;
        console.log(data);
        // if (data.success){
        //     console.log('User '+ ethaddress+' By Email added');
        // }
        res.send(data)
    })
    .catch(function (error) {
        console.log("ERRROR STARTS HERE::\n",error.response.data);
        console.log("\nERROR ENDS HERE")
        res.status(error.response.status);
        res.send(error.response.data)
    })
}

//REVOKE toll Account
exports.revoke_toll = function(req, res) {
    const tollEthaddress = req.body.ethAddress;
    tokenInstance.post('/revokeToll', {
        ethAddress  : tollEthaddress
    })
    .then(function (response) {
        const data = response.data;
        console.log(data);
        // if (data.success){
        //     console.log('User '+ ethaddress+' By Email added');
        // }
        res.send(data)
    })
    .catch(function (error) {
        console.log("ERRROR STARTS HERE::\n",error.response.data);
        console.log("\nERROR ENDS HERE")
        res.status(error.response.status);
        res.send(error.response.data)
    })
}

//mint for user
exports.mint = function(req, res) {
    const userEthaddress = req.body.ethAddress;
    const mintAmount = req.body.amount;
    tokenInstance.post('/mint', {
        account: userEthaddress,
        amount: mintAmount
    })
    .then(function (response) {
        const data = response.data;
        console.log(data);
        res.send(data)
    })
    .catch(function (error) {
        console.log("ERRROR STARTS HERE::\n",error.response.data);
        console.log("\nERROR ENDS HERE")
        res.status(error.response.status);
        res.send(error.response.data)
    })
}

// Check user balance in ERC20Mintable
exports.balanceOf = function(req, res) {
    const userEthaddress = req.body.ethAddress;
    const erc20MintableBalance = axios.create({
        baseURL : config.apiPrefix + config.erc20minContractAddress + '/balanceOf/' + userEthaddress,
        timeout: 5000,
    })
    erc20MintableBalance.get()
    .then(function (response) {
        console.log(response.data);
        res.send(response.data)
    })
    .catch(function (error) {
        res.status(error.response.status);
        res.send(error)
    })
}

// Paying toll tax
exports.pay_toll = function(req, res) {
    const userEthaddress = createEthaddress(req.body.UseremailAddress);
    const tollEthaddress = createEthaddress(req.body.TollemailAddress);
    const transferAmount = getPayableAmount(req.body.UserCarNumber, req.body.TollPricing);
        tokenInstance.post('/payTollTax', {
            from: userEthaddress,
            to: tollEthaddress,
            amount: transferAmount
        })
        .then(function (response) {
            const data = response.data;
            data["AmountPayed"] = transferAmount;
            console.log("RESPONSE FROM API", data);
            res.send(data);
        })
        .catch(function (error) {
            console.log("ERRROR STARTS HERE::\n",error.response.data);
            console.log("\nERROR ENDS HERE");
            res.status(error.response.status);
            res.send(error.response.data)
        })
    }

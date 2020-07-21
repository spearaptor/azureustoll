// Require Statements
const axios = require('axios');
const WebSocket = require('ws');
const config = require('./config.js');
// const util = require('ethjs-util');
const sha3 = require('js-sha3');
const privateToAccount = require('ethjs-account').privateToAccount;
const createKeccakHash = require('keccak');
const chabi = 'kab00t4r';

// Config Checks
if (!config.apiKey || !config.contractAddress || !config.auditContractAddress){
	console.error('Fill up all values in config.js');
	process.exit(0);
}

// Declarations
var myArgs = process.argv.slice(2);
var gotEvent;
const ws = new WebSocket(config.wsUrl);

const licenseId = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 2) + Math.floor(Math.pow(10,12) + Math.random() * 9 * Math.pow(10,11));
const userInfoHash = '0x'+createKeccakHash('keccak256').update(licenseId).digest('hex');
let toll = {
    car: 20,
    bike: 10,
    truck: 40,
    govt: 0
}
const tollId = String(Math.floor(Math.pow(10,0) + Math.random() * 9 * Math.pow(10,2)));
const tollInfoHash = '0x'+createKeccakHash('keccak256').update(tollId).digest('hex');

const useremailHash = '0x'+createKeccakHash('keccak256').update(myArgs[0]).digest('hex');
const tollemailHash = '0x'+createKeccakHash('keccak256').update(myArgs[1]).digest('hex');
const depositAmount = myArgs[2];
const transferAmount = myArgs[3];
const userAddress = privateToAccount(sha3.keccak256(chabi+useremailHash)).address.toLowerCase();
const tollAddress = privateToAccount(sha3.keccak256(chabi+tollemailHash)).address.toLowerCase();
console.log('useremailhash: '+useremailHash);
console.log('tollemailhash: '+tollemailHash);
console.log('userInfoHash: '+userInfoHash);
console.log('tollinforhash: '+tollInfoHash);

// const userFormdataHash = '0x3d1feaf0ab633596300e5042b40aadf5e0e078d8de3821bd4c4b93de6154d71f';
// const uuidHash = '0x4f029d61a07b04b5494114b1efc0e34c6e3ab691f9afbdbdadde7446623c78a8';
var userflag = false;
var tollflag = false;

// Amount Checks
console.log('minting '+depositAmount+' tokens to user');
if (depositAmount < transferAmount){
	console.log('Insufficient balance; mint more tokens to continue');
	process.exit(0);
}
console.log('sending '+transferAmount+' tokens from user: '+userAddress+' to toll: '+tollAddress);


// Token Instance
const tokenInstance = axios.create({
	baseURL: config.apiPrefix + config.contractAddress,
	timeout: 5000,
	headers: {'X-API-KEY': config.apiKey}
});

// Mintable Instance
const mintableInstance = axios.create({
	baseURL: config.apiPrefix + config.erc20minContractAddress,
	timeout: 5000,
	headers: {'X-API-KEY': config.apiKey}
});

// Audit Instance
const auditInstance = axios.create({
	baseURL: config.apiPrefix + config.auditContractAddress,
	timeout: 5000,
	headers: {'X-API-KEY': config.apiKey}
});

// WebSocket > open
ws.on('open', function open() {
	ws.send(JSON.stringify({
		'command': 'register',
		'key': config.apiKey
	}));
});

// WebSocket > message
ws.on('message', function incoming(data){
    data = JSON.parse(data);

    // Checking apiKey
    if (data.command == 'register:nack'){
		console.error('Bad apiKey set!');
    }

    if (data.command == 'register:ack'){
        console.log('apiKey Acknowledged');

        // USER PROCESS
       // Adding User By Email
        tokenInstance.post('/addUserByEmail', {
            ethAddress: userAddress,
            emailHash: useremailHash,
            userInfoHash: userInfoHash
        })
        .then(function (response) {
			console.log(response.data);
			if (response.data.success){
                console.log('User '+ userAddress+' By Email added');
                // Minting tokens for User
                tokenInstance.post('/mint', {
                    account: userAddress,
                    amount: depositAmount
                })
                .then(function (response) {
                    console.log(response.data);
                    if (response.data.success){
                        console.log(depositAmount+' tokens minted to user');
                        userflag = true;
                    }
                })
                .catch(function (error) {
                    if (error.response.data){
                        console.log(error.response.data);
                        if (error.response.data.error == 'unknown contract'){
                            console.error('You filled in the wrong contract address!');
                        }
                        if (error.response.data.error == 'Transaction execution will fail with supplied arguments'){
                            console.error('Minting failed for user');
                        }
                    } else {
                        console.log(error.response);
                    }
                    process.exit(0);
                });
			}
		})
		.catch(function (error) {
			if (error.response.data){
				console.log(error.response.data);
				if (error.response.data.error == 'unknown contract'){
					console.error('You filled in the wrong contract address!');
				}
				if (error.response.data.error == 'Transaction execution will fail with supplied arguments'){
					console.error('Adding user Failed; Check email and details');
				}
			} else {
				console.log(error.response);
			}
			process.exit(0);
        });

        // TOLL PROCESS
       // Adding Toll By Email
        tokenInstance.post('/addTollByEmail', {
                ethAddress: tollAddress,
                emailHash: tollemailHash,
                tollInfoHash: tollInfoHash
            })
            .then(function (response) {
                console.log(response.data);
                if (response.data.success){
                    console.log('Toll '+ tollAddress+' By Email added');
                    tollflag = true;
                }})
            .catch(function (error) {
                if (error.response.data){
                    console.log(error.response.data);
                    if (error.response.data.error == 'unknown contract'){
                        console.error('You filled in the wrong contract address!');
                    }
                    if (error.response.data.error == 'Transaction execution will fail with supplied arguments'){
                        console.error('Adding toll Failed; Check email and details');
                    }
                } else {
                    console.log(error.response);
                }
                process.exit(0);
            });

            setTimeout(function(){
                if (userflag==true && tollflag==true){
                    // Paying toll plaza from user 
                    console.log(userflag, tollflag);
                    tokenInstance.post('/payTollTax', {
                        from: userAddress,
                        to: tollAddress,
                        amount: transferAmount
                    })
                    .then(function (response) {
                        console.log(response.data);
                        if (response.data.success){
                            console.log('Toll tax of '+transferAmount+' paid');
                        }
                    })
                    .catch(function (error) {
                        if (error.response.data){
                            console.log(error.response.data);
                            if (error.response.data.error == 'unknown contract'){
                                console.error('You filled in the wrong contract address!');
                            }
                            if (error.response.data.error == 'Transaction execution will fail with supplied arguments'){
                                console.error('Payment failed');
                            }
                        } else {
                            console.log(error.response);
                        }
                        process.exit(0);
                    });
                }
                }, 10000);

/*    
    // Generating Audit log
    if (data.type == 'event' && data.event_name == 'Transfer'){
        gotEvent = true;
		console.log('Received transfer event confirmation');
        console.log('Writing to audit log contract...');
        
		auditInstance.post('/addAuditLog', {
			_from: data.event_data.from,
			_to: data.event_data.to,
			_value: data.event_data.value,
			_timestamp: data.ctime
		})
		.then(function (response) {
			console.log(response.data);
			if (response.data.success){
                console.log('Audit log has been added');
                console.log('Process complete. Exiting')
			}
			process.exit(0);
		})
		.catch(function (error) {
			if (error.response.data){
				console.log(error.response.data);
				if (error.response.data.error == 'unknown contract'){
					console.error('You filled in the wrong contract address!');
				}
				if (error.response.data.error == 'Transaction execution will fail with supplied arguments'){
					console.error('Could not write to audit log. Check arguments');
				}
			} else {
				console.log(error.response);
			}
			process.exit(0);
		});
*/

// WebSocket > close
ws.on('close', function close() {
	if (gotEvent){
		console.log('WS disconnected');
	} else {
		console.error('WS disconnected before we could receive an event - this should not have happened! Reach out to hello@blockvigil.com.');
    }
    process.exit(0);
});

//Call the script from CLI like this: node tollbotv3.js test@gmail.com test1@gmail.com 30 20

    }
})


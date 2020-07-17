// Require Statements
const axios = require('axios');
const WebSocket = require('ws');
const config = require('./config.js');
const util = require('ethjs-util');
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
// const userAddress = myArgs[0];
// const tollAddress = myArgs[1];


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
// const userInfoHash = '0x92b41f7f7f961424eac187cf4fc7f1753ea9ff83d331d6d4ba7c3fd0a21aa64b';
// const tollInfoHash = '0xcb3f839a125560517ec017f2d36899e53a5346762c5f7bbdecea0b1a131d634c';

const useremailHash = '0x'+createKeccakHash('keccak256').update(myArgs[0]).digest('hex');
const tollemailHash = '0x'+createKeccakHash('keccak256').update(myArgs[1]).digest('hex');
const depositAmount = myArgs[2];
const transferAmount = myArgs[3];

const userAddress = privateToAccount(sha3.keccak256(chabi+useremailHash)).address.toLowerCase();
const tollAddress = privateToAccount(sha3.keccak256(chabi+tollemailHash)).address.toLowerCase();

// const useremailHash = '0x860bf3a1a0662879758e99723326f220355ce1b4a633213b2bc1cd5c1a35c323';
// const tollemailHash = '0x3479f4c9aad67a9fe5e2cc84cb09894262b934e2d68e09d2b01f50ad1d188ed8';
const userFormdataHash = '0x3d1feaf0ab633596300e5042b40aadf5e0e078d8de3821bd4c4b93de6154d71f';
const uuidHash = '0x4f029d61a07b04b5494114b1efc0e34c6e3ab691f9afbdbdadde7446623c78a8';
const ws = new WebSocket(config.wsUrl);
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
                        // Approving tokens for User
                        tokenInstance.post('/approve', {
                            spender: userAddress,
                            value: depositAmount
                        })
                        .then(function (response) {
                            console.log(response.data);
                            if (response.data.success){
                                console.log(depositAmount+' tokens allowed to user to pay toll');
                                // Submit Form for User
                                tokenInstance.post('/submitUserFormData', {
                                    uuidHash: uuidHash,
                                    ethAddress: userAddress,
                                    formdataHash: userFormdataHash
                                })
                                .then(function (response) {
                                    console.log(response.data);
                                    if (response.data.success){
                                        console.log('User has submited the form');
                                        // Verifying the user 
                                        tokenInstance.post('/approveUserForm', {
                                            uuidHash: uuidHash,
                                        })
                                        .then(function (response) {
                                            console.log(response.data);
                                            if (response.data.success){
                                                userflag = true;
                                                console.log('User has been verified');                                               
                                            }
                                        })
                                        .catch(function (error) {
                                            if (error.response.data){
                                                console.log(error.response.data);
                                                if (error.response.data.error == 'unknown contract'){
                                                    console.error('You filled in the wrong contract address!');
                                                }
                                                if (error.response.data.error == 'Transaction execution will fail with supplied arguments'){
                                                    console.error('Verification failed');
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
                                            console.error('User form error; check values');
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
                                    console.error('Allowance failed for user');
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
                    // Submit Form for Toll
                    tokenInstance.post('/submitTollFormData', {
                        uuidHash: uuidHash,
                        ethAddress: tollAddress,
                        formdataHash: userFormdataHash
                    })
                    .then(function (response) {
                        console.log(response.data);
                        if (response.data.success){
                            console.log('Toll has submited the form');
                            // Verifying the toll
                            tokenInstance.post('/approveTollForm', {
                                uuidHash: uuidHash,
                            })
                            .then(function (response) {
                                console.log(response.data);
                                if (response.data.success){
                                    tollflag = true;
                                    console.log('Toll has been verified');
                                }
                            })
                            .catch(function (error) {
                                if (error.response.data){
                                    console.log(error.response.data);
                                    if (error.response.data.error == 'unknown contract'){
                                        console.error('You filled in the wrong contract address!');
                                    }
                                    if (error.response.data.error == 'Transaction execution will fail with supplied arguments'){
                                        console.error('Verification failed');
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
                                console.error('Toll form error; check values');
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
                        console.error('Adding toll Failed; Check email and details');
                    }
                } else {
                    console.log(error.response);
                }
                process.exit(0);
            });

/*            setInterval(function(){
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
                }, 3000);

      
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

//Call the script from CLI like this: node tollbot.js 0xE85e99EDff226892438cf220CCEe84a246867816 0xdafd870463e08D454393927879f08a59b92e438B 30 20

    }
})


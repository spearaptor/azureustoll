// Require Statements
const axios = require('axios');
const WebSocket = require('ws');
const config = require('./config.js');

// Config Checks
if (!config.apiKey || !config.contractAddress || !config.auditContractAddress){
	console.error('Fill up all values in config.js');
	process.exit(0);
}

// Declarations
var myArgs = process.argv.slice(2);
var gotEvent;
const address1 = myArgs[0];
const address2 = myArgs[1];
const depositAmount = myArgs[2];
const transferAmount = myArgs[3];
const ws = new WebSocket(config.wsUrl);

// Amount Checks
console.log('minting '+depositAmount+' tokens to user');
if (depositAmount < transferAmount){
	console.log('Insufficient balance; mint more tokens to continue');
	process.exit(0);
}
console.log('sending '+transferAmount+' tokens from user: '+address1+' to toll: '+address2);


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

        // Minting Tokens
        tokenInstance.post('/mint', {
            account: address1,
            amount: depositAmount
        })
        .then(function (response) {
			console.log(response.data);
			if (response.data.success){
				console.log('Tokens of '+depositAmount+' minted to user successful!');
			}
		})
		.catch(function (error) {
			if (error.response.data){
				console.log(error.response.data);
				if (error.response.data.error == 'unknown contract'){
					console.error('You filled in the wrong contract address!');
				}
				if (error.response.data.error == 'Transaction execution will fail with supplied arguments'){
					console.error('Minting error');
				}
			} else {
				console.log(error.response);
			}
			process.exit(0);
		});

        // Transfering Tokens
        tokenInstance.post('/transferFrom', {
            from : address1,
            to : address2, 
            value: transferAmount
        })
        .then(function (response) {
			console.log(response.data);
			if (response.data.success){
				console.log('Transfer from user to toll of '+transferAmount+' complete');
			}
		})
		.catch(function (error) {
			if (error.response.data){
				console.log(error.response.data);
				if (error.response.data.error == 'unknown contract'){
					console.error('You filled in the wrong contract address!');
				}
				if (error.response.data.error == 'Transaction execution will fail with supplied arguments'){
					console.error('No tokens available to transfer');
				}
			} else {
				console.log(error.response);
			}
			process.exit(0);
		});
    }

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

    }
})

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


# Cardinal
HackFS Project Repository 

Cardinal team has identified the lack of a frictionless transaction process at toll gates and is designing a decentralized solution that allows a toll authority to conduct secure transactions by cutting out untrustworthy middlemen and on-chain verification.

## Prerequisites 
The steps below will help you fill in the right details in the settings file. 

### EthVigil Beta Developer Account

[https://github.com/blockvigil/ethvigil-cli](https://github.com/blockvigil/ethvigil-cli)

Follow the instructions contained in the link above to install `ev-cli`, the CLI tool to interact with EthVigil APIs and also complete your signup for a developer account on EthVigil.

### EthVigil Python SDK

[https://github.com/blockvigil/ethvigil-python-sdk](https://github.com/blockvigil/ethvigil-python-sdk)

With the fresh EthVigil Beta signup and CLI installed, next up is installation of the EthVigil Python SDK. 

Run the following command
```bash
pip install git+https://github.com/blockvigil/ethvigil-python-sdk.git
```

### Deploy the main contract

Use EthVigil to deploy the Solidity Smart Contract, `TollTax.sol`.

* [Deploy contract from Web UI](https://ethvigil.com/docs/web_onboarding/#deploy-a-solidity-smart-contract)
* [Deploy contract from CLI](https://ethvigil.com/docs/cli_onboarding/#deploy-a-solidity-smart-contract)

After deploying, use the `API-KEY` provided in the backend server `config.js`

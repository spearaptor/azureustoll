# Cardinal 
HackFS Project Repository

Cardinal team has identified the lack of a frictionless transaction process at toll gates and is designing a decentralized solution that allows a toll authority to conduct secure transactions by cutting out untrustworthy middlemen and on-chain verification.

---
## Requirements

For development, you will only need Node.js and a node global package, Yarn, installed in your environement.

### Node
- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v8.11.3

    $ npm --version
    6.1.0

If you need to update `npm`, you can make it using `npm`! After running the following command, just open again the command line.

    $ npm install npm -g

###
### Yarn installation
  After installing node, this project will need yarn too, so just run the following command.

      $ npm install -g yarn

---

## Install

    $ git clone https://github.com/shubidiwoop/cardinal
    $ cd Backend Server
    $ npm install

## Configure app
  
- Open `config.js` then edit it with your API KEY. Refer smart-contracts documentation to extract this.

    ```shell
    apiKey: process.env.ETHAPIKEY

- Open `services.services.js` and edit it with your Fleek API Key and Fleek API Secret. Refer [Fleek documentation](https://docs.fleek.co/) for obtaining this.

    ```shell
    const apiKey = process.env.APIKEY;
    const apiSecret = process.env.APISECRET;

## Running the project

    $ npm start


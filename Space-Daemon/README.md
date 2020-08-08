# Azureus 
HackFS Project Repository

Azureus team has identified the lack of a frictionless transaction process at toll gates and is designing a decentralized solution that allows a toll authority to conduct secure transactions by cutting out untrustworthy middlemen and on-chain verification.

---
## Requirements

For development, you will need Node.js and a node global package, Yarn, installed in your environement.

In addition, you will need [space-daemon](https://github.com/FleekHQ/space-daemon/releases) executable running on your local machine

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

    $ git clone https://github.com/shubidiwoop/azureus
    $ cd Space-Daemon
    $ npm install

## Configure app
  
- Open `config.js` then edit it with your API KEY. Refer [smart-contracts](https://github.com/shubidiwoop/azureus/tree/master/Smart%20Contracts) documentation to extract this.

    ```shell
    apiKey: process.env.ETHAPIKEY

- Open `client.js` and create a bucket. Refer [Space-Daemon documentation](https://github.com/FleekHQ/space-daemon) for more information on this. Run it

    ```shell
    node services/client.js

## Running the project

    $ npm start

## Maintainers
This server is maintained by:
* [Shubham Sharma](https://github.com/shubidiwoop)
* [Somya Didwania](https://github.com/somyadidwania)

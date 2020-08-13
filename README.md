# Azureus
HackFS Project Repository

## Overview 
Azureus team has identified the lack of a frictionless transaction process at toll gates and is designing a decentralized solution that allows a toll authority to conduct secure transactions by cutting out untrustworthy middlemen and on-chain verification.

> [Our Server](https://tollbotv4.herokuapp.com/)

> [Fleek Storage Bucket](https://shubidiwoop-team-bucket.storage.fleek.co/)

> [HackFS Submission](http://hack.ethglobal.co/showcase/azureus-recTkk0jGPXRrwg6Z)

## Respository Contents

- [Usage](#usage)
- [Composition](#composition)
- [Backend Server](https://github.com/shubidiwoop/azureus/tree/master/Backend%20Server)
- [Frontend App](https://github.com/shubidiwoop/azureus/tree/master/Frontend%20App)
- [Smart Contracts](https://github.com/shubidiwoop/azureus/tree/master/Smart%20Contracts)
- [Space-Daemon](https://github.com/shubidiwoop/azureus/tree/master/Space-Daemon)
- [Credits](#credits)
- [Support](#support)

Refer to instructions in each to run and develop them locally.

## Usage

<div align="center"> <img src="https://imgur.com/yuhQa3a.png" alt="flow Diagram"></div>

 This idea has the potential to introduce much needed reforms in the traditional toll collection systems, which in many countries is still cash only. The registration will be swift and easy for users, who most likely will only need to share a picture of their driver's license, vehicle number and email.
 
 For the registration process, access tokens will be verified via GoogleAuthO. Once the user is registered, users will be able to deposit FIAT money into the account. In the post-COVID19 world, contactless payments will be made via a QR code. The user will scan the code and the program will verify account balance by maintaining an ERC20 balance and transferring for each deduction, which provides automation and transparency.
<div align="center"> <img src="https://imgur.com/8rVepfb.png" alt="user registration"></div>

## Composition

**Smart Contracts**

All the smart contracts were deployed using EthVigil along with its proxy contract feature for added security measures. There is the primary smart contract to which the web app makes write calls using the EthVigil API, to mint and transfer tokens and temporarily hold them before being redirected to the tolls. The tollTax smart contract holds the status of users and tolls, if they have been approved or not, the option to create new users and tolls and revoke them as well. Additionally, all the userdata and tolldata has been encrypted and stored using Fleek's **space-daemon**.

**The android App**

The login system is built using the auth0-passport strategy which allows users directly to login with their Google account and therefore, there is no hassle of having to remember another password. A deterministic ethereum address is generated using the user's email address and a salt (could be the license number or the toll document ID). Users can easily purchase tokens (the production version will include a payment gateway for this purpose) and use these tokens to pay toll tax. There is a transaction log that is maintained along with the EtherScan link for users to view their ethereum transaction details. On the toll side, a unique QR code is generated which the user can use to pay the toll. The vehicle type is inferred automatically using the vehicle number and that determines the amount of toll the user has to pay. The delete-account button revoked the account. This approach can be modified for several payment applications making the process decentralized, automated, encrypted, and space stored. 

## Credits

We have designed this full-stack dapps using the support provided by [EthVigil’s APIs](https://ethvigil.com/). 
Even more so, storage and encryption is made possible using [Fleek](https://docs.fleek.co/) and [Space-Daemon](https://github.com/FleekHQ/space-daemon), which is built on IPFS, Textile, and Filecoin. Space is the next evolution of Cloud, where users can interact with apps fully private, p2p, and control their data. User's data and Toll data is encrypted using a hash and stored securly using space-daemon's service.  We will keep you updated on the additional functionalities that will be added to the projects.

## Support 

Reach out to one of us regarding any queries or support!
* [Roshan Kumar Choudhary](https://github.com/RoshanKumarChoudhary)
* [Somya Didwania](https://github.com/somyadidwania)
* [Shubham Sharma](https://github.com/shubidiwoop)








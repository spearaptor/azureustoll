# Cardinal 
HackFS Project Repository

Cardinal team has identified the lack of a frictionless transaction process at toll gates and is designing a decentralized solution that allows a toll authority to conduct secure transactions by cutting out untrustworthy middlemen and on-chain verification.

---
# Installation
Clone this repository and import into Android Studio

```git clone github.com/shubidiwoop/cardinal.git```

# Configuration
1. Open [Google Cloud Platform](https://developers.google.com/identity/sign-in/android/start-integrating)
2. Login to your google account
3. Select `Configure a project`
4. Enter a project name (Ex. Frontend Toll) and accept the terms and conditions
5. Enter a product name (Ex. Toll Service)
6. Calling from: Android
7. Package name: name of your java package. SHA1 signing certificate: Google account's SHA1. Refer the [steps given](https://developers.google.com/drive/android/auth)
8. Download the credentials.json file 

On generating the `credentials.json` file, paste this file in `Frontend App/app`

# Running the application
Download the apk file on your phone. 
When prompted with the customer's vehicle number, the 4th and 5th character corresponds to the customer's vehicle type.

```
    const carTypeCode = carNum[4]+carNum[5];
    if(vehTypeCode === "CR"){
        return tollPrice.car;
    }
    else if(vehTypeCode === "TR"){
        return tollPrice.truck;
    }
    else if(vehTypeCode === "BK"){
        return tollPrice.bike;
    }
    return tollPrice.govt;
```
For example, a customer whose vehicle number is `UP53BK4234` corresponds to that of a Bike (BK).
> **NOTE:**  Every user is uniquely mapped and assigned an EthAddress using their email-account.

## Maintainers
This application is maintained by:
* [Roshan Kumar Choudhary](https://github.com/RoshanKumarChoudhary)

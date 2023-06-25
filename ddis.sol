// DECENTRALIZED DIGITAL IDENTITY SOLUTION
// AUTHOR: PRANAV UNNI
// --------------------------------

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// NOTES
// COMPANIES LIKE AMAZON WILL CREATE A WALLET, 
// THEN TAKE CONSENT FROM USER ABOUT WHAT DATA TO RETRIEVE. BASED ON THE BOOL VALUES, THE DATA CAN BE ACCESSED

contract OneTimeKYC{

 // VARIABLES

    // struct of details of the user
    struct details {
        string name;
        string dob_dd_mm_yyyy;
        string email;
        string mob;
        bool is_verified;
        string ipfsVideoProofLink;
        string ipfsDocumentProofLink;
    }

    // struct to ask for consent
    struct consent {
        bool name;
        bool dob_dd_mm_yyyy;
        bool email;
        bool mob;
        bool ipfsVideoProofLink;
        bool ipfsDocumentProofLink;
    }

    // mapping for walletAddr and details
    mapping(address => details) walletAddrToDetails;

    // verifier address map: The address of entities which can act as verifiers.
    mapping(address => bool) private verifierAddressMap;

    // give consents: Maps a user to the address of companies to whom he has given/revoke consents
    mapping(address => address[]) giveConsent;

    // consents defined by the company
    mapping(address => consent) public consentDefinition;

    // mapping of wallet address and company name
    mapping(address => string) public addressToCompanyName;


// FUNCTIONS

    // SETTERS

    // constructor to add owner of contract as verifier
    constructor()  {
        verifierAddressMap[msg.sender] = true;
    }

    // fill the details: called by user
    function fillDetails(string memory name, string memory dob_dd_mm_yyyy, string memory email, 
    string memory mob, string memory ipfsVideoProofLink, string memory ipfsDocumentProofLink) external {

        // fill basic details
        walletAddrToDetails[msg.sender] = details(name, dob_dd_mm_yyyy, email, mob, false, ipfsVideoProofLink, ipfsDocumentProofLink);
    }

    // verify user: called by verifier
    function verifyUser(address walletAddr) external{
        // check if the caller is a verifier
        require(verifierAddressMap[msg.sender] == true, "you are not a verifier");
        details storage data = walletAddrToDetails[walletAddr];
        data.is_verified = true;
    }

    // create consent: called by company
    function createConsent(string memory companyName, bool name, bool dob_dd_mm_yyyy, bool email, bool mob, bool ipfsVideoProofLink, bool ipfsDocumentProofLink) external{
        addressToCompanyName[msg.sender] = companyName;
        consentDefinition[msg.sender] = consent(name, dob_dd_mm_yyyy, email, mob, ipfsVideoProofLink, ipfsDocumentProofLink);

    }

    // give consent: called by user if he accepts the consent asked by the company
    function giveCompanyConsent(address companyAddress) external returns (bool){
        address[] storage arr = giveConsent[msg.sender];
        arr.push(companyAddress);
        giveConsent[msg.sender] = arr;
        return true;
    }

    // revoke consent: called by user.
    function revokeCompanyConsent(address companyAddress) external {
        address[] storage arr = giveConsent[msg.sender];
        int index = -1;
        for(uint i = 0; i < arr.length; i++){
            if(arr[i] == companyAddress){
                index = int256(i);
                break;
            }
        }
        if(index != -1){
            uint ina = uint256(index);
            arr[ina] = arr[arr.length-1];
            arr.pop();
        }
    }


    // GETTERS

    // retrieve data: called by the user to get to know his data he stored.
    function retrieveData() external view returns(details memory){
        return walletAddrToDetails[msg.sender];
    }

    // retrieve consents given by user to company: called by user
    function retrieveConsents() external view returns(address[] memory){
        return giveConsent[msg.sender];
    }

    // access data based on consent: called by company
    function retrieveDataBasedOnConsent(address userAddress) external view returns (details memory){
        address[] memory arr = giveConsent[userAddress];
        if(arr.length == 0){
            revert("user did not give consent");
        }
        for(uint i = 0; i < arr.length; i++){
            if(arr[i] == msg.sender){
                break;
            }
            else if(i == arr.length-1){
                revert("user did not give consent");
            }
        }
        details memory tempdata = walletAddrToDetails[userAddress];
        consent memory tempconsent = consentDefinition[msg.sender];
        if(!tempconsent.name){
            tempdata.name = "";
        }
        if(!tempconsent.dob_dd_mm_yyyy){
            tempdata.dob_dd_mm_yyyy = "";
        }
        if(!tempconsent.email){
            tempdata.email = "";
        }
        if(!tempconsent.ipfsDocumentProofLink){
            tempdata.ipfsDocumentProofLink = "";
        }
        if(!tempconsent.ipfsVideoProofLink){
            tempdata.ipfsVideoProofLink = "";
        }
        if(!tempconsent.mob){
            tempdata.mob = "";
        }
        return tempdata;
    }

}

// in order for company to retrieve data of a user, it needs to know the user's wallet address. Based on which it can ping
// the contract to retrieve data. So, the company have to integrate the function `giveCompanyConsent` within the frontend.
// If the user accepts the consent, then the company can call `retrieveDataBasedOnConsent`

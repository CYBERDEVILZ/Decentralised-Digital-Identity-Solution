from flask import Flask
from flask import render_template, request
from web3 import Web3
import json
import requests
import os

app = Flask(__name__)

contractAddress = "0x14C179E1dA3E5e7A48BFc16Da224f19D2C32AA71"
contractABI = '[ { "inputs": [ { "internalType": "string", "name": "companyName", "type": "string" }, { "internalType": "bool", "name": "name", "type": "bool" }, { "internalType": "bool", "name": "dob_dd_mm_yyyy", "type": "bool" }, { "internalType": "bool", "name": "email", "type": "bool" }, { "internalType": "bool", "name": "mob", "type": "bool" }, { "internalType": "bool", "name": "ipfsVideoProofLink", "type": "bool" }, { "internalType": "bool", "name": "ipfsDocumentProofLink", "type": "bool" } ], "name": "createConsent", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "dob_dd_mm_yyyy", "type": "string" }, { "internalType": "string", "name": "email", "type": "string" }, { "internalType": "string", "name": "mob", "type": "string" }, { "internalType": "string", "name": "ipfsVideoProofLink", "type": "string" }, { "internalType": "string", "name": "ipfsDocumentProofLink", "type": "string" } ], "name": "fillDetails", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "companyAddress", "type": "address" } ], "name": "giveCompanyConsent", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "companyAddress", "type": "address" } ], "name": "revokeCompanyConsent", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [ { "internalType": "address", "name": "walletAddr", "type": "address" } ], "name": "verifyUser", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "addressToCompanyName", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "consentDefinition", "outputs": [ { "internalType": "bool", "name": "name", "type": "bool" }, { "internalType": "bool", "name": "dob_dd_mm_yyyy", "type": "bool" }, { "internalType": "bool", "name": "email", "type": "bool" }, { "internalType": "bool", "name": "mob", "type": "bool" }, { "internalType": "bool", "name": "ipfsVideoProofLink", "type": "bool" }, { "internalType": "bool", "name": "ipfsDocumentProofLink", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "retrieveConsents", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "retrieveData", "outputs": [ { "components": [ { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "dob_dd_mm_yyyy", "type": "string" }, { "internalType": "string", "name": "email", "type": "string" }, { "internalType": "string", "name": "mob", "type": "string" }, { "internalType": "bool", "name": "is_verified", "type": "bool" }, { "internalType": "string", "name": "ipfsVideoProofLink", "type": "string" }, { "internalType": "string", "name": "ipfsDocumentProofLink", "type": "string" } ], "internalType": "struct OneTimeKYC.details", "name": "", "type": "tuple" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "userAddress", "type": "address" } ], "name": "retrieveDataBasedOnConsent", "outputs": [ { "components": [ { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "dob_dd_mm_yyyy", "type": "string" }, { "internalType": "string", "name": "email", "type": "string" }, { "internalType": "string", "name": "mob", "type": "string" }, { "internalType": "bool", "name": "is_verified", "type": "bool" }, { "internalType": "string", "name": "ipfsVideoProofLink", "type": "string" }, { "internalType": "string", "name": "ipfsDocumentProofLink", "type": "string" } ], "internalType": "struct OneTimeKYC.details", "name": "", "type": "tuple" } ], "stateMutability": "view", "type": "function" } ]'
infura_URL = "https://polygon-mumbai.infura.io/v3/81cb60fc28dc44f8bfe36c67d0a026f8"
ipfs_api_key = "2PYCMw7OolJ3VVLsOzrWZ9Ld2sx"
ipfs_api_secret = "e63c29a29c07f3420dd794d7ae591a9b"
ipfs_endpoint = "https://ipfs.infura.io:5001"

# initializing web3
web3 = Web3(Web3.HTTPProvider(infura_URL))
contract = web3.eth.contract(address=contractAddress, abi=contractABI)

print(f"Infura connection status: {web3.is_connected()}")

#### -- ROUTES -- ####

# home route
@app.route("/")
def home():
    return render_template('index.html')

# route for connecting wallet
@app.route("/connectWallet/<userType>")
def connectWallet(userType):
    return render_template("connectWallet.html", userType=userType)

# user segment route
@app.route("/user")
def user():
    return render_template("user.html")

# company segment route
@app.route("/company")
def company():
    return render_template("company.html")

# route to view consents of company
@app.route("/user/consents/<companyAddress>")
def viewConsent(companyAddress):
    return render_template("viewConsent.html", companyAddress=companyAddress)


#### -- ENDPOINTS -- ####

# endpoint for getting user information
@app.route("/getUserInfo/<walletAddress>")
def userInfo(walletAddress):
    _walletAddress = web3.to_checksum_address(walletAddress)
    result = contract.functions.retrieveData().call({'from': _walletAddress})
    print(result)
    return json.dumps(result)

# endpoint for getting user given consents to companies
@app.route("/getGivenConsents/<walletAddress>")
def getGivenConsents(walletAddress):
    _walletAddress = web3.to_checksum_address(walletAddress)
    result = contract.functions.retrieveConsents().call({'from': _walletAddress})
    addressMap = {}
    for address in result:
        addressMap[address] = contract.functions.addressToCompanyName(address).call({'from': _walletAddress})
    print(addressMap)
    return json.dumps(addressMap)

# endpoint for saving files in IPFS
@app.route("/saveinIPFS", methods=['POST'])
def updateDetails():
    temp_dir = 'temp_files'
    os.makedirs(temp_dir, exist_ok=True)
    try:
        image = request.files['image']
        video = request.files['video']
        files = [image, video]
        saved_files = []
        response_list = []

        # save files in temporary folder
        for file in files:
            filename = file.filename
            file_path = os.path.join(temp_dir, filename)
            file.save(file_path)
            saved_files.append(file_path)
        
        # take the files and upload to ipfs
        for file_path in saved_files:
            with open(file_path, 'rb') as file:
                upload_files = {'file': file}
                print("uploading files")
                response = requests.post(ipfs_endpoint + '/api/v0/add', files=upload_files, auth=(ipfs_api_key, ipfs_api_secret))
                if response.status_code == 200:
                    hash = response.text.split(",")[1].split(":")[1].replace('"','')
                    response_list.append(hash)
                else:
                    print(response.text)
                    return False
    except: return False
    finally:
        print("uploading complete")
        # Delete the temporary files
        for file_path in saved_files:
            os.remove(file_path)
        os.rmdir(temp_dir)
        return response_list

# endpoint to fetch the consent of the company
@app.route("/getCompanyConsent/<companyAddress>")
def getCompanyConsent(companyAddress):
    companyWalletAddress = web3.to_checksum_address(companyAddress)
    result = contract.functions.consentDefinition(companyWalletAddress).call({'from': companyWalletAddress})
    print(result)
    return result

# endpoint to fetch company information
@app.route("/getCompanyInfo/<companyAddress>")
def getCompanyInfo(companyAddress):
    _companyWalletAddress = web3.to_checksum_address(companyAddress)
    companyName = contract.functions.addressToCompanyName(_companyWalletAddress).call({'from': _companyWalletAddress})
    companyConsent = contract.functions.consentDefinition(_companyWalletAddress).call({'from': _companyWalletAddress})
    companyInfoMapping = {}
    companyInfoMapping["companyName"] = companyName
    companyInfoMapping["consent"] = companyConsent
    return json.dumps(companyInfoMapping)    

app.run(debug=True, host='0.0.0.0', port=80)

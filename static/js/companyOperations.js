
// --- GLOBAL VARIABLES --- //
// instantiate web3
// the web3 has been imported within user.html file, hence dont worry about ide error
const web3 = new Web3(window.ethereum);
// abi and contract address is defined inside web3.js file
var contract = new web3.eth.Contract(abi, contractAddress);
var retrieveCompanyConsentURL = "/getCompanyInfo/";
var heading = document.getElementById("heading");
var name_value = document.getElementById("name");
var dob = document.getElementById("dob");
var email = document.getElementById("email");
var phone = document.getElementById("phone");
var image = document.getElementById("image");
var video = document.getElementById("video");
var verified = document.getElementById("verified");
var save = document.getElementById("save");
var cancel = document.getElementById("cancel");
var updateConsentButton = document.getElementById("update_details");
var detailsDiv = document.getElementById("detailsBox");
var consentDataBox = document.getElementById("details");
var consentUpdateBox = document.getElementById("updateDetails")
var fetchingData = document.getElementById("fetchingData");
var retrieveButton = document.getElementById("retrieve");
var retrievedDataDiv = document.getElementById("retrievedData");
var retrieveDataBasedOnConsentDiv = document.getElementById("consentsbox");

// FUNCTION DEFINITIONS
async function retrieveCompanyConsent(companyAddress){
    var response = (await fetch(retrieveCompanyConsentURL+companyAddress)).json();
    response.then((data) => {
        if(data["companyName"] == undefined){
            // if the company has not defined any consent
            // show div to accept names and consent

            
        }
        else{
            // if company has defined consent
            heading.innerText = "Hi, " +data["companyName"];
            name_value.innerText = name_value.innerText + " " + data["consent"][0]
            dob.innerText = dob.innerText + " " + data["consent"][1]
            email.innerText = email.innerText + " " + data["consent"][2]
            phone.innerText = phone.innerText + " " + data["consent"][3]
            image.innerText = image.innerText + " " + data["consent"][4]
            video.innerText = video.innerText + " " + data["consent"][5]

            // show and hide respective divs
            fetchingData.style.display = "none";
            detailsDiv.style.display = "flex";
            retrieveDataBasedOnConsentDiv.style.display = "flex";
        }
    });
}

// function to update company consent
async function updateCompanyConsent(){

    // retrieve value from input boxes
    var companyName = document.getElementById("heading_input").value;
    var nameBool = document.getElementById("nameRadio").checked;
    var dobBool = document.getElementById("dateRadio").checked;
    var emailBool = document.getElementById("emailRadio").checked;
    var mobBool = document.getElementById("phoneRadio").checked;
    var imageBool = document.getElementById("imageRadio").checked;
    var videoBool = document.getElementById("videoRadio").checked;

    // call smart contract to update consent
    await contract.methods.createConsent(companyName, nameBool, dobBool, emailBool, mobBool, imageBool, videoBool)
    .send({ from: ethereum.selectedAddress })
    .on('transactionHash', function (hash) {
    console.log('Transaction hash:', hash);
    location.reload();
    })
    .on('error', function (error) {
    console.error('Error:', error);
    });
}

// function to retrieve data based on consent
async function retrieveDataBasedOnConsent(){
    // show fetching text
    retrievedDataDiv.innerHTML = "Fetching Data Based on Consent...";
    await contract.methods.retrieveDataBasedOnConsent(document.getElementById("userAddress").value)
    .call({from: ethereum.selectedAddress})
    .then(function(result){
        var nameValue = result[0] == "" ? "-" : result[0];
        var dobValue = result[1] == "" ? "-" : result[1];
        var emailValue = result[2] == "" ? "-" : result[2];
        var phoneValue = result[3] == "" ? "-" : result[3];
        var imageLink = result[5] == "" ? "-" : "<a target='_blank' href='https://ddis.infura-ipfs.io/ipfs/'"+result[5]+">click to show</a>";
        var videoLink = result[6] == "" ? "-" : "<a target='_blank' href='https://ddis.infura-ipfs.io/ipfs/'"+result[6]+">click to show</a>";
        retrievedDataDiv.innerHTML = "Name: " + nameValue + ", Dob: " + dobValue + ", email: " + emailValue + ", phone: " + phoneValue + 
        "<br>image_link: " + imageLink + ", video_link: " +  videoLink +
        "<br>verified: " + result[4];
    })
    .catch(() => retrievedDataDiv.innerHTML = "Something went wrong. The user may not have given consent.");
}


// MAIN EXECUTION AREA //

// register save button.
save.addEventListener("click", async ()=>{
    await updateCompanyConsent();
});

// register cancel button
cancel.addEventListener("click", () => {
    // show consentDetailsBox
    consentDataBox.style.display = "flex";
    // hide consentUpdateBox
    consentUpdateBox.style.display = "none";

});

// register update company consent button
updateConsentButton.addEventListener("click", ()=>{
    // hide consentDetailsBox
    consentDataBox.style.display = "none";
    // show consentUpdateBox
    consentUpdateBox.style.display = "flex";
    heading.innerHTML = "Hi, <input type='text' id='heading_input'>";
})

// register retrieve button
retrieveButton.addEventListener("click", async ()=>{
    // call retrieveDataBasedOnConsent
    await retrieveDataBasedOnConsent();
})
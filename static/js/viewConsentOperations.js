// -- GLOBAL VARIABLES -- //
// instantiate web3
// the web3 has been imported within user.html file, hence dont worry about ide error
const web3 = new Web3(window.ethereum);
// abi and contract address is defined inside web3.js file
var contract = new web3.eth.Contract(abi, contractAddress);
var consentsBox = document.getElementById("detailsBox");
var fetchingData = document.getElementById("fetchingData");
var name_value = document.getElementById("name");
var dob = document.getElementById("dob");
var email = document.getElementById("email");
var phone = document.getElementById("phone");
var image = document.getElementById("image");
var video = document.getElementById("video");

// FUNCTION DEFINITION
// fetch company's consent
async function fetchCompanyConsent(companyAddress){
    var response = (await fetch("/getCompanyConsent/"+companyAddress)).json();
    response.then((data) => {
        var name_data = data[0] == ''?'false':data[0];
        var birth_date_data = data[1] == ''?'false':data[1];
        var email_data = data[2] == ''?'false':data[2];
        var phone_data = data[3] == ''?'false':data[3];
        var image_data = data[4] == ''?'false':data[4];
        var video_data = data[5] == ''?'false':data[5];
        name_value.innerHTML = name_value.innerHTML + name_data;
        dob.innerHTML = dob.innerHTML + birth_date_data;
        email.innerHTML = email.innerHTML + email_data;
        phone.innerHTML = phone.innerHTML + phone_data;
        image.innerHTML = image.innerHTML + image_data;
        video.innerHTML = video.innerHTML + video_data;

        // display and hide divs accordingly
        fetchingData.style.display = 'none';
        consentsBox.style.display = 'flex';
    });
}

// function to revoke consent
async function revokeConsent(companyAddress){
    contract.methods.revokeCompanyConsent(companyAddress).send({ from: ethereum.selectedAddress })
    .on('transactionHash', function (hash) {
    console.log('Transaction hash:', hash);
    location = "/user"
    })
    .on('error', function (error) {
    console.error('Error:', error);
    });
}
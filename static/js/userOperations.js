// global variables
const details_url = "/getUserInfo/";
const consents_url = "/getGivenConsents/";
var fetchingData = document.getElementById("fetchingData");
var consentsbox = document.getElementById("consentsbox");
var name_value = document.getElementById("name");
var dob = document.getElementById("dob");
var email = document.getElementById("email");
var phone = document.getElementById("phone");
var image = document.getElementById("image");
var video = document.getElementById("video");
var verified = document.getElementById("verified");
var updateDetailsButton = document.getElementById("update_details");
var cancelButton = document.getElementById("cancel");
var saveButton = document.getElementById("save");
// instantiate web3
// the web3 has been imported within user.html file, hence dont worry about ide error
const web3 = new Web3(window.ethereum);
// abi and contract address is defined inside web3.js file
var contract = new web3.eth.Contract(abi, contractAddress)

// call endpoint to get user information.
async function getUserInfoFromSmartContract(account){
    var response = (await fetch(details_url+account)).json();
    response.then((data) =>{
        // key assignment
        var name_data = data[0] == ''?'-':data[0];
        var birth_date_data = data[1] == ''?'-':data[1];
        var email_data = data[2] == ''?'-':data[2];
        var phone_data = data[3] == ''?'-':data[3];
        var verified_data = data[4];
        var image_data = data[5] == ''?'-':"click to show";
        var video_data = data[6] == ''?'-':"click to show";
        name_value.innerHTML = name_value.innerHTML + name_data;
        dob.innerHTML = dob.innerHTML + birth_date_data;
        email.innerHTML = email.innerHTML + email_data;
        phone.innerHTML = phone.innerHTML + phone_data;
        image.innerHTML = image.innerHTML + image_data;
        video.innerHTML = video.innerHTML + video_data;
        verified.innerHTML = verified.innerHTML + verified_data;

        // add event listener to image_data and video_data if they are not null
        if(data[5] != ''){
            image.addEventListener("click", function () {
                window.open(ipfs_endpoint+data[5], "_blank");
            });
        }
        if(data[6] != ''){
            video.addEventListener("click", function () {
                window.open(ipfs_endpoint+data[6], "_blank");
            });
        }
    })

    // get user given consensts from smart contract
    response = (await fetch(consents_url+account)).json();
    response.then((data)=>{
        for (var key in data) {
            div = document.createElement("div");
            div.className = "consents";
            div.innerHTML = data[key];
            div.addEventListener("click", function () {
                location="/user/consents/"+key;
            });
            consentsbox.appendChild(div);
        }
    })
    
    // hide fetching data placeholder
    fetchingData.setAttribute("hidden", "true");
    // show detailsBox
    detailsBox.setAttribute("style", "display: flex");
    // show consentsBox
    consentsbox.setAttribute("style", "display: inline");    
}

// function to save data in smart contract
async function saveDetailsInSmartContract(){
    var name_field = document.getElementById("nameText").value;
    var date_field = document.getElementById("dateText").value;
    var email_field = document.getElementById("emailText").value;
    var phone_field = document.getElementById("phoneNumber").value;
    var image_field = document.getElementById("imageFile").files[0];
    var video_field = document.getElementById("videoFile").files[0];
    
    const formData = new FormData();
    formData.append('image', image_field);
    formData.append('video', video_field);

    // send data to IPFS
    try {
        const response = await fetch('/saveinIPFS', {
          method: 'POST',
          body: formData
        });
        if (response.ok) {
            const responseJson = response.json();
            // if data is uploaded successfully, save details in smart contract
            responseJson.then((data) => {
                image_field = data[0]
                video_field = data[1]
                contract.methods.fillDetails(name_field, date_field, email_field, phone_field, image_field, video_field)
                .send({ from: ethereum.selectedAddress })
                .on('transactionHash', function (hash) {
                console.log('Transaction hash:', hash);
                location.reload();
                })
                .on('error', function (error) {
                console.error('Error:', error);
                });
                
            });
        } else {
            console.log("some error occurred");
        }
    }
    catch (error) {
        console.error('Error uploading files:', error);
    }

}


/// -- ORIGINAL EXECUTION AREA --
// register update details button event listener
updateDetailsButton.addEventListener("click", function() {
    // hide user details div
    document.getElementById("details").style.display='none';
    // show update details div
    document.getElementById("updateDetails").style.display='flex';
});
// register cancel button event listener
cancelButton.addEventListener("click", function() {
    // show user details div
    document.getElementById("details").style.display='flex';
    // hide update details div
    document.getElementById("updateDetails").style.display='none';
});
// register save button event listener
saveButton.addEventListener("click", async function() {
    // save data in smart contract
    await saveDetailsInSmartContract();
    // reload
    // location.reload();
});

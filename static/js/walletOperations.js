// GLOBAL VARIABLE //
var account = "";
var chainId = "";

// --- SOME FUNCTIONS --- //
/// function to get wallet address of the user.
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        .catch((err) => {
            // if some error occurs, navigate user to home
        if (err.code === 4001) {
            location = "/";
        } else {
            location = "/";
        }
        });
        account = accounts[0];
        // if no account connected, navigate user to home
        if(account == ""){
            location = "/";
        }
        // after connecting, switch chains
        await switchChain();
        // after switching, check chain if it is correct one
        await checkChain();
    }
}

/// Responsible for performing action if user makes change to connected account.
/// called by a listener. No need to call externally.
async function handleAccountsChanged(accounts){
    if (accounts.length === 0) {
        // MetaMask is locked or the user has not connected any accounts.
        location = "/";
      } else if (accounts[0] !== account) {
        // Reload your interface with accounts[0].
        account = accounts[0];
        await switchChain();
        await checkChain();
        location.reload();
      }
}

/// function to navigate user to their respective segment.
async function navigateUser(userType){
    // connect the wallet
    await connectWallet();
    // check chainID
    if(chainId != "0x13881"){
        location = "/";
    } 
    else{
    // check user type
    if(userType == "user"){
        location = "/user";
    }
    else if(userType == "company"){
        location = "/company";
    }
    else{
      location = "/";
    }
    }
}

/// function to check if the chain is desired chain or not
async function checkChain(){
    chainId = await window.ethereum.request({ method: 'eth_chainId' });
}

/// function to check if chain is changed
function handleChainChanged(chainId) {
    if(chainId != '0x13881'){
        location = "/";
    }
}

/// function to switch chain to desired chain
async function switchChain(){
try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x13881' }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: "0x13881",
              rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
              chainName: "Polygon Testnet Mumbai",
              nativeCurrency: {
                name: "tMATIC",
                symbol: "tMATIC", // 2-6 characters long
                decimals: 18,
              },
              blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
            },
          ],
        });
      } catch (addError) {
        // handle "add" error
        location = "/";
      }
    }
    // handle other "switch" errors
    location = "/";
  }
}


// --- ORIGINAL EXECUTION AREA --- //
/// listener to check if accounts changed
window.ethereum.on('accountsChanged', handleAccountsChanged);

/// listener to check if chain is changed
window.ethereum.on('chainChanged', handleChainChanged);



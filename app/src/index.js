import Web3 from "web3";
import forTheRecordArtifact from "../../build/contracts/ForTheRecord.json";

const App = {
  web3: null,
  contract: null,

  initialize: async function() {
    const { web3 } = this;

    // get the contract instance
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = forTheRecordArtifact.networks[networkId];
    this.contract = new web3.eth.Contract(
      forTheRecordArtifact.abi,
      deployedNetwork.address,
    );

  },

  getAccount: async function() {
    // get accounts and save accounts[0] which is the current account
    const { web3 } = this;
    const accounts = await web3.eth.getAccounts();
    return accounts[0];
  },

  getNumberOfRecords: async function() {
    const { contract } = this;
    const result = await contract.methods.numberOfRecords().call();
    return result;
  },

  submitRecord: async function(message) {
    const account = await this.getAccount();

    const { contract } = this;
    const submitPromise = contract.methods.submitRecord(message).send({
      from: account
    });
  }
}

$(document).ready(async () => {
  if (!window.ethereum) {
    return alert(`window.ethereum is not defined. Make sure you have a wallet installed.`);
  }

  // Create our web3 instance and ask to enable access to the user's accounts
  App.web3 = new Web3(window.ethereum);
  await window.ethereum.enable();

  await App.initialize();
  console.log('Application initialized');

  const numberOfRecords = await App.getNumberOfRecords();
  console.log(numberOfRecords);




  $('#button-submit').click(() => {
    const message = $('#input-message').val();
    if (message) {
      App.submitRecord(message);
    } else {
      // Message is empty, don't submit that
    }
    
  });

})

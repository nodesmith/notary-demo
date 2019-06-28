import Web3 from 'web3';
import forTheRecordArtifact from '../../build/contracts/ForTheRecord.json';
import * as uiHelpers from './ui-helpers';

// Group the main logic of the dApp into this app object
const app = {

  /** Initialized instance of the Web3 library */
  web3: null,

  /** The instance of the ForTheRecord smart contract we're interacting with */
  contract: null,

  /** string describing the network we're connected to (something like mainnet, kovan, etc.) */
  networkType: '',

  /**
   * Initializes our application, grabbing the contract and registering for various events
   * @param {Web3} web3 An initialized instance of Web3 with a valid provider.
   */
  initialize: async function(web3) {
    // Save these for later use
    this.web3 = web3;

    // Get info about the network we're connected to and the appropriate deployed contract metadata
    const networkType = await web3.eth.net.getNetworkType();
    this.networkType = networkType;
    uiHelpers.setNetworkType(networkType);

    const networkId = await web3.eth.net.getId();
    const deployedNetwork = forTheRecordArtifact.networks[networkId];

    // Once we know which network we're using we can create the contract instance and save it 
    this.contract = new web3.eth.Contract(
      forTheRecordArtifact.abi,
      deployedNetwork.address,
    );

    // Read the current records that are saved and get notified when new ones come in
    this.contract.events.RecordSaved({ fromBlock: 0 }).on('data', (event) => {

      // We've received our event, pull out the properties we want to send back
      const { blockNumber, transactionHash, type } = event;
      const { message, fromAddress } = event.returnValues;
      uiHelpers.createListItem({blockNumber, transactionHash, message, fromAddress, state: type, networkType});
    });
  },

  /**
   * Stores a new message in smart contract. Returns once the transaction receipt has been received.
   * @param {string} message The message we want to store in the smart contract
   */
  submitRecord: async function(message) {
    const { web3, contract, networkType } = this;

    // Request accounts and save accounts[0] which is the current account. This will prompt the user for
    // permission to view the accounts if it's their first time using the dApp
    const accounts = await web3.eth.requestAccounts();
    const fromAddress = accounts[0];

    // Actually send our transaction in and listen for the various callback events
    const transactionReceipt = await contract.methods.submitRecord(message).send({ from: fromAddress })
      .once('transactionHash', (transactionHash) => {
        // Once we have a transaction hash add this item to the list in a pending state
        uiHelpers.createListItem({blockNumber: 'pending', transactionHash, message, fromAddress, state: 'pending', networkType});
      })
      .on('error', (error) => {
        uiHelpers.showError(error.toString());
      });

    return transactionReceipt;
  }
}

// When the document has loaded, initialize our application.
$(document).ready(async () => {

  // Make sure there is an injected web3 provider
  if (!window.ethereum) {
    uiHelpers.showError(`window.ethereum is not defined. Make sure you have a wallet like MetaMask installed.`);
  }

  // Initialize the primary logic in the app object
  await app.initialize(new Web3(window.ethereum));

  // Add an event listener to handle submitting the transaction to the network
  $('#button-submit').click(() => {
    const message = $('#input-message').val();
    if (message) {
      app.submitRecord(message);
    }
  });
})

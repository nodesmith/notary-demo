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
})

// Create the app object

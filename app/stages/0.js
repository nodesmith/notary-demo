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
  }
}

// When the document has loaded, initialize our application.
$(document).ready(async () => {

});

import Web3 from 'web3';
import forTheRecordArtifact from '../../build/contracts/ForTheRecord.json';

// Group the main logic of the dApp into this app object
const app = {

  /** Initialized instance of the Web3 library */
  web3: null,

  /** The instance of the ForTheRecord smart contract we're interacting with */
  contract: null,

  /** Callback fired whenever a new event log is received */
  newRecordCallback: null,

  /** string describing the network we're connected to (something like mainnet, kovan, etc.) */
  networkType: '',

  /**
   * Initializes our application, grabbing the contract and registering for various events
   * @param {Web3} web3 An initialized instance of Web3 with a valid provider.
   * @param {(record) => void} newRecordCallback Callback which will fire when loading historical records from
   * the network and when new records are seen (which may not be confirmed yet) from the network.
   */
  initialize: async function(web3, newRecordCallback) {
    // Save these for later use
    this.web3 = web3;
    this.newRecordCallback = newRecordCallback;

    // Get info about the network we're connected to and the appropriate deployed contract metadata
    const networkType = await web3.eth.net.getNetworkType();
    this.networkType = networkType;
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
      newRecordCallback({
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        message: event.returnValues.message,
        fromAddress: event.returnValues.fromAddress,
        state: event.type,
        networkType: networkType
      });
    });
  },

  /**
   * Stores a new message in smart contract. Returns once the transaction receipt has been received.
   * @param {string} message The message we want to store in the smart contract
   */
  submitRecord: async function(message) {
    const { web3, contract, newRecordCallback, networkType } = this;

    // Request accounts and save accounts[0] which is the current account. This will prompt the user for
    // permission to view the accounts if it's their first time using the dApp
    const accounts = await web3.eth.requestAccounts();
    const account = accounts[0];

    // Actually send our transaction in and listen for the various callback events
    const transactionReceipt = await contract.methods.submitRecord(message).send({ from: account })
      .once('transactionHash', (transactionHash) => {

        // Once we have a transaction hash add this item to the list in a pending state
        newRecordCallback({
          blockNumber: 'pending',
          transactionHash: transactionHash,
          message: message,
          fromAddress: account,
          state: 'pending',
          networkType: networkType
        });
      })
      .on('error', (error) => {
        $('#warning-message').text(error.toString());
        $('.alert').show();
      });

    return transactionReceipt;
  }
}

// When the document has loaded, initialize our application.
$(document).ready(async () => {

  // Make sure there is an injected web3 provider
  if (!window.ethereum) {
    return alert(`window.ethereum is not defined. Make sure you have a wallet like MetaMask installed.`);
  }

  // Initialize the primary logic in the app object
  await app.initialize(new Web3(window.ethereum), createListItem);

  // Add an event listener to handle submitting the transaction to the network
  $('#button-submit').click(() => {
    const message = $('#input-message').val();
    if (message) {
      app.submitRecord(message);
    }
  });
})

/**
 * Helper method for adding an item to the list of records we're showing. This builds up and appends an html element to the
 * list of records, removing any existing elements with the same transaction hash first to avoid duplicates.
 * @param {*} param0 
 */
const createListItem = ({message, state, transactionHash, blockNumber, fromAddress, networkType}) => {
  const blockExplorerUrl = `https://blockscout.com/eth/${networkType}/tx/${transactionHash}`;
  const recordListItem = $(`
<li class="media py-2 my-1 pl-2 list-group-item-action record" id="${transactionHash}" onclick="window.open('${blockExplorerUrl}')">
  <h4 class="align-self-center mr-3"><span class="badge badge-${state === 'mined' ? 'success' : 'warning'}">${state}</span></h4>
  <div class="media-body">
    <h6 class="h5 mb-0">${message}</h6>
    <span class="text-muted h6 small"> Block ${blockNumber} </span>
    <span class="text-muted h6 small"> • </span>
    <span class="text-muted h6 small">${fromAddress}</span>
  </div>
</li>`);

  $(`#${transactionHash}`).remove();
  $('#records-list').prepend(recordListItem);
};

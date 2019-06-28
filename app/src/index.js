import Web3 from 'web3';
import forTheRecordArtifact from '../../build/contracts/ForTheRecord.json';

const App = {
  web3: null,
  contract: null,
  newRecordCallback: null,
  networkType: null,

  initialize: async function(web3, newRecordCallback) {
    this.web3 = web3;
    this.newRecordCallback = newRecordCallback;

    // get the contract instance and info about our network
    const networkType = await web3.eth.net.getNetworkType();
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = forTheRecordArtifact.networks[networkId];

    // Once we know which network we're using we can create the contract instance
    const contract = new web3.eth.Contract(
      forTheRecordArtifact.abi,
      deployedNetwork.address,
    );
    this.networkType = networkType;
    this.contract = contract;

    // Read the current records that are saved and get notified when new ones come in
    contract.events.RecordSaved({ fromBlock: 0 }).on('data', (event) => {

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

  getAccount: async function() {
    // Request accounts and save accounts[0] which is the current account. This will prompt the user for
    // permission to view the accounts if it's their first time using the dApp
    const { web3 } = this;
    const accounts = await web3.eth.requestAccounts();
    return accounts[0];
  },

  submitRecord: async function(message) {
    const account = await this.getAccount();

    const { contract, eventListenerCb, networkType } = this;
    const transactionReceipt = await contract.methods.submitRecord(message).send({
      from: account
    })
    .once('transactionHash', (transactionHash) => {
      console.log(`Transaction hash was ${transactionHash}`);
      if (eventListenerCb) {
        eventListenerCb({
          blockNumber: 'pending',
          transactionHash: transactionHash,
          message: message,
          fromAddress: account,
          state: 'pending',
          networkType: networkType
        });
      }
    })
    .on('error', (error) => {
      console.error(error);
    });

    console.log(`Transaction receipt ${JSON.stringify(transactionReceipt)}`);
  },

  listenForEvents: function (cb) {
    // Save off the event listener
    this.eventListenerCb = cb;

    const { contract, networkType, eventListenerCb } = this;

    contract.events.RecordSaved({ fromBlock: 0 })
    .on('data', (event) => {
      // We've received our event, pull out the properties we want to send back
      eventListenerCb({
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        message: event.returnValues.message,
        fromAddress: event.returnValues.fromAddress,
        state: event.type,
        networkType: networkType
      });
    })
  }
}

const createListItem = ({message, state, transactionHash, blockNumber, fromAddress, networkType}) => {
  const blockExplorerUrl = `https://blockscout.com/eth/${networkType}/tx/${transactionHash}`;

  return `
<li class="media py-2 my-1 pl-2 list-group-item-action record" id="${transactionHash}" onclick="window.open('${blockExplorerUrl}')">
  <h4 class="align-self-center mr-3"><span class="badge badge-${state === 'mined' ? 'success' : 'warning'}">${state}</span></h4>
  <div class="media-body">
    <h6 class="h5 mb-0">${message}</h6>
    <span class="text-muted h6 small"> Block ${blockNumber} </span>
    <span class="text-muted h6 small"> • </span>
    <span class="text-muted h6 small">${fromAddress}</span>
  </div>
</li>
`
};

$(document).ready(async () => {
  if (!window.ethereum) {
    return alert(`window.ethereum is not defined. Make sure you have a wallet installed.`);
  }

  const onNewRecord = (record) => {
    $(`#${record.transactionHash}`).remove();
    $('#records-list').prepend($(createListItem(record)));
  }

  App.initialize(new Web3(window.ethereum), onNewRecord);


  $('#button-submit').click(() => {
    const message = $('#input-message').val();
    if (message) {
      App.submitRecord(message);
    } else {
      // Message is empty, don't submit that
    }
  });


  // App.web3 = new Web3(window.ethereum);
  // await window.ethereum.enable();

  // await App.initialize();
  // console.log('Application initialized');

  // App.listenForEvents((event) => {
  //   $(`#${event.transactionHash}`).remove();
  //   $('#records-list').prepend($(createListItem(event)));
  // })



})

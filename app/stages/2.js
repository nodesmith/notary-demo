
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

// Add an event listener to handle submitting the transaction to the network
$('#button-submit').click(() => {
  const message = $('#input-message').val();
  if (message) {
    app.submitRecord(message);
  }
});


// Add submitRecord method which is empty besides a log line
// Wire up the click handler an call submit record
// Add the request accounts part to show and explain the popup
// actually do the submitRecord call and send it


// Read the current records that are saved and get notified when new ones come in
this.contract.events.RecordSaved({ fromBlock: 0 }).on('data', (event) => {

  // We've received our event, pull out the properties we want to send back
  const { blockNumber, transactionHash, type } = event;
  const { message, fromAddress } = event.returnValues;
  uiHelpers.createListItem({blockNumber, transactionHash, message, fromAddress, state: type, networkType});
});

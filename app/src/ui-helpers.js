

/**
 * Helper method for adding an item to the list of records we're showing. This builds up and appends an html element to the
 * list of records, removing any existing elements with the same transaction hash first to avoid duplicates.
 * @param {*} param0 
 */
export const createListItem = function({message, state, transactionHash, blockNumber, fromAddress, networkType}) {
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

/**
 * Helper method for showing the error message at the bottom of the screen.
 * @param {*} error The error to show
 */
export const showError = function(error) {
  $('#warning-message').text(error.toString());
  $('.alert').show();
};

/**
 * Sets the network type in the UI
 * @param {*} networkType The network type (mainnet, kovan, etc.)
 */
export const setNetworkType = function(networkType) {
  $('#network-type').text(` - ${networkType} network`);
};


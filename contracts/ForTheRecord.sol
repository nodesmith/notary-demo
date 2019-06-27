/*
  For the Record - store a string of data on Ethereum forever.
  Open source sample Ethereum web app.
*/

pragma solidity >=0.4.21 <0.6.0;

contract ForTheRecord {
    // Emit an event indicating that this hash was submitted at this time. The event and its data are
    // stored as part of the transaction, so there's no need to store this in the contract itself
    // The indexed keyword allows searching for events using that parameter as a filter.
    event RecordSaved(address indexed fromAddress, uint blockNumber, string message);

    // Simple counter which tracks how many records we have stored. We could get this information from
    // the RecordSaved event logs, but this is here for demonstration purposes.
    uint public numberOfRecords;

    // Creates a new instance of the contract.
    constructor() public {
        // Initialize our number of records to 0
        numberOfRecords = 0;
    }

    // This function will "store" a message by emitting that data as an event.
    function submitRecord(string memory message) public {
        uint blockNumber = block.number;
        emit RecordSaved(msg.sender, blockNumber, message);
        numberOfRecords++;
    }
}
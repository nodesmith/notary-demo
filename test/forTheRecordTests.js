const ForTheRecord = artifacts.require("ForTheRecord");

contract("ForTheRecord", accounts => {
  it("should submit record", async () => {
    const instance = (await ForTheRecord.deployed()).contract;

    const oldCount = await instance.methods.numberOfRecords().call();
    assert.equal(oldCount, 0);

    const message = 'Hello world!!';
    const fromAddress = accounts[4];
    const txReceipt = await instance.methods.submitRecord(message).send({ from: fromAddress });

    const newCount = await instance.methods.numberOfRecords().call();
    assert.equal(newCount, 1);

    const events = await instance.getPastEvents('RecordSaved');
    assert.equal(events.length, 1);
    assert.equal(events[0].returnValues.message, message);
    assert.equal(events[0].returnValues.fromAddress, fromAddress);
    assert.equal(events[0].blockHash, txReceipt.blockHash);
    assert.equal(events[0].blockNumber, txReceipt.blockNumber);
    
  });
});

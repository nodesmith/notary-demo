/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 *
 */

const HDWalletProvider = require('truffle-hdwallet-provider');
const nodesmithKey = process.env.NODESMITH_KEY;
const privateKey = process.env.PRIVATE_KEY;

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    
    ganache: {
      network_id: 5777,
      host: '127.0.0.1',
      port: 7545
    },

    // This is the provider we'll use for the Kovan network
    kovan: {
      provider: () => new HDWalletProvider(privateKey, `https://ethereum.api.nodesmith.io/v1/kovan/jsonrpc?apiKey=${nodesmithKey}`),
      network_id: 42,      // Kovan's id
      gas: 5500000,        // Kovan has a lower block limit than mainnet
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
  }
}

const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  networks: {
    local: {
      host: 'localhost',
      port: 9545,
      gas: 5000000,
      gasPrice: 5e9,
      network_id: '*',
    },
    ropsten: {
      // address: 0x79A560De1CD436d1D69896DDd8DcCb226f9Fa2fD
      provider: function() {
        if (!process.env.POAP_ROPSTEN_PK) {
          console.error('POAP_ROPSTEN_PK env variable is needed');
          process.abort();
        }
        return new HDWalletProvider(
          process.env.POAP_ROPSTEN_PK,
          'https://ropsten.infura.io/v3/cf7a7eed37254ec4b95670607e76a917'
        );
      },
      gas: 5000000,
      gasPrice: 5e9,
      network_id: 3,
    },
  },
};

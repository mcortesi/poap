/*
 * Used when running ganache:
 *
 */

import { Provider } from 'ethers/providers';
import { Wallet } from 'ethers/wallet';
import { EnvVariables } from '.';
import { getDefaultProvider } from 'ethers';

const provider: Provider = getDefaultProvider('ropsten');

// Admin Account
// Address: 0x79A560De1CD436d1D69896DDd8DcCb226f9Fa2fD

if (!process.env.POAP_ROPSTEN_PK) {
  console.error('POAP_ROPSTEN_PK env variable is needed');
  process.abort();
}

const poapAdmin = new Wallet('0x' + process.env.POAP_ROPSTEN_PK!, provider);

// Taken from /eth/zos.ropsten.json
const poapAddress = '0x50C5CA3e7f5566dA3Aa64eC687D283fdBEC2A2F2';

const envVariables: EnvVariables = {
  provider,
  poapAddress,
  poapAdmin,
};

export default envVariables;

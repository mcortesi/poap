import { Provider, JsonRpcProvider } from 'ethers/providers';
import { Wallet, getDefaultProvider } from 'ethers';
import { Address } from '../types';

export interface EnvVariables {
  provider: Provider;
  poapAdmin: Wallet;
  poapAddress: Address;
}

function getDevelopmentVariables(): EnvVariables {
  const provider: Provider = new JsonRpcProvider('http://localhost:9545');

  return {
    provider,
    poapAddress: '0xBe0B0f08A599F07699E98A9D001084e97b9a900A',
    poapAdmin: new Wallet(
      '0xb0057716d5917badaf911b193b12b910811c1497b5bada8d7711f758981c3773',
      provider
    ),
  };
}

function ensureEnvVariable(name: string): string {
  if (!process.env[name]) {
    console.error(`ENV variable ${name} is required`);
    process.exit(1);
  }
  return process.env[name]!;
}

function getVariables(): EnvVariables {
  const network = ensureEnvVariable('ETH_NETWORK');
  // const ownerAddress = ensureEnvVariable('POAP_OWNER_ADDR')
  const ownerPK = ensureEnvVariable('POAP_OWNER_PK');

  const provider: Provider = getDefaultProvider(network);

  return {
    provider,
    poapAddress: ensureEnvVariable('POAP_CONTRACT_ADDR'),
    poapAdmin: new Wallet(ownerPK, provider),
  };
}

const variables =
  process.env.NODE_ENV === 'development' ? getDevelopmentVariables() : getVariables();

export default function getEnv(): EnvVariables {
  return variables;
}

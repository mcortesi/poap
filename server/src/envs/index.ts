import { Provider } from 'ethers/providers';
import { Wallet } from 'ethers';
import { Address } from '../types';

const ValidEnvs = ['development', 'ropsten', 'production'];

export interface EnvVariables {
  provider: Provider;
  poapAdmin: Wallet;
  poapAddress: Address;
}

let currentEnv = process.env.NODE_ENV || 'development';

export function setEnv(name: string) {
  if (!ValidEnvs.includes(name)) {
    throw new Error(`Invalid Env: ${name}`);
  }
  currentEnv = name;
}

export default function getEnv(name?: string): EnvVariables {
  if (name == null) {
    name = currentEnv;
  }
  if (!ValidEnvs.includes(name)) {
    throw new Error(`Invalid Env: ${name}`);
  }
  const env = require(`./${name}`).default;
  return env;
}

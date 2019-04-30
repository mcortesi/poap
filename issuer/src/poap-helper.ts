import getEnv from './envs';
import { join } from 'path';
import { readFileSync } from 'fs';
import { Poap } from './contracts/Poap';
import { Contract } from 'ethers';
import { Address } from './types';

const RESOURCES_DIR = join(__dirname, '../resources');

export function getABI(name: string) {
  return JSON.parse(readFileSync(join(RESOURCES_DIR, `${name}.json`)).toString());
}

const ABI = getABI('Poap');

export function getContract() {
  const env = getEnv();
  return new Contract(env.poapAddress, ABI, env.provider) as Poap;
}

export async function mintToken(eventId: number, toAddr: Address) {
  const contract = getContract();

  // Set a new Value, which returns the transaction
  let tx = await contract.functions.mintToken(eventId, toAddr);

  console.log(tx.hash);

  // The operation is NOT complete yet; we must wait until it is mined
  await tx.wait();
}

export async function getAllTokens(address: Address) {
  const contract = getContract();
  const tokensAmount = (await contract.functions.balanceOf(address)).toNumber();

  let events = [];
  for (let i = 0; i < tokensAmount; i++) {
    let tokenId = await contract.functions.tokenOfOwnerByIndex(address, i);
    let uri = await contract.functions.tokenURI(tokenId);
    events.push({
      uri: uri,
      tokenId: tokenId,
    });
  }
  return events;
}

export async function getTokenInfo(tokenId: number) {
  const contract = getContract();
  const owner = await contract.functions.ownerOf(tokenId);
  const uri = await contract.functions.tokenURI(tokenId);

  return {
    owner: owner,
    uri: uri,
  };
}

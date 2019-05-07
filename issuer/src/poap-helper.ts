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

export function getContract(): Poap {
  const env = getEnv();
  return new Contract(env.poapAddress, ABI, env.poapAdmin) as Poap;
}

/**
 * Estimate gas cost for mintTokenBatch() call.
 * We don't rely on estimateGas() since it fails.
 *
 * The estimated is based on empirical tests and it's
 * also +50% of the actual empirical estimate
 * @param n number of addresses
 */
export function estimateMintingGas(n: number) {
  const delta = 136907;
  const baseCost = 35708;
  return (baseCost + n * delta) * 1.5;
}

export async function mintToken(eventId: number, toAddr: Address) {
  const contract = getContract();

  // Set a new Value, which returns the transaction
  const tx = await contract.functions.mintToken(eventId, toAddr, {
    gasLimit: estimateMintingGas(1),
  });

  console.log(tx.hash);

  // The operation is NOT complete yet; we must wait until it is mined
  await tx.wait();
}

export async function mintTokens(eventId: number, toAddr: Address[]) {
  const contract = getContract();

  // Set a new Value, which returns the transaction
  const tx = await contract.functions.mintTokenBatch(eventId, toAddr, {
    gasLimit: estimateMintingGas(toAddr.length),
  });

  console.log(`mintTokenBatch: transaction: ${tx.hash}`);

  // The operation is NOT complete yet; we must wait until it is mined
  await tx.wait();
  console.log(`mintTokenBatch: Finished ${tx.hash}`);
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

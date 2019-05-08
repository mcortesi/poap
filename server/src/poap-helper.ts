import { Contract } from 'ethers';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Poap } from './poap-eth/Poap';
import getEnv from './envs';
import { Address, TokenInfo } from './types';
import { getEvents } from './db';

const ABI_DIR = join(__dirname, '../../abi');

export function getABI(name: string) {
  return JSON.parse(readFileSync(join(ABI_DIR, `${name}.json`)).toString());
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

export async function getAllTokens(address: Address): Promise<TokenInfo[]> {
  const events = await getEvents();
  const getEvent = (id: number) => {
    const ev = events.find(e => e.id === id);
    if (!ev) {
      throw new Error(`Invalid EventId: ${id}`);
    }
    return ev;
  };

  const contract = getContract();
  const tokensAmount = (await contract.functions.balanceOf(address)).toNumber();

  const tokens: TokenInfo[] = [];
  for (let i = 0; i < tokensAmount; i++) {
    let tokenId = await contract.functions.tokenOfOwnerByIndex(address, i);
    let uri = await contract.functions.tokenURI(tokenId);

    tokens.push({
      event: getEvent(5),
      tokenURI: uri,
      tokenId: tokenId.toString(),
    });
  }
  return tokens;
}

export async function getTokenInfo(tokenId: number) {
  const contract = getContract();
  const owner = await contract.functions.ownerOf(tokenId);
  const uri = await contract.functions.tokenURI(tokenId);
  // const event = getEvent()

  return {
    owner: owner,
    uri: uri,
  };
}

import { Contract, utils } from 'ethers';
import { verifyMessage } from 'ethers/utils';
import { readFileSync } from 'fs';
import { join } from 'path';
import pino from 'pino';
import { getEvent, getEvents, getGasPrice } from './db';
import getEnv from './envs';
import { Poap } from './poap-eth/Poap';
import { Address, Claim, TokenInfo } from './types';

const Logger = pino();
const ABI_DIR = join(__dirname, '../abi');

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
  // Get Gas Price
  const gas = await getGasPrice();
  // Set a new Value, which returns the transaction
  const tx = await contract.functions.mintToken(eventId, toAddr, {
    gasLimit: estimateMintingGas(1),
    gasPrice: utils.parseUnits(gas.price, 'gwei')
  });

  console.log(tx.hash);

  // The operation is NOT complete yet; we must wait until it is mined
  await tx.wait();
}

export async function mintEventToManyUsers(eventId: number, toAddr: Address[]) {
  const contract = getContract();
  // Get Gas Price
  const gas = await getGasPrice();
  // Set a new Value, which returns the transaction
  const tx = await contract.functions.mintEventToManyUsers(eventId, toAddr, {
    gasLimit: estimateMintingGas(toAddr.length),
    gasPrice: utils.parseUnits(gas.price, 'gwei')
  });

  console.log(`mintTokenBatch: transaction: ${tx.hash}`);

  // The operation is NOT complete yet; we must wait until it is mined
  await tx.wait();
  console.log(`mintTokenBatch: Finished ${tx.hash}`);
}

export async function mintUserToManyEvents(eventIds: number[], toAddr: Address) {
  const contract = getContract();
  // Get Gas Price
  const gas = await getGasPrice();
  // Set a new Value, which returns the transaction
  const tx = await contract.functions.mintUserToManyEvents(eventIds, toAddr, {
    gasLimit: estimateMintingGas(eventIds.length),
    gasPrice: utils.parseUnits(gas.price, 'gwei')
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
    const { tokenId, eventId } = await contract.functions.tokenDetailsOfOwnerByIndex(address, i);
    tokens.push({
      event: getEvent(eventId.toNumber()),
      tokenId: tokenId.toString(),
      owner: address,
    });
  }
  return tokens;
}

export async function getTokenInfo(tokenId: string | number): Promise<TokenInfo> {
  const contract = getContract();
  const eventId = await contract.functions.tokenEvent(tokenId);
  const owner = await contract.functions.ownerOf(tokenId);
  const event = await getEvent(eventId.toNumber());
  if (!event) {
    throw new Error('Invalid Event Id');
  }
  return {
    event,
    tokenId: tokenId.toString(),
    owner,
  };
}

export async function verifyClaim(claim: Claim): Promise<boolean> {
  const event = await getEvent(claim.eventId);

  if (!event) {
    throw new Error('Invalid Event Id');
  }

  Logger.info({ claim }, 'Claim for event: %d from: %s', claim.eventId, claim.claimer);

  const claimerMessage = JSON.stringify([claim.claimId, claim.eventId, claim.claimer, claim.proof]);

  Logger.info({ claimerMessage }, 'claimerMessage');

  const supposedClaimedAddress = verifyMessage(claimerMessage, claim.claimerSignature);

  if (supposedClaimedAddress !== claim.claimer) {
    console.log('invalid claimer signature');
    return false;
  }

  const proofMessage = JSON.stringify([claim.claimId, claim.eventId, claim.claimer]);
  Logger.info({ proofMessage }, 'proofMessage');
  const signerAddress = verifyMessage(proofMessage, claim.proof);

  if (signerAddress !== event.signer) {
    console.log('invalid signer signature');
    return false;
  }

  return true;
}


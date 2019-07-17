import { Contract, getDefaultProvider } from 'ethers';
import { getAddress } from 'ethers/utils';
import * as csv from 'fast-csv';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import getEnv from './envs';
import { Poap } from './poap-eth/Poap';
import { estimateMintingGas, getContract } from './poap-helper';
import { Address } from './types';
import { concurrentMap } from './utils';

/******************************************************
 * PARAMETERS
 ******************************************************/
const GAS_PRICE = 5e9; // 1e9 == 1 gwei
const LAST_TXHASH = '0x4712b67555ad0c1fc90676e03bfb4a37b3815315db35e4759d93ef524b797162';

/**
 * Get Old Contract iface.
 * We only need to query tokenURI
 */
function getOldContract() {
  const provider = getDefaultProvider('homestead');
  const ABI = ['function tokenURI(uint256 tokenId) view returns (string memory)'];
  const OldContractAddress = '0xa1eb40c284c5b44419425c4202fa8dabff31006b';
  const contract = new Contract(OldContractAddress, ABI, provider);
  return contract;
}

type TokenStruct = {
  id: string;
  owner: Address;
  eventId: string;
};

const URIPrefix = 'https://www.poap.xyz/events/jsons/'.length;
const URISuffix = '.json'.length;
const extractEventId = (tokenURI: string) => tokenURI.slice(URIPrefix, tokenURI.length - URISuffix);

function writeTokensJson(filepath: string, tokens: TokenStruct[]) {
  const content = JSON.stringify(tokens, null, 2);
  writeFileSync(filepath, content);
}

function readTokensJson(filepath: string): TokenStruct[] {
  return JSON.parse(readFileSync(filepath).toString());
}

function readEherscanTXDump(txcsvPath: string): Promise<TokenStruct[]> {
  return new Promise<TokenStruct[]>((resolve, reject) => {
    const tokens = new Map<string, TokenStruct>();

    csv
      .fromPath(txcsvPath, { headers: true })
      .on('data', data => {
        tokens.set(data['Token_ID'], {
          id: data['Token_ID'],
          owner: data['To'],
          eventId: '',
        });
      })
      .on('end', () => {
        resolve(Array.from(tokens.values()));
      });
  });
}

function populateEventId(tokens: TokenStruct[]) {
  const contract = getOldContract();
  return concurrentMap(
    tokens,
    async (token: TokenStruct) => {
      const uri = await contract.functions.tokenURI(token.id);
      token.eventId = extractEventId(uri);
      return token;
    },
    { workers: 10 }
  );
}

function groupByEvent(tokens: TokenStruct[]): Map<string, TokenStruct[]> {
  const eventTokens = new Map();
  for (const token of tokens) {
    if (!eventTokens.has(token.eventId)) {
      eventTokens.set(token.eventId, [token]);
    } else {
      eventTokens.get(token.eventId).push(token);
    }
  }
  return eventTokens;
}

export async function generateTokenJson(txcsvPath: string, tokenJsonPath: string) {
  let tokens = await readEherscanTXDump(txcsvPath);
  tokens = await populateEventId(tokens);

  console.log(`Found ${tokens.length} tokens`);
  writeTokensJson(tokenJsonPath, tokens);
}

export async function writeContract(
  tokenJsonPath: string,
  last: { eventId: string; address: string }
) {
  const eventTokens = groupByEvent(readTokensJson(tokenJsonPath));
  const BATCH_SIZE = 10;
  const eventIds = Array.from(eventTokens.keys());

  const contract = getContract().connect(getEnv().poapAdmin) as Poap;

  console.log('Number of Events:', eventIds.length);

  let i = eventIds.indexOf(last.eventId);
  // let nonce = 881;
  abortOn(i === -1, `Didn\'t find eventId: ${last.eventId}). Aborting`);
  for (; i < eventIds.length; i++) {
    const eventId = eventIds[i];
    const tokens = eventTokens.get(eventId) as TokenStruct[];

    let j = 0;
    if (eventId === last.eventId) {
      const isLastAddress = (t: TokenStruct) => getAddress(t.owner) === last.address;
      j = tokens.findIndex(isLastAddress);
      abortOn(
        j === -1,
        `Didn\'t find token with owner ${last.address} (eventId: ${last.eventId}). Aborting`
      );
      j = j + 1; // move to the next one

      abortOn(
        tokens.slice(j).some(isLastAddress), //there is another with the same owner
        `More than one token with event: ${last.address} and owner: ${last.address}`
      );
      console.log(`Resuming at eventIdx=${i}, addrIdx=${j}`);
    }

    while (j < tokens.length) {
      console.log(`CurrentAction: eventIdx=${i}, addrIdx=${j}`);
      const endJ = Math.min(j + BATCH_SIZE, tokens.length);
      const addresses = tokens.slice(j, endJ).map(t => t.owner);

      // console.log(`mintTokenBatch(${eventId}, ${addresses})`);
      const tx = await contract.functions.mintEventToManyUsers(eventId, addresses, {
        // nonce: nonce++,
        gasLimit: estimateMintingGas(BATCH_SIZE),
        gasPrice: GAS_PRICE, ///// TODO Add db Gas Price here.
      });
      console.log(`Waiting for tx: ${tx.hash}`);
      await tx.wait();
      j = endJ;
    }
  }
}

export async function getLastTransfer(
  txHash: string
): Promise<{ eventId: string; address: string }> {
  const contract = getContract();
  const provider = contract.provider;
  const tx = await provider.getTransaction(txHash);
  const parsedTx = contract.interface.parseTransaction(tx);

  const [eventId, addresses] = parsedTx.args;

  return {
    eventId: eventId.toString(),
    address: getAddress(addresses[addresses.length - 1].toString()),
  };
}

function printHelpAndExit() {
  console.log('Bad Usage! Missing Command');
  console.log(`Usage: ${process.argv[0]} ${process.argv[1]} (tokenjson|writecontract)`);
  process.exit(1);
}

async function main() {
  const DumpsPath = join(__dirname, '../dumps/');

  if (process.argv.length < 3) {
    printHelpAndExit();
  }

  const command = process.argv[2];
  if (command == 'tokenjson') {
    await generateTokenJson(
      join(DumpsPath, 'etherscan-export-19-05-27.csv'),
      join(DumpsPath, 'tokens.json')
    );
  } else if (command == 'writecontract') {
    console.log(`Last tx was: ${LAST_TXHASH}`);
    const last = await getLastTransfer(LAST_TXHASH);
    console.log(`Last EventId: ${last.eventId} TokenOwner: ${last.address}`);
    await writeContract(join(DumpsPath, 'tokens.json'), last);
  } else {
    printHelpAndExit();
  }
}

main().catch(err => {
  console.error('Failed', err);
});

function abortOn(condition: boolean, msg: string) {
  if (condition) {
    console.error(msg);
    process.exit(1);
  }
}

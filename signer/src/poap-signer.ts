#!/usr/bin/env node
import commander from 'commander';
import { Wallet } from 'ethers';
import fastifyFactory from 'fastify';
// @ts-ignore
import fastifyCompress from 'fastify-compress';
import fastifyCors from 'fastify-cors';
import fastifyHelmet from 'fastify-helmet';
import createError from 'http-errors';
import uuidv1 from 'uuid/v1';

const program = commander
  .option('-g --genkeys', 'Generate Addres/Private key pair')
  .option('-p --port <number>', 'Port to listen to', v => parseInt(v), 8080)
  .option('-e --event <number>', 'EventID for signing', v => parseInt(v))
  .option('-k --sk <privatekey>', 'Private Key for signing')
  .parse(process.argv);

if (program.genkeys) {
  const w = Wallet.createRandom();
  console.log('Generating Signer Address & Private Key');
  console.log(`Address: ${w.address}`);
  console.log(`Private Key: ${w.privateKey}`);

  console.log('Now call poap-signer using the private key');
  console.log(`  poap-signer --sk ${w.privateKey} ...`);
  console.log('Remember to save the address in POAP Backofice');
  process.exit(0);
}

if (!program.event) {
  console.error('event is Required');
  program.help();
}
if (!program.sk) {
  console.error('privateKey is Required');
  program.help();
}

if (program.sk.length != 66 || !program.sk.match(/^0x[a-f0-9]{64}$/i)) {
  console.error('Invalid privateKey. It should be an hexstring 66 long.');
  program.help();
}

const signerWallet = new Wallet(program.sk);

const fastify = fastifyFactory({
  logger: {
    prettyPrint: true,
  },
});

fastify.register(fastifyHelmet, {
  hidePoweredBy: true,
});

fastify.register(fastifyCors, {});
fastify.register(fastifyCompress, {});

fastify.get('/check', async (req, res) => {
  return {
    eventId: program.event,
  };
});

fastify.post(
  '/api/proof',
  {
    schema: {
      body: {
        type: 'object',
        required: ['eventId', 'claimer'],
        properties: {
          eventId: { type: 'integer', minimum: 1 },
          claimer: {
            type: 'string',
            minLength: 42,
            maxLength: 42,
            pattern: '^0x[0-9a-fA-F]{40}$',
          },
        },
      },
      // response: {
      //   type: 'object',
      //   properties: {
      //     eventId: { type: 'integer', minimum: 1 },
      //     claimer: 'address#',
      //     proof: 'signature#',
      //   },
      // },
    },
  },
  async req => {
    const { eventId, claimer }: { eventId: number; claimer: string } = req.body;

    if (eventId != program.event) {
      return new createError.BadRequest('Invalid EventId');
    }

    const claimId = uuidv1();
    const msg = JSON.stringify([claimId, eventId, claimer]);
    const proof = await signerWallet.signMessage(msg);
    return {
      claimId,
      eventId,
      claimer,
      proof,
    };
  }
);

const start = async () => {
  console.log(`POAP Signer Started (v1.1):`);
  console.log(`EventID: ${program.event}`);

  try {
    await fastify.listen(program.port, '0.0.0.0');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();

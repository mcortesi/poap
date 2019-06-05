# POAP: Proof of Attendance Protocol

## Directory Sructure

POAP is dividided in the following applications/projects:

- **eth**: ZeppelinOS project with POAP Contracts
- **website**: Public website. Static website for poap
- **server**: POAP's api server. All server logic goes here
- **client**: React web application that represents the UI of the application. Uses _server_ as backend.
- **signer**: Signer server, to be deployed on the event site in a private network address.

Other directories:

- **scripts**: utility scripts
- **db**: SQL Schema and dump for poap

## Architecture

POAP app is composed of:

- **POAP NFT Contract**. Ethereum smart contract that represents an NFT token. Each token represent a attestation of attendance
  to a given event. Thus, token holders can attest their attendance to events by holding tokens.
- **PostgresSQL DB**. Relational DB that maintains information about the events in POAP. New events can be added through the
  backoffice. It's currently deployed as a Google Cloud SQL database
- **Backend Server**. Node.js server backend. Provides an API to scan an address, claim a token, and backoffice administration tasks.
  Interacts with the database, and also with the smart contract.
- **Client**. React application, hosted in firebase. It provides a UI for claim, scan and the backoffice. All operations goes
  through the backend server API.
- **Signer**. Small node.js server, that plays an important part on the attestation protocol. The client access it during the claim
  procedure. The event organizer runs it as a npm module with `npx poap-signer`. One signers is to be deployed for every event, on the event site.

## How does a claim work?

Poap attestation protocol works by deploying a signer in the venue of the event. The signer is to be deployed on an private ip, that's
only accesible by those who are on the local wifi network. Thus, if you can reach the signer, that "attest" that you are on the venue
for that event.

Claim steps:

1.  The user enters the claim url on the client app: `https://app.poap.xyz/claim/{my-event}`
2.  The client app, obtains the _signer ip_ from the _backend api_; and tests it can connect to it.
3.  The client app, obtains the user's _address_ from the user's wallet (Metamask for example)
4.  The client app, post a claim request to the signer, with the user's address.
5.  The signer service, receives the claim request, validates it's for the correct event, and cryptographicaly signs the request.
6.  The client app ask the user to signed the "signed claim request" it has receieved from the signer.
7.  The client app sends the double signed claim request (signed by the user and the signer) to the backend server
8.  The backend server, checks the correctness of both signatures and if everyting ok call the smart contract to mint a token for the user

## Deployed Contracts

Poap contract is already deployed in:

- **Ropsten** `0x50C5CA3e7f5566dA3Aa64eC687D283fdBEC2A2F2`
- **Mainnet** `0x22C1f6050E56d2876009903609a2cC3fEf83B415`

## Setup

## Initial Setup

### Install dependencies

    yarn install
    (cd server; yarn install)
    (cd client; yarn install)
    (cd eth; yarn install)

### Create Database & DBUser

You'll need a postgresDB database. Install postgresql and then:

```bash
sudo su - postgres             # Don't needed in Mac
createuser -s -W -P poap       # (enter poap as password)
createdb -O poap poap_dev      # dev database
createdb -O poap poap_test     # test database
logout                         # Don't needed in Mac
```

## Run the application

### Create & Populate local DB

on project's root:

    yarn db:reset

### Run Ganache

    yarn ganache

After each time you run ganache, you'll need to deploy contracts:

    yarn contracts:deploy:dev
    yarn contracts:migrate:dev # optional: to migrate current mainnet token holders

### Start Apps in Dev Mode

From root folder:

    yarn start:client
    yarn start:server

## Deployment

### Deploy to ropsten (first time only)

    cd eth/
    npx zos session --network ropsten --from 0x79A560De1CD436d1D69896DDd8DcCb226f9Fa2fD --expires 3600
    npx zos push
    npx zos create Poap --init initialize --args '"POAP","The Proof of Attendance Protocol","https://api.poap.xyz/metadata/",[]'

This was already done. The POAP Address is: `0x50C5CA3e7f5566dA3Aa64eC687D283fdBEC2A2F2`

### Deploy to mainnet (first time only)

    cd eth/
    export POAP_MAIN_PK="<KEYHERE>"
    npx zos session --network mainnet --from 0xe583f95bF95d0883F94EfE844442C8bfc9dd7A7F --expires 3600
    npx zos push
    npx zos create Poap --init initialize --args '"POAP","The Proof of Attendance Protocol","https://api.poap.xyz/metadata/",[]'

This was already done. The POAP Address is: `0x22C1f6050E56d2876009903609a2cC3fEf83B415`

### Upgrade Contract logic

If you change contract logic and want to update it:

    # Make sure there is no running session for zos (check for existent eth/.zos.session )
    cd eth/
    npx zos session --network ropsten --from 0x79A560De1CD436d1D69896DDd8DcCb226f9Fa2fD --expires 3600
    npx zos push
    npx zos update Poap

### Deploy Client (firebase)

    cd client
    yarn deploy   # Will build & run firebase deploy

### Deploy Server (google app engine)

Prerequisites:

1.  Make sure you have the `app.yaml` in `server/`. This file is not in the github repository
2.  Make sure you have google-cloud-skd installed and in your \$PATH.
3.  Maker sure you have already run `gcloud init`

Steps:

    cd server/
    gcloud app deploy --verbosity=info

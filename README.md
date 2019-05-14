## Setup

## On Initial Setup

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

    yarn start:client
    yarn start:server

## Deployment

### Deploy to ropsten (first time only)

    npx zos session --network ropsten --from 0x79A560De1CD436d1D69896DDd8DcCb226f9Fa2fD --expires 3600
    npx zos push
    npx zos create Poap --init initialize --args '"POAP","The Proof of Attendance Protocol","https://ropsten.poap.xyz",[]'

This was already done. The POAP Address is: `0x50C5CA3e7f5566dA3Aa64eC687D283fdBEC2A2F2`

### Migrate Token Owner from Old Contract

## Description

We have differentes interfaces:

- Admin Site
- Public Site

### Admin Site

User Flows:

- Login/Logout
- Issue a token/s
- Create new Event
- Assign eventMinter
- Query Contract?

### Public Site

User Flows

- List My Tokens
- Get Token for user via address/ens lookup
- Token Detail
- Landing webpage
- Claim a Badge (internal site)

## User Flows

### Login

Check Auth0

### Issue a token

1. Choose Event from list
2. Input a number of addresses
3. Send TX
4. Wait for confirmation

### Create Event

1. Input Name
2. Input Json Metadata
3. Input list of event minter address
4. Save

### Manage Event Minters

1. Server renders list of current EventMinters
2. Add Event Minter
3. Input Address.
4. Send
5. Wait for Confirmation
6. Remove Event Minter
7. Press delete button
8. Wait for Confirmation

Maybe all this can happen through metamask

### List Tokens

1. Enter Address or ENS name (can be autocomopleted from metamask)
2. Server Renders Page with all tokens
3. Enter Token Detail

### Claim a Badge

## DB Model

Event Table:

- id
- json metadata
- name

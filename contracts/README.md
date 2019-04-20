## Setup

Install ganache-cli

```bash
npm install -g ganache-cli
npm install
ganache-cli --port 9545 --deterministic
npx zos session --network local --from 0x1df62f291b2e969fb0849d99d9ce41e2f137006e --expires 3600
```

```bash
# Create session
npx zos session --network local --from 0x1df62f291b2e969fb0849d99d9ce41e2f137006e --expires 3600

# Create commands
npx zos add MyContract
npx zos push

# create instance
npx zos create MyContract --init initialize --args 42,hitchhiker


npx truffle console --network local

# Upgrade commands
npx zos push
npx zos update MyContract
```

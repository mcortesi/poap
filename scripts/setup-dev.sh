#!/usr/bin/env bash

rootdir="$(dirname "${BASH_SOURCE[0]}")/.."

cd $rootdir
cd contracts

npx zos session --network local --from 0x1df62f291b2e969fb0849d99d9ce41e2f137006e --expires 3600
npx zos push
npx zos create Poap --init initialize --args '"Poap","POAP","https://poap.xyz",[]'
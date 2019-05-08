#!/usr/bin/env bash

rootdir="$(dirname "${BASH_SOURCE[0]}")/.."

cd $rootdir

echo "            "
echo "🚩 ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖ 🚩"
echo "✨✨✨  Compiling contracts...   ✨✨✨"
(cd eth; yarn run build) ||
{ echo Error building contracts ; exit 1; }


echo "            "
echo "🚩 ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖ 🚩"
echo "✨✨✨  Extracting ABI...   ✨✨✨"
(node ./scripts/extract-abi.js) ||
{ echo Error extracting ABI ; exit 1; }

echo "            "
echo "🚩 ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖ 🚩"
echo "✨✨✨  Generating Contract Types...   ✨✨✨"
(yarn typechain --target ethers --outDir ./server/src/poap-eth './abi/*.json') ||
{ echo Error extracting ABI ; exit 1; }


echo "            "
echo "🚩 ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖ 🚩"
echo "✨✨✨                   RESULTS                           ✨✨✨"
echo "🚩 ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖ 🚩"
echo "   Smart Contract in ./eth compiled                               "
echo "   Generated ABIs                    ->    ./abi/                 "
echo "   Generated Typescript mappings     ->    ./server/src/poap-eth  "
echo "🚩 ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖ 🚩"
#!/usr/bin/env bash

rootdir="$(dirname "${BASH_SOURCE[0]}")/.."

cd $rootdir

echo "            "
echo "🚩 ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖ 🚩"
echo "✨✨✨  Compiling contracts...   ✨✨✨"
(cd contracts; yarn run build) ||
{ echo Error building contracts ; exit 1; }


echo "            "
echo "🚩 ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖ 🚩"
echo "✨✨✨  Extracting ABI...   ✨✨✨"
(node ./scripts/extract-abi.js) ||
{ echo Error extracting ABI ; exit 1; }

echo "            "
echo "🚩 ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖ 🚩"
echo "✨✨✨  Generating Contract Types...   ✨✨✨"
(cd issuer; yarn gensrc) ||
{ echo Error extracting ABI ; exit 1; }
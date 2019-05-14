const fs = require('fs');
const path = require('path');

const Contracts = ['Poap'];

const buildDir = path.join(__dirname, '../eth/build/contracts');

const outputDir = path.join(__dirname, '../server/abi');

if (!fs.existsSync(outputDir)) {
  console.log(`Creating output dir`);
  fs.mkdirSync(outputDir);
}

for (const name of Contracts) {
  console.log(`Parsing '${name}' contract`);
  const filepath = path.join(buildDir, name + '.json');
  const json = JSON.parse(fs.readFileSync(filepath).toString());

  const outpath = path.join(outputDir, name + '.json');

  fs.writeFileSync(outpath, JSON.stringify(json['abi'], null, 2));
}

const fs = require('fs');
const path = require('path');
const solc = require('solc');

const contractPath = path.resolve(__dirname, '../contracts', 'CharacterRegistry.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'CharacterRegistry.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};

console.log('Compiling CharacterRegistry.sol...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  output.errors.forEach((err) => {
    console.error(err.formattedMessage);
  });
  if (output.errors.some(err => err.severity === 'error')) {
      process.exit(1);
  }
}

const contract = output.contracts['CharacterRegistry.sol']['CharacterRegistry'];

// Ensure directories exist
const abiDir = path.resolve(__dirname, '../src/abi');
if (!fs.existsSync(abiDir)) {
  fs.mkdirSync(abiDir, { recursive: true });
}

// Write ABI for frontend
const abiPath = path.resolve(abiDir, 'CharacterRegistryABI.json');
fs.writeFileSync(abiPath, JSON.stringify(contract.abi, null, 2));
console.log(`ABI saved to ${abiPath}`);

// Write complete artifact for deployment (ABI + Bytecode)
const artifactPath = path.resolve(__dirname, 'CharacterRegistryArtifact.json');
const artifact = {
  abi: contract.abi,
  bytecode: contract.evm.bytecode.object,
};
fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
console.log(`Artifact saved to ${artifactPath}`);

console.log('Compilation successful!');

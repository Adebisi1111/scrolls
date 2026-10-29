const { createWalletClient, createPublicClient, http, parseAbi } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { defineChain } = require('viem');
const fs = require('fs');

const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: { default: { http: ['https://arc-testnet.rpc.thirdweb.com'] } },
  testnet: true,
});

const account = privateKeyToAccount('0x023d076ab40ea46c59ac7ca7cecfaa2db5fa10b7a481aef27cf68e9cc5a8c0af');
console.log('Deployer address:', account.address);

const walletClient = createWalletClient({
  account,
  chain: arcTestnet,
  transport: http('https://arc-testnet.rpc.thirdweb.com'),
});

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http('https://arc-testnet.rpc.thirdweb.com'),
});

// Read compiled bytecode
const artifact = JSON.parse(fs.readFileSync('/home/administrator/scrolls-local2/contracts/out/ContentPaywall.sol/ContentPaywall.json', 'utf8'));
const bytecode = artifact.bytecode.object;

// Constructor args: USDC token (0x3600...0000) and initial owner (0x5B12...b1Ef42)
const usdcToken = '0x3600000000000000000000000000000000000000';
const initialOwner = '0x5B12Ce46C7194aD57d143bC22847224047b1Ef42';

// Encode constructor args (address, address)
function encodeAddress(addr) {
  return addr.slice(2).padStart(64, '0');
}
const constructorArgs = encodeAddress(usdcToken) + encodeAddress(initialOwner);
const fullBytecode = bytecode + constructorArgs;

async function deploy() {
  console.log('Deploying contract...');
  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: fullBytecode,
    args: [usdcToken, initialOwner],
  });
  console.log('Tx hash:', hash);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log('Contract address:', receipt.contractAddress);
  console.log('Status:', receipt.status);
}

deploy().catch(console.error);

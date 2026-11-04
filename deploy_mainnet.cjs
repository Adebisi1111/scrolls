const { createWalletClient, createPublicClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { defineChain } = require('viem');
const fs = require('fs');

const arcMainnet = defineChain({
  id: 5042,
  name: 'Arc Mainnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.mainnet.arc.io'] } },
});

const privateKey = fs.readFileSync('/home/administrator/.arc-deployer.key', 'utf8').trim();
const account = privateKeyToAccount(privateKey);
console.log('Deployer address:', account.address);

const walletClient = createWalletClient({
  account,
  chain: arcMainnet,
  transport: http('https://rpc.mainnet.arc.io'),
});

const publicClient = createPublicClient({
  chain: arcMainnet,
  transport: http('https://rpc.mainnet.arc.io'),
});

const artifact = JSON.parse(fs.readFileSync('/home/administrator/scrolls-local2/contracts/out/ContentPaywall.sol/ContentPaywall.json', 'utf8'));
const bytecode = artifact.bytecode.object;

const usdcToken = '0x3600000000000000000000000000000000000000';
const initialOwner = account.address;

async function deploy() {
  console.log('Deploying ContentPaywall to Arc Mainnet...');
  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode,
    args: [usdcToken, initialOwner],
  });
  console.log('Tx hash:', hash);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log('Contract address:', receipt.contractAddress);
  console.log('Status:', receipt.status);
  console.log('Gas used:', receipt.gasUsed.toString());
}

deploy().catch(console.error);
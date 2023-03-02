const contracts = require("./mergeDeployed");

let isDev;
let isTestnet;
let isStage;
let isProd;

if (typeof window !== "undefined") {
  isDev = /localhost/.test(window.location.origin);
  isStage = /(staking-stage||jeroyafra).mob.land(|\.local)$/.test(
    window.location.hostname
  );
  isTestnet = isDev || isStage;
  isProd = /staking.mob.land(|\.local)$/.test(window.location.hostname);
} else if (!!process) {
  isDev = isTestnet = true;
}

const abi = Object.assign(
  require("./ABIs.json").contracts,
  require("./seedABIs.json").contracts
);

const config = {
  supportedId: {
    1: {
      chainId: "0x" + Number(1).toString(16),
      chainName: "Ethereum",
      nativeCurrency: {
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: ["https://mainnet.infura.io/v3/"],
      blockExplorerUrls: ["https://etherscan.io"],
    },
    56: {
      chainId: "0x" + Number(56).toString(16),
      chainName: "BNB Chain",
      nativeCurrency: {
        name: "BNB",
        symbol: "BNB",
        decimals: 18,
      },
      rpcUrls: ["https://bsc-dataseed.binance.org"],
      blockExplorerUrls: ["https://bscscan.com"],
    },
    80001: isDev
      ? {
          chainId: "0x" + Number(80001).toString(16),
          chainName: "Mumbai Polygon Testnet",
          rpcUrls: ["https://rpc-mumbai.matic.today"],
          blockExplorerUrls: ["https://mumbai-explorer.matic.today"],
          nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18,
          },
        }
      : undefined,
    3: {
      chainId: "0x" + Number(3).toString(16),
      chainName: "Ropsten",
      nativeCurrency: {
        name: "rETH",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: ["https://ropsten.infura.io/v3/"],
      blockExplorerUrls: ["https://ropsten.etherscan.io"],
      isTestnet: true,
    },
    44787: {
      chainId: "0x" + Number(44787).toString(16),
      chainName: "Alfajores",
      nativeCurrency: {
        name: "CELO",
        symbol: "CELO",
        decimals: 18,
      },
      rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
      blockExplorerUrls: ["https://alfajores-blockscout.celo-testnet.org"],
      isTestnet: true,
    },
    5: {
      chainId: "0x" + Number(5).toString(16),
      chainName: "Goerli",
      nativeCurrency: {
        name: "gETH",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: ["https://goerli.infura.io/v3/"],
      blockExplorerUrls: ["https://goerli.etherscan.io"],
    },
    42: {
      chainId: "0x" + Number(42).toString(16),
      chainName: "Kovan",
      nativeCurrency: {
        name: "kETH",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: ["https://kovan.infura.io/v3/"],
      blockExplorerUrls: ["https://kovan.etherscan.io"],
      isTestnet: true,
    },
    97: {
      chainId: "0x" + Number(97).toString(16),
      chainName: "BNB Chain Testnet",
      nativeCurrency: {
        name: "BNB",
        symbol: "BNB",
        decimals: 18,
      },
      rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
      blockExplorerUrls: ["https://testnet.bscscan.com"],
    },
    1337: isDev
      ? {
          chainId: "0x" + Number(1337).toString(16),
          chainName: "Localhost 8545",
          nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
          },
          rpcUrls: ["http://localhost:8545"],
          blockExplorerUrls: [],
        }
      : undefined,
    43113: {
      chainId: "0x" + Number(43113).toString(16),
      chainName: "Fuji",
      nativeCurrency: {
        name: "AVAX",
        symbol: "AVAX",
        decimals: 18,
      },
      rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
      blockExplorerUrls: ["https://cchain.explorer.avax-test.network"],
      isTestnet: true,
    },
  },
  contracts,
  geckoApi:
    "https://api.coingecko.com/api/v3/simple/price?ids=syndicate-2&vs_currencies=usd&include_24hr_change=true",
  abi,
  isTestnet,
  isDev,
  isStage,
  isProd,
  title: "Mobland",
  tokenTypes: {
    S_SYNR_SWAP: 1,
    SYNR_STAKE: 2,
    SYNR_PASS_STAKE_FOR_BOOST: 3,
    SYNR_PASS_STAKE_FOR_SEEDS: 4,
    BLUEPRINT_STAKE_FOR_BOOST: 5,
    BLUEPRINT_STAKE_FOR_SEEDS: 6,
    SEED_SWAP: 7,
  },
  chainToChain: {
    44787: 43113,
    43113: 44787,
    1: 56,
    56: 1,
  },
};

module.exports = config;

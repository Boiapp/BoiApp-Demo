export const CHAIN_ID = {
  MATIC_TESTNET: 80001,
  MATIC_MAINNET: 137,
  BSC_TESTNET: 97,
  BSC_MAINNET: 56,
};

export const FACTORY_ADDRESS = {
  MATIC_TESTNET: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
  MATIC_MAINNET: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
  BSC_TESTNET: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
  BSC_MAINNET: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
};

export const TOKEN_ADDRESS = {
  MATIC_TESTNET: "0xC7932824AdF77761CaB1988e6B886eEe90D35666",
  MATIC_MAINNET: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
  BSC_TESTNET: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
  BSC_MAINNET: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
};

export const chain = {
  BSC: {
    name: "Binance Smart Chain Mainnet",
    chain: "BSC",
    rpc: [
      "https://bsc-dataseed1.binance.org",
      "https://bsc-dataseed2.binance.org",
      "https://bsc-dataseed3.binance.org",
      "https://bsc-dataseed4.binance.org",
      "https://bsc-dataseed1.defibit.io",
      "https://bsc-dataseed2.defibit.io",
      "https://bsc-dataseed3.defibit.io",
      "https://bsc-dataseed4.defibit.io",
      "https://bsc-dataseed1.ninicoin.io",
      "https://bsc-dataseed2.ninicoin.io",
      "https://bsc-dataseed3.ninicoin.io",
      "https://bsc-dataseed4.ninicoin.io",
      "wss://bsc-ws-node.nariox.org",
    ],
    faucets: ["https://free-online-app.com/faucet-for-eth-evm-chains/"],
    nativeCurrency: {
      name: "Binance Chain Native Token",
      symbol: "BNB",
      decimals: 18,
    },
    infoURL: "https://www.binance.org",
    shortName: "bnb",
    chainId: `0x${Number(56).toString(16)}`,
    networkId: 56,
    slip44: 714,
    explorers: [
      { name: "bscscan", url: "https://bscscan.com", standard: "EIP3091" },
    ],
  },
  BSCT: {
    name: "Binance Smart Chain Testnet",
    chain: "BSC",
    rpc: [
      "https://data-seed-prebsc-1-s1.binance.org:8545",
      "https://data-seed-prebsc-2-s1.binance.org:8545",
      "https://data-seed-prebsc-1-s2.binance.org:8545",
      "https://data-seed-prebsc-2-s2.binance.org:8545",
      "https://data-seed-prebsc-1-s3.binance.org:8545",
      "https://data-seed-prebsc-2-s3.binance.org:8545",
    ],
    faucets: ["https://testnet.binance.org/faucet-smart"],
    nativeCurrency: {
      name: "Binance Chain Native Token",
      symbol: "tBNB",
      decimals: 18,
    },
    infoURL: "https://testnet.binance.org/",
    shortName: "bnbt",
    chainId: `0x${Number(97).toString(16)}`,
    networkId: 97,
    explorers: [
      {
        name: "bscscan-testnet",
        url: "https://testnet.bscscan.com",
        standard: "EIP3091",
      },
    ],
  },
  AVAXT: {
    name: "Avalanche Fuji Testnet",
    chain: "AVAX",
    rpc: ["https://api.avax-test.network/ext/bc/C/rpc"],
    faucets: ["https://faucet.avax-test.network/"],
    nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
    infoURL: "https://cchain.explorer.avax-test.network",
    shortName: "Fuji",
    chainId: `0x${Number(43114).toString(16)}`,
    chainId: 43113,
    networkId: 1,
    explorers: [
      {
        name: "snowtrace",
        url: "https://testnet.snowtrace.io",
        standard: "EIP3091",
      },
    ],
  },
  AVAX: {
    name: "Avalanche C-Chain",
    chain: "AVAX",
    rpc: ["https://api.avax.network/ext/bc/C/rpc"],
    faucets: ["https://free-online-app.com/faucet-for-eth-evm-chains/"],
    nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
    infoURL: "https://www.avax.network/",
    shortName: "avax",
    chainId: `0x${Number(43114).toString(16)}`,
    networkId: 43114,
    slip44: 9005,
    explorers: [
      {
        name: "snowtrace",
        url: "https://snowtrace.io",
        standard: "EIP3091",
      },
    ],
  },
  MUMBAI: {
    name: "Polygon Testnet Mumbai",
    chain: "Polygon",
    rpc: [
      "https://rpc-mumbai.matic.today",
      "https://matic-mumbai.chainstacklabs.com",
      "https://rpc-mumbai.maticvigil.com",
      "https://matic-testnet-archive-rpc.bwarelabs.com",
    ],
    faucets: ["https://faucet.polygon.technology/"],
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    infoURL: "https://polygon.technology/",
    shortName: "maticmum",
    chainId: `0x${Number(80001).toString(16)}`,
    networkId: 80001,
    explorers: [
      {
        name: "polygonscan",
        url: "https://mumbai.polygonscan.com",
        standard: "EIP3091",
      },
    ],
  },
};

const ABI = {
  CancelStakeRequest: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "orderId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "account",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "lockedUntil",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "stakeLockedUntil",
          type: "uint256",
        },
      ],
      name: "CancelStakeRequest",
      type: "event",
    },
  ],
  MintAndStakeRequested: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "orderId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "lockedUntil",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "stakeLockedUntil",
          type: "uint256",
        },
      ],
      name: "MintAndStakeRequested",
      type: "event",
    },
  ],
  CancelRequest: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "orderId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "account",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "lockedUntil",
          type: "uint256",
        },
      ],
      name: "CancelRequest",
      type: "event",
    },
  ],
  MintRequested: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "orderId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "lockedUntil",
          type: "uint256",
        },
      ],
      name: "MintRequested",
      type: "event",
    },
  ],
  Transfer: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
  ],
  Locked: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "tokendId",
          type: "uint256",
        },
      ],
      name: "Locked",
      type: "event",
    },
  ],
  Locked2: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "locked",
          type: "bool",
        },
      ],
      name: "Locked",
      type: "event",
    },
  ],
  Unlocked: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "tokendId",
          type: "uint256",
        },
      ],
      name: "Unlocked",
      type: "event",
    },
  ],
  Staked: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "_by",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "_from",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "Staked",
      type: "event",
    },
  ],
  Unstaked: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "_by",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "_to",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "Unstaked",
      type: "event",
    },
  ],
  YieldClaimed: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "_by",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "_to",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "sSyn",
          type: "bool",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "YieldClaimed",
      type: "event",
    },
  ],
  TransferERC20: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
  ],
  OracleMinted: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "partId1",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "partId2",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "partId3",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "partId4",
          type: "uint256",
        },
      ],
      name: "OracleMinted",
      type: "event",
    },
  ],
  OracleMinted: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "partId1",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "partId2",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "partId3",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "partId4",
          type: "uint256",
        },
      ],
      name: "OracleMinted",
      type: "event",
    },
  ],
};

const eventsByContract = {
  SyndicateCorePool: {
    chainId: 1,
    startBlock: 14173085,
    events: [
      {
        name: "Staked",
        filter: "Staked(address,address,uint256)",
        ABI: ABI.Staked,
      },
      {
        name: "Unstaked",
        filter: "Unstaked(address,address,uint256)",
        ABI: ABI.Unstaked,
      },
      {
        name: "YieldClaimed",
        filter: "YieldClaimed(address,address,bool,uint256)",
        ABI: ABI.YieldClaimed,
      },
    ],
  },
  SynCityPasses: {
    chainId: 1,
    startBlock: 13722860,
    events: [
      {
        name: "Transfer",
        filter: "Transfer(address,address,uint256)",
        ABI: ABI.Transfer,
      },
    ],
  },
  SynCityCoupons: {
    chainId: 56,
    startBlock: 13069259,
    events: [
      {
        name: "Transfer",
        filter: "Transfer(address,address,uint256)",
        ABI: ABI.Transfer,
      },
    ],
  },
  Turf: {
    chainId: 56,
    startBlock: 23911132,
    events: [
      {
        name: "Transfer",
        filter: "Transfer(address,address,uint256)",
        ABI: ABI.Transfer,
      },
      {
        name: "Locked",
        filter: "Locked(uint256)",
        ABI: ABI.Locked,
      },
      {
        name: "Unlocked",
        filter: "Unlocked(uint256)",
        ABI: ABI.Unlocked,
      },
      {
        name: "Locked",
        filter: "Locked(uint256,bool)",
        ABI: ABI.Locked2,
      },
    ],
  },
  Farm: {
    chainId: 56,
    startBlock: 23911196,
    events: [
      {
        name: "Transfer",
        filter: "Transfer(address,address,uint256)",
        ABI: ABI.Transfer,
      },
      {
        name: "Locked",
        filter: "Locked(uint256)",
        ABI: ABI.Locked,
      },
      {
        name: "Unlocked",
        filter: "Unlocked(uint256)",
        ABI: ABI.Unlocked,
      },
      {
        name: "Locked",
        filter: "Locked(uint256,bool)",
        ABI: ABI.Locked2,
      },
    ],
  },
  BruceLeeCyberBot1: {
    chainId: 1,
    startBlock: 17789070,
    events: [
      {
        name: "Transfer",
        filter: "Transfer(address,address,uint256)",
        ABI: ABI.Transfer,
      },
    ],
  },
  BruceLeeCyberBot56: {
    chainId: 56,
    startBlock: 30164103,
    events: [
      {
        name: "Transfer",
        filter: "Transfer(address,address,uint256)",
        ABI: ABI.Transfer,
      },
    ],
  },
  BruceLeeCyberBot137: {
    chainId: 137,
    startBlock: 45567579,
    events: [
      {
        name: "Transfer",
        filter: "Transfer(address,address,uint256)",
        ABI: ABI.Transfer,
      },
    ],
  },
  BCGenesisToken: {
    chainId: 44787,
    startBlock: 19214000,
    events: [
      {
        name: "Transfer",
        filter: "Transfer(address,address,uint256)",
        ABI: ABI.Transfer,
      },
    ],
  },
  BCOracleToken: {
    chainId: 44787,
    startBlock: 19214000,
    events: [
      {
        name: "Transfer",
        filter: "Transfer(address,address,uint256)",
        ABI: ABI.Transfer,
      },
    ],
  },
  BCGenesisToken1: {
    chainId: 1,
    startBlock: 17957723,
    events: [
      {
        name: "Transfer",
        filter: "Transfer(address,address,uint256)",
        ABI: ABI.Transfer,
      },
    ],
  },
  BCOracleToken1: {
    chainId: 1,
    startBlock: 17957723,
    events: [
      {
        name: "Transfer",
        filter: "Transfer(address,address,uint256)",
        ABI: ABI.Transfer,
      },
    ],
  },
  BCFactory1: {
    chainId: 1,
    startBlock: 17957723,
    events: [
      {
        name: "OracleMinted",
        filter: "OracleMinted(uint256,uint256,uint256,uint256,uint256)",
        ABI: ABI.OracleMinted,
      },
    ],
  },
  LFGFactoryProd: {
    chainId: 137,
    startBlock: 0,
    events: [
      {
        name: "MintRequested",
        filter: "MintRequested(uint256,uint256,address,uint256)",
        ABI: ABI.MintRequested,
      },
      {
        name: "CancelRequest",
        filter: "CancelRequest(uint256,uint256,address,uint256)",
        ABI: ABI.CancelRequest,
      },
      {
        name: "MintAndStakeRequested",
        filter:
          "MintAndStakeRequested(uint256,uint256,address,uint256,uint256)",
        ABI: ABI.MintAndStakeRequested,
      },
      {
        name: "CancelStakeRequest",
        filter: "CancelStakeRequest(uint256,uint256,address,uint256,uint256)",
        ABI: ABI.CancelStakeRequest,
      },
    ],
  },
  PFPAssetMumbai: {
    chainId: 80001,
    startBlock: 0,
    events: [
      {
        name: "Transfer",
        filter: "Transfer(address,address,uint256)",
        ABI: ABI.Transfer,
      },
    ],
  },
  // Fragments44787: {
  //   chainId: 44787,
  //   startBlock: 0,
  //   events: [
  //     {
  //       name: "Transfer",
  //       filter: "Transfer(address,address,uint256)",
  //       ABI: ABI.Transfer,
  //     },
  //   ],
  // },
  // TreasureMaps44787: {
  //   chainId: 44787,
  //   startBlock: 0,
  //   events: [
  //     {
  //       name: "Transfer",
  //       filter: "Transfer(address,address,uint256)",
  //       ABI: ABI.Transfer,
  //     },
  //   ],
  // },
  // Season244787: {
  //   chainId: 44787,
  //   startBlock: 0,
  //   events: [
  //     {
  //       name: "Transfer",
  //       filter: "Transfer(address,address,uint256)",
  //       ABI: ABI.Transfer,
  //     },
  //   ],
  // },
  // TreasureHunter44787: {
  //   chainId: 44787,
  //   startBlock: 0,
  //   events: [
  //     {
  //       name: "Transfer",
  //       filter: "Transfer(address,address,uint256)",
  //       ABI: ABI.Transfer,
  //     },
  //     {
  //       name: "Locked",
  //       filter: "Locked(uint256,bool)",
  //       ABI: ABI.Locked2,
  //     },
  //   ],
  // },
  // USDC: {
  //   chainId: 1,
  //   startBlock: 17140584,
  //   events: [
  //     {
  //       name: "Transfer",
  //       filter: "Transfer(address,address,uint256)",
  //       ABI: ABI.TransferERC20,
  //     },
  //   ],
  // },
};

module.exports = eventsByContract;

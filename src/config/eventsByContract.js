const ABI = {
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
};

module.exports = eventsByContract;

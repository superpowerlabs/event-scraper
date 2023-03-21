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
};

const data = [
  {
    contractName: "SynCityPasses",
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
  {
    contractName: "SynCityCoupons",
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
  {
    contractName: "Turf",
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
    ],
  },
  {
    contractName: "Farm",
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
    ],
  },
];

module.exports = data;

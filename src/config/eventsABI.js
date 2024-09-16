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

const filters = {
  Transfer: "Transfer(address,address,uint256)",
  CancelStakeRequest: "CancelStakeRequest(uint256,uint256,address,uint256,uint256)",
  MintAndStakeRequested: "MintAndStakeRequested(uint256,uint256,address,uint256,uint256)",
  CancelRequest: "CancelRequest(uint256,uint256,address,uint256)",
  MintRequested: "MintRequested(uint256,uint256,address,uint256)",
  OracleMinted: "OracleMinted(uint256,uint256,uint256,uint256,uint256)",
  Locked: "Locked(uint256,bool)",
  Unlocked: "Unlocked(uint256)",
  Locked: "Locked(uint256)",
  YieldClaimed: "YieldClaimed(address,address,bool,uint256)",
  Unstaked: "Unstaked(address,address,uint256)",
  Staked: "Staked(address,address,uint256)",
};

module.exports = { ABI, filters };

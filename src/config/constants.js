const DAY = 24 * 3600;
const WEEK = 7 * DAY;
const YEAR = 365 * DAY;

module.exports = {
  DAY,
  WEEK,
  YEAR,
  TRANSFER_INITIATED: 1,
  TRANSFER_STARTED: 2,
  TRANSFER_MINED: 3,
  SEQUENCE_GOT: 4,
  VAA_BYTES_GOT: 5,
  COMPLETE_TRANSFER_STARTED: 6,
  COMPLETE_TRANSFER_MINED: 7,
  LOST_TRANSACTION: 8,
  SKIP: 9,
  REC_TX_FAILED: 10,
  WORMHOLE_RPC_HOSTS: ["https://wormhole-v2-mainnet-api.certus.one"],
  WORMHOLE_TESTNET_RPC_HOSTS: ["https://wormhole-v2-testnet-api.certus.one"],
  WORMHOLE_BRIDGE_TYPE: 1,
};

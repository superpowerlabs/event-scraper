const { toChecksumAddress } = require("ethereumjs-util");

const Address = {
  equal(addr1, addr2) {
    try {
      return toChecksumAddress(addr1) === toChecksumAddress(addr2);
    } catch (e) {
      return false;
    }
  },
};

module.exports = Address;

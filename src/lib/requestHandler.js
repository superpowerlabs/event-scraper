const { sleep } = require("../utils");

const requestPerSeconds = {};
const requestHandler = async (apiRequest) => {
  // Infura allows at most 10 requests per second
  let sec = Math.floor(Date.now() / 1000).toString();
  if (requestPerSeconds[sec] === 10) {
    console.log(`
    
    WAITING 1 SECOND . . .
    
    `);
    await sleep(1000);
    sec = Math.floor(Date.now() / 1000).toString();
  }
  if (!requestPerSeconds[sec]) {
    requestPerSeconds[sec] = 0;
  }
  requestPerSeconds[sec]++;
  return apiRequest;
};

module.exports = requestHandler;

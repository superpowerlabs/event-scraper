require("dotenv").config();
module.exports = {
  apps: [
    {
      script: "index.js",
      name: "indexing-service",
    },
  ],

  // Note: the indexer script runs on the staging server but
  //       writes to the production database!
  deploy: {
    production: {
      user: "ubuntu",
      host: process.env.EC2_HOST,
      key: process.env.SSH_KEY,
      ref: "origin/main",
      repo: "git@github.com:superpowerlabs/event-scraper",
      path: "/home/ubuntu/production/indexing-service",
      "post-setup": ". ~/.nvm/nvm.sh && pnpm install",
      "post-deploy":
        ". ~/.nvm/nvm.sh && pnpm install && pnpm pm2 startOrRestart ecosystem.config.js --env production",
    },
  },
};

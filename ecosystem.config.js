module.exports = {
  apps : [{
    script: 'indexingService.js',
    name: 'indexing-service',
  }],
   
  // Note: the indexer script runs on the staging server but 
  //       writes to the production database!
  deploy : {
    production : {
       "user" : "ubuntu",
       "host" : "ec2-18-221-245-11.us-east-2.compute.amazonaws.com",
       "key"  : "~/.ssh/superpower.pem",
       "ref"  : "origin/main",
       "repo" : "git@github.com:superpowerlabs/event-scraper",
       "path" : "/home/ubuntu/production/indexing-service",
       "post-setup": "/home/ubuntu/.nvm/versions/node/v16.17.0/bin/pnpm i",
       "post-deploy" : "pnpm install && pm2 startOrRestart --env production"
    }
  }
};
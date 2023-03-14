module.exports = {
  apps : [{
    script: 'indexingService.js',
    name: 'indexing-service',
  }],
   
  // Note: we're running a production script on the staging server!
  deploy : {
    production : {
       "user" : "ubuntu",
       "host" : "ec2-18-221-245-11.us-east-2.compute.amazonaws.com",
       "key"  : "~/.ssh/superpower.pem",
      //  "ref"  : "origin/main",
       "ref"  : "origin/run-indexer-with-node-cron",
       "repo" : "git@github.com:superpowerlabs/event-scraper",
       "path" : "/home/ubuntu/production/indexing-service",
       "post-deploy" : "pnpm install && pm2 startOrRestart --env production"
    }
  }
};
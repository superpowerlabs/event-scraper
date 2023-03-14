# Superpower indexer

## PM2 Deploy feature

We're using the deploy scirpt that comes with PM2 (see https://pm2.keymetrics.io/docs/usage/deployment/).
```
> pm2 deploy <configuration_file> <environment> <command>
```
## Deployment setup

This command needs to be issued only once per server.
```
pmpm pm2 deploy pm2.config.js production setup
```
or, since the config file is using the default name `ecosystem.config.js`, we don't need to add it. 
```
pmpm pm2 deploy production setup
```
You should see something like this:
```
➜  event-scraper git:(run-indexer-with-node-cron) ✗ pnpm pm2 deploy production setup
--> Deploying to production environment
--> on host ec2-18-221-245-11.us-east-2.compute.amazonaws.com

>>>> In-memory PM2 is out-of-date, do:
>>>> $ pm2 update
In memory PM2 version: 5.2.0
Local PM2 version: 5.2.2

  ○ hook pre-setup
  ○ running setup
  ○ cloning git@github.com:superpowerlabs/event-scraper
  ○ full fetch
Cloning into '/home/ubuntu/production/indexing-service/source'...
  ○ hook post-setup
  ○ setup complete
--> Success
```

Check that the deployment folder is setup properly on staging (since we're deploying to staging)

```
ubuntu@ip-172-31-42-225:~$ ls -al /home/ubuntu/production/indexing-service/
total 16
drwxrwxr-x 4 ubuntu ubuntu 4096 Mar 14 13:23 .
drwxrwxr-x 3 ubuntu ubuntu 4096 Mar 14 13:23 ..
lrwxrwxrwx 1 ubuntu ubuntu   47 Mar 14 13:23 current -> /home/ubuntu/production/indexing-service/source
drwxrwxr-x 4 ubuntu ubuntu 4096 Mar 14 13:23 shared
drwxrwxr-x 7 ubuntu ubuntu 4096 Mar 14 13:23 source

```

## Deployment

To deploy a new release or rollback, just use the commands bellow:
```
pnpm pm2 deploy production deploy
pnpm pm2 deploy production revert 1
```

here's an example:
```
➜  event-scraper git:(pm2-deploy-fix-2) pnpm pm2 deploy production deploy
--> Deploying to production environment
--> on host ec2-18-221-245-11.us-east-2.compute.amazonaws.com

>>>> In-memory PM2 is out-of-date, do:
>>>> $ pm2 update
In memory PM2 version: 5.2.0
Local PM2 version: 5.2.2

fatal: no upstream configured for branch 'pm2-deploy-fix-2'

  ○ deploying origin/main
  ○ executing pre-deploy-local
  ○ hook pre-deploy
  ○ fetching updates
  ○ full fetch
Fetching origin
From github.com:superpowerlabs/event-scraper
   b9fd993..602b9e2  main             -> origin/main
 * [new branch]      pm2-deploy-fix-2 -> origin/pm2-deploy-fix-2
  ○ resetting HEAD to origin/main
HEAD is now at 602b9e2 Merge pull request #6 from superpowerlabs/pm2-deploy-fix-2
  ○ executing post-deploy `. ~/.nvm/nvm.sh && pnpm install && pnpm pm2 startOrRestart ecosystem.config.js --env production`
Lockfile is up to date, resolution step is skipped
Already up to date


> mob-api@0.1.1 prepare /home/ubuntu/production/indexing-service/source
> husky install

husky - Git hooks installed

>>>> In-memory PM2 is out-of-date, do:
>>>> $ pm2 update
In memory PM2 version: 5.2.0
Local PM2 version: 5.2.2

[PM2][WARN] Environment [production] is not defined in process file
[PM2] Applying action restartProcessId on app [indexing-service](ids: [ 25 ])
[PM2] [indexing-service](25) ✓
┌─────┬─────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id  │ name                │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├─────┼─────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 1   │ ape                 │ default     │ 5.2.0   │ fork    │ 700      │ 8D     │ 0    │ online    │ 0%       │ 51.5mb   │ ubuntu   │ disabled │
│ 15  │ byte-city-test      │ default     │ 1.0.0   │ cluster │ 35416    │ 3D     │ 0    │ online    │ 0%       │ 66.6mb   │ ubuntu   │ disabled │
│ 16  │ byte-city-test      │ default     │ 1.0.0   │ cluster │ 35423    │ 3D     │ 0    │ online    │ 0%       │ 61.5mb   │ ubuntu   │ disabled │
│ 25  │ indexing-service    │ default     │ 0.1.1   │ fork    │ 71510    │ 0s     │ 1    │ online    │ 0%       │ 19.9mb   │ ubuntu   │ disabled │
│ 0   │ sample              │ default     │ 5.2.0   │ fork    │ 698      │ 8D     │ 0    │ online    │ 0%       │ 58.1mb   │ ubuntu   │ disabled │
│ 24  │ synr-volume         │ default     │ 0.1.1   │ fork    │ 64636    │ 5h     │ 0    │ online    │ 0%       │ 66.3mb   │ ubuntu   │ disabled │
│ 3   │ website             │ default     │ 0.0.1   │ cluster │ 705      │ 8D     │ 0    │ online    │ 0%       │ 59.7mb   │ ubuntu   │ disabled │
│ 4   │ website             │ default     │ 0.0.1   │ cluster │ 717      │ 8D     │ 0    │ online    │ 0%       │ 59.7mb   │ ubuntu   │ disabled │
│ 20  │ your-assets         │ default     │ 0.1.0   │ cluster │ 51068    │ 41h    │ 7    │ online    │ 0%       │ 65.6mb   │ ubuntu   │ disabled │
│ 21  │ your-assets         │ default     │ 0.1.0   │ cluster │ 51084    │ 41h    │ 7    │ online    │ 0%       │ 64.9mb   │ ubuntu   │ disabled │
└─────┴─────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
[PM2][WARN] Current process list is not synchronized with saved list. App event-scraper differs. Type 'pm2 save' to synchronize.
  ○ successfully deployed origin/main
--> Success
```

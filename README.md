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


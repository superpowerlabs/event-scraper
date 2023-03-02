# Mobland API Server

Staking frontend for Mobland

Clone the repo and call

```
git submodule update --init --recursive
```

## Install and usage

```
(cd synr-seed && pnpm i)
pnpm i
```

Have Docker Opened.
Have .env set up

```
bin/postgres.sh
```

Create Docker Container and sets up database.

In the project directory, you can run:

```
npm start
```

Runs the app in the development mode.\
Open [http://localhost:3003](http://localhost:3003) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

To test the app, you must deploy the contract for testing

```
npm run deploy
npm test
```

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `node .`

Sets up DB with migrations, starts Server

## Snapshot scripts

To run the scripts in development, launch:

```
node scripts/snapshotService.js
```

To see all the console logs, launch

```
node scripts/snapshotService.js -v
```

To launch it in production, launch

```
./start-snapshotService.sh
```

To see latest snapshot connect to
https://api.mob.land/v1/snapshots/latest

To see at a specific data connect to
https://api.mob.land/v1/snapshots/2022-11-12

# Database

## Files

- `./db/config.js` : database configuration file for test, development and production environment
- `./db/Sql.js`: reads configuration and starts a DB client
- `./db/migrations/migrate.js`: called in `./index.js` to migrate DB is necessary
  - `./db/Migration.js` extends Sql, parent class to `./db/migrations/XX_YYYYYYYYY.js` individual migrations

## Commands

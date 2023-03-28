const knex = require("knex");
const Spinner = require("cli-spinner").Spinner;
const _ = require("lodash");
const path = require("path");
const fs = require("fs-extra");
const dbConfig = require("./dbConfig");

async function sleep(millis) {
  // eslint-disable-next-line no-undef
  return new Promise((resolve) => setTimeout(resolve, millis));
}

class Sql {
  constructor() {
    if (process.env.NODE_ENV === "test") {
      fs.ensureDirSync(path.dirname(dbConfig.connection.filename));
    }
  }

  async client(useReplica = false, database = "", client0 = "", user = "", port = 0) {
    let clientKey = "client_" + (database || "default");
    if (useReplica) {
      clientKey = "replicaClient_" + (database || "default");
    }
    if (!this[clientKey]) {
      const spinner = new Spinner("Waiting for Postgres %s ");
      spinner.setSpinnerString("|/-\\");
      let started = false;
      const config = JSON.parse(JSON.stringify(dbConfig));
      if (database) {
        config.connection.database = database;
      }
      if (port > 0) {
        config.connection.port = port;
      }
      if (user) {
        config.connection.user = user;
      }
      if (useReplica) {
        config.connection.host = config.connection.hostReplica;
      }
      if (client0) {
        config.client = client0;
      }
      for (;;) {
        try {
          this[clientKey] = knex(config);
          await this[clientKey].raw("select 1+1 as result");
          spinner.stop();
          break;
        } catch (err) {
          if (/database ".*" does not exist/.test(err)) {
            await sleep(1000);
            const { connection } = config;
            let tmpClient = knex({
              client: config.client,
              connection: {
                host: connection.host,
                user: connection.user,
                password: connection.password,
                port: connection.port,
              },
            });
            try {
              await tmpClient.raw("create database " + connection.database);
            } catch (e) {
              // most likely trying to re-create an already created database
            }
            spinner.stop();
            break;
          } else {
            // console.error(err);
          }
        }
        await sleep(1000);
        if (!started) {
          spinner.start();
          started = true;
        }
      }
    }
    return this[clientKey];
  }
}

module.exports = Sql;

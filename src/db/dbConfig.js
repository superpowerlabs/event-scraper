const path = require("path");

const dbConfig = {
  test: {
    client: "sqlite3",
    connection: {
      filename: path.resolve(__dirname, "../../tmp/test/db.sqlite"),
    },
    useNullAsDefault: true,
  },
  development: {
    client: "mysql",
    connection: {
      host: process.env.MYSQL_HOST || "localhost",
      hostReplica: process.env.MYSQL_HOST || "localhost",
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE || "mysql",
    },
  },
  production: {
    client: "mysql",
    connection: {
      host: process.env.RDS_WRITER_ENDPOINT,
      hostReplica: process.env.RDS_READER_ENDPOINT || process.env.RDS_WRITER_ENDPOINT,
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    },
  },
};

function environment() {
  if (process.env.NODE_ENV === "test") {
    return "test";
  } else if (process.platform === "darwin") {
    return "development";
  } else {
    return "production";
  }
}

module.exports = dbConfig[environment()];

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
    client: "pg",
    connection: {
      host: process.env.POSTGRES_HOST || "localhost",
      hostReplica: process.env.POSTGRES_HOST || "localhost",
      port: process.env.POSTGRES_PORT || 5432,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE || "default",
    },
  },
  production: {
    client: "pg",
    connection: {
      host: process.env.RDS_WRITER_ENDPOINT,
      hostReplica:
        process.env.RDS_READER_ENDPOINT || process.env.RDS_WRITER_ENDPOINT,
      port: process.env.POSTGRES_PORT || 5432,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
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

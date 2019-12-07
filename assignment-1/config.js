// Environment configurations

const environments = {
  stage: {
    port: 3000,
    name: "stage",
  },
  prod: {
    port: 3000,
    name: "prod",
  }
};

const { NODE_ENV } = process.env;
const currEnv = typeof( NODE_ENV ) === "string" ? NODE_ENV.toLowerCase() : "";

const envToExport = typeof( environments[currEnv] ) === "object"
                      ? environments[currEnv]
                      : environments.stage;

module.exports = envToExport;
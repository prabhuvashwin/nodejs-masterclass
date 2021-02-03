/*
 * Create and export configuration variables
 */

// Container for all the environments
const environments = {};

// Staging (default) environment
environments.stage = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "stage",
  hashingSecret: "thisIsAStageSecret",
};

// Production environment
environments.prod = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "prod",
  hashingSecret: "thisIsAProdSecret",
};

// Determine which was passed as a command-line argument
const { NODE_ENV } = process.env;
const currentEnv = typeof( NODE_ENV ) === "string" ? NODE_ENV.toLowerCase() : "";

// Check that the current environment is one of the environments defined above.
// If not, default to stage environment
const envToExport = typeof( environments[currentEnv] ) === 'object'
                      ? environments[currentEnv]
                      : environments.stage;

module.exports = envToExport;
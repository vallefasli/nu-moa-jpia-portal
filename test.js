const { execSync } = require('child_process');

console.log("Postgres is not available locally, but in Node JS: ", Math.floor(Math.random() * 1000000).toString());

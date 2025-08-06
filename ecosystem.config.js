module.exports = {
  apps : [{
    name   : "job-app",
    script : "pnpm",
    args   : "start",
    env_production: {
       NODE_ENV: "production"
    }
  }]
}

module.exports = {
    apps: [
        {
            name: "ms",
            script: "./index.js",
            cron_restart: "*/10 * * * *",
            autorestart: true,
            watch: false,
            instances: 1,
            exec_mode: "fork",
            max_memory_restart: "1G",
        },
    ],
  };
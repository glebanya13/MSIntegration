module.exports = {
  apps: [
    {
      name: 'telegram-bot',
      script: 'index.js',
      interpreter: 'node',
      watch: true,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};

module.exports = {
  apps: [
    {
      name: 'fuxem',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/fuxem',
      env: {
        NODE_ENV: 'production',
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
}

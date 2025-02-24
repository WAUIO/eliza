module.exports = {
  apps: [
    {
      name: 'eliza-agent',
      cwd: '/var/www/eliza/agent',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        SERVER_PORT: 3000
      }
    },
    {
      name: 'eliza-client',
      cwd: '/var/www/eliza/client',
      script: 'pnpm',
      args: 'dev --host',
      env: {
        NODE_ENV: 'production',
        VITE_AGENT_URL: 'http://localhost:3000'
      }
    }
  ]
};

module.exports = {
  apps: [
    {
      name: 'api',
      script: './dist/main.js',
      ignore: ['./node_modules'],
      merge_logs: true,
      max_restarts: 20,
      instances: 2,
      max_memory_restart: '200M',
      env_production: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
  ],
};

module.exports = {
  apps: [
    {
      name: 'apex-campaign-be',
      script: 'node dist/src/main.js',
    },
    {
      name: 'apex-campaign-crawler',
      script: 'node dist/src/crawler.js',
    },
    {
      name: 'apex-campaign-consumer',
      script: 'node dist/src/consumer.js',
    },
    {
      name: 'apex-campaign-job:send-mail',
      script: 'node dist/src/cmd.js job:send-mail',
    },
    {
      name: 'apex-campaign-scheduler',
      script: 'node dist/src/scheduler.js',
    },
  ],
};

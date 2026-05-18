module.exports = {
  I18N_HASH: 'generated_hash',
  SERVER_API_URL: '',
  DEV_SERVER_API_URL: 'http://localhost:5504/',
  DEV_WEBSOCKET_ENABLED: false,
  TEST_SERVER_API_URL: 'https://admin.jojoaddison.net/',
  TEST_WEBSOCKET_ENABLED: true,
  PROD_SERVER_API_URL: 'https://admin.abofonsa.com/',
  PROD_WEBSOCKET_ENABLED: true,
  __VERSION__: process.env.hasOwnProperty('APP_VERSION') ? process.env.APP_VERSION : 'DEV',
  __DEBUG_INFO_ENABLED__: true,
};

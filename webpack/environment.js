module.exports = {
  I18N_HASH: 'generated_hash',
  SERVER_API_URL: '',
  DEV_SERVER_API_URL: 'http://localhost:5504/',
  TEST_SERVER_API_URL: 'https://admin.jojoaddison.net/',
  PROD_SERVER_API_URL: 'https://admin.abofonsa.com/',
  __VERSION__: process.env.hasOwnProperty('APP_VERSION') ? process.env.APP_VERSION : 'DEV',
  __DEBUG_INFO_ENABLED__: true,
};

function setupProxy({ tls }) {
  const serverResources = ['/api', '/services', '/management', '/v3/api-docs', '/h2-console', '/auth', '/health'];
  const conf = [
    {
      context: serverResources,
      // Point to the mock server
      target: `http://localhost:5508`,
      secure: false,
      changeOrigin: false,
    },
  ];
  return conf;
}

module.exports = setupProxy;

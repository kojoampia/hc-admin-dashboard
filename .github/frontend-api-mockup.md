# Frontend API Mockup Setup

This guide provides step-by-step instructions for setting up a mock API server for frontend development. This is necessary when the backend is unavailable, allowing the UI to be developed with simulated data.

## 1. Install `json-server`

This tool will create a fake REST API from a JSON file. Install it as a development dependency:

```bash
npm install --save-dev json-server
```

## 2. Create Mock Database File

Create a file named `db.json` in the root of the project. This file will serve as your mock database.

Here is an example with `profiles` and `teams` data:

```json
{
  "profiles": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    {
      "id": 2,
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com"
    }
  ],
  "teams": [
    {
      "id": 1,
      "name": "Cardiology"
    }
  ]
}
```

## 3. Configure API Proxy

To avoid CORS issues and redirect API calls, modify the webpack development server proxy configuration.

Open `webpack/proxy.conf.js` and change the `target` to point to the mock server's default address (`http://localhost:2000`).

```javascript
function setupProxy({ tls }) {
  const serverResources = ['/api', '/services', '/management', '/v3/api-docs', '/h2-console', '/auth', '/health'];
  const conf = [
    {
      context: serverResources,
      // Point to the mock server
      target: `http://localhost:2000`,
      secure: false,
      changeOrigin: false,
    },
  ];
  return conf;
}

module.exports = setupProxy;
```

## 4. Add `npm` Script

To make it easy to start the mock server, add a script to the `scripts` section of your `package.json` file.

```json
"scripts": {
  // ... other scripts
  "mock:api": "json-server --watch db.json",
  // ... other scripts
}
```

## 5. Running for Development

To work on the frontend, you need to run two processes in separate terminals:

**Terminal 1: Start the Mock API Server**
```bash
npm run mock:api
```
This will start `json-server`, and you'll see it running on `http://localhost:2000`.

**Terminal 2: Start the Frontend Development Server**
```bash
npm start
```
This will start the Angular application (usually on `http://localhost:9098`). It is now configured to send its API requests to your mock server.

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const enhanceMiddleware = config.server.enhanceMiddleware;

// Environment files are not assets. Reject HTTP probes before Metro parses them.
config.server.enhanceMiddleware = (middleware, server) => {
  const handleRequest = enhanceMiddleware
    ? enhanceMiddleware(middleware, server)
    : middleware;

  return (req, res, next) => {
    let pathname;
    try {
      pathname = decodeURIComponent((req.url || '/').split('?')[0]);
    } catch {
      res.statusCode = 400;
      res.end('Bad Request');
      return;
    }

    if (/(^|\/)\.env(?:[./]|$)/i.test(pathname)) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }

    return handleRequest(req, res, next);
  };
};

module.exports = config;

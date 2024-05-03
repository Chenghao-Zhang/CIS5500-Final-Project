const NodeCache = require('node-cache');
const myCache = new NodeCache();

function setCache(key, data, ttl = 86400) {
    myCache.set(key, data, ttl);
}

function getCache(key) {
    return myCache.get(key);
}

module.exports = { setCache, getCache };
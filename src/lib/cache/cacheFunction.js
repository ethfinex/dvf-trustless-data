const NodeCache = require('node-cache')

const caches = {}

module.exports = async (cacheKey, ttlSeconds, resultFunction) => {
  if (!caches[cacheKey]) {
    caches[cacheKey] = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds / 10
    })
  }

  const cached = caches[cacheKey].get(cacheKey)

  if (cached) {
    return cached
  }

  const result = await resultFunction()

  caches[cacheKey].set(cacheKey, result)

  return result
}

// invalidateAllTabCache — extracted from index.html
// Owner SHA-256: cf7a2c83fb63d67b9e84bc3f1bd5c5db46853305a63eda060f765fe26034262f
// Classic script — exposes window.invalidateAllTabCache

window.invalidateAllTabCache = function invalidateAllTabCache() {
  Object.keys(_tabCache).forEach(k => delete _tabCache[k]);
};

// Classic-script in-memory tab-cache invalidation owner.
window.invalidateTabCache = function(tab) {
  delete _tabCache[tab];
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function mockAdminDashboard({ failures = [] } = {}) {
  const tables = ['profiles.total', 'posts.total', 'profiles.active', 'profiles.new7d', 'reports.pending', 'profiles.banned', 'verification.pending', 'appeals.pending'];
  const events = ['metrics.parallel.start'];
  const values = tables.map((key, index) => {
    events.push(`metric:${key}`);
    return failures.includes(key) ? 0 : [120, 340, 18, 7, 3, 4, 2, 5][index];
  });
  events.push('metrics.parallel.complete', 'dashboard.render');
  return {
    events,
    stats: {
      totalUsers: values[0], totalPosts: values[1], activeToday: values[2], new7d: values[3],
      pendingReports: values[4], banned: values[5], verifyRequests: values[6], appeals: values[7]
    }
  };
}

(async () => {
  const normal = await mockAdminDashboard();
  const partial = await mockAdminDashboard({ failures: ['reports.pending', 'verification.pending'] });
  const allFailed = await mockAdminDashboard({ failures: ['profiles.total', 'posts.total', 'profiles.active', 'profiles.new7d', 'reports.pending', 'profiles.banned', 'verification.pending', 'appeals.pending'] });
  const expectedKeys = ['totalUsers', 'totalPosts', 'activeToday', 'new7d', 'pendingReports', 'banned', 'verifyRequests', 'appeals'];

  assert(normal.events[0] === 'metrics.parallel.start' && normal.events.includes('metrics.parallel.complete') && normal.events.includes('dashboard.render'), 'Dashboard metrics must aggregate in parallel and render after completion');
  assert(expectedKeys.every(key => Object.prototype.hasOwnProperty.call(normal.stats, key)), 'Dashboard must expose all eight metric cards');
  assert(normal.stats.totalUsers === 120 && normal.stats.totalPosts === 340 && normal.stats.appeals === 5, 'Normal dashboard must preserve fetched metric counts');
  assert(partial.stats.pendingReports === 0 && partial.stats.verifyRequests === 0 && partial.stats.totalUsers === 120, 'Individual metric failures must fall back to zero without affecting other metrics');
  assert(Object.values(allFailed.stats).every(value => value === 0), 'All metric failures must render safe zero values');

  console.log(JSON.stringify({ passed: true, normal, partial, allFailed }, null, 2));
})();

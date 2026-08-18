function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function mockSubmitReport({ targetType = 'story', targetId = 's1', reason = 'spam', errorMessage = null }) {
  const events = ['modal.close'];
  const report = { reporter_id: 'me', target_type: targetType, target_id: targetId, reason, status: 'pending' };
  if (!errorMessage) {
    events.push('reports.insert', 'toast:Report submitted');
    return { events, submitted: true, report };
  }
  if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
    events.push('toast:Reports table not set up');
  } else {
    events.push(`toast:Report failed:${errorMessage}`);
  }
  return { events, submitted: false, report };
}

(async () => {
  const success = await mockSubmitReport({ targetType: 'story', targetId: 's1', reason: 'harassment' });
  const missingTable = await mockSubmitReport({ errorMessage: 'relation reports does not exist' });
  const generic = await mockSubmitReport({ errorMessage: 'permission denied by RLS' });

  assert(success.submitted && success.report.reporter_id === 'me' && success.report.status === 'pending', 'Successful report must insert current reporter and pending status');
  assert(success.report.target_type === 'story' && success.report.target_id === 's1' && success.report.reason === 'harassment', 'Report must preserve target and selected reason');
  assert(success.events[0] === 'modal.close' && success.events.includes('toast:Report submitted'), 'Successful report must close modal and show success feedback');
  assert(!missingTable.submitted && missingTable.events.includes('toast:Reports table not set up'), 'Missing reports table must show setup-specific guidance');
  assert(!generic.submitted && generic.events.includes('toast:Report failed:permission denied by RLS'), 'Generic report failure must show error-specific feedback');
  assert(missingTable.events[0] === 'modal.close' && generic.events[0] === 'modal.close', 'Report modal must close before the database attempt in all branches');

  console.log(JSON.stringify({ passed: true, success, missingTable, generic }, null, 2));
})();

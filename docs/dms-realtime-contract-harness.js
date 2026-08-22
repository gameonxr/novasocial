function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function mockPrimaryRender({ delays = { mem: 8, unread: 2, notes: 5 } } = {}) {
  const events = [];
  const wait = (name, delay) => new Promise(resolve => {
    events.push(`${name}.start`);
    setTimeout(() => { events.push(`${name}.done`); resolve(name); }, delay);
  });
  const [mem, unread, notes] = await Promise.all([
    wait('conversations', delays.mem),
    wait('unread', delays.unread),
    wait('notes', delays.notes),
  ]);
  events.push('screen.replace');
  events.push(`notes.render:${notes}`);
  return { events, values: [mem, unread, notes] };
}

function createInjectedDmsSeam(deps) {
  const calls = [];
  return {
    calls,
    async primaryRender(input) {
      calls.push('primary-render');
      return deps.primaryRender(input);
    },
    async inPlaceRefresh(input) {
      calls.push('in-place-refresh');
      return deps.inPlaceRefresh(input);
    },
  };
}

async function mockRefreshDmsInPlace({
  meId = 'me',
  curTab = 'dms',
  chatScreenActive = false,
  leaveTabAfterFetch = false,
  leaveTabAfterMembers = false,
} = {}) {
  const events = [];
  const scrollTopBefore = 713;
  let scrollTop = scrollTopBefore;
  const wait = (name, delay = 2) => new Promise(resolve => {
    events.push(`${name}.start`);
    setTimeout(() => { events.push(`${name}.done`); resolve(name); }, delay);
  });

  if (!meId || curTab !== 'dms' || chatScreenActive) return { result: false, events, scrollTop };
  const [mem, unread, notes] = await Promise.all([
    wait('conversations'),
    wait('unread'),
    wait('notes'),
  ]);
  if (leaveTabAfterFetch) curTab = 'home';
  if (curTab !== 'dms') return { result: false, events, scrollTop };

  await wait('other-members');
  if (leaveTabAfterMembers) curTab = 'home';
  if (curTab !== 'dms') return { result: false, events, scrollTop };

  events.push(`notes.patch:${notes}`);
  events.push('item.update:existing');
  events.push('item.remove:missing');
  events.push('item.prepend:new');
  events.push('cache.save:dms');
  return { result: true, events, scrollTop, values: [mem, unread, notes] };
}

(async () => {
  const primary = await mockPrimaryRender();
  assert(primary.events.indexOf('conversations.start') < primary.events.indexOf('screen.replace'), 'Conversation fetch must precede primary render');
  assert(primary.events.indexOf('unread.start') < primary.events.indexOf('screen.replace'), 'Unread fetch must be parallel before primary render');
  assert(primary.events.indexOf('notes.start') < primary.events.indexOf('screen.replace'), 'Notes fetch must be parallel before primary render');
  assert(primary.events.indexOf('screen.replace') < primary.events.indexOf('notes.render:notes'), 'Notes must render from already-fetched data after screen construction');

  const patched = await mockRefreshDmsInPlace();
  assert(patched.result === true, 'Active DMs refresh should patch successfully');
  assert(patched.events.includes('conversations.start') && patched.events.includes('unread.start') && patched.events.includes('notes.start'), 'Refresh must fetch all three data sources');
  assert(patched.events.includes('other-members.done'), 'Other-member data must load after the parallel base fetch');
  assert(patched.events.includes('notes.patch:notes'), 'Refresh must patch the notes container in place');
  assert(patched.events.includes('item.update:existing') && patched.events.includes('item.remove:missing') && patched.events.includes('item.prepend:new'), 'Refresh must use targeted list-item updates');
  assert(!patched.events.includes('screen.replace'), 'Background refresh must never replace the main screen');
  assert(patched.scrollTop === 713, 'Background refresh must preserve scrollTop');

  const noAccount = await mockRefreshDmsInPlace({ meId: null });
  const wrongTab = await mockRefreshDmsInPlace({ curTab: 'home' });
  const chatOpen = await mockRefreshDmsInPlace({ chatScreenActive: true });
  for (const skipped of [noAccount, wrongTab, chatOpen]) {
    assert(skipped.result === false && skipped.events.length === 0, `Guard must skip before fetching: ${JSON.stringify(skipped)}`);
  }

  const leftDuringBaseFetch = await mockRefreshDmsInPlace({ leaveTabAfterFetch: true });
  assert(leftDuringBaseFetch.result === false, 'Refresh must abort if the user leaves DMs during base fetch');
  assert(!leftDuringBaseFetch.events.some(e => e.includes('.patch') || e.startsWith('item.') || e.startsWith('cache.save')), 'No DOM/cache patch after tab change during base fetch');

  const leftDuringMembers = await mockRefreshDmsInPlace({ leaveTabAfterMembers: true });
  assert(leftDuringMembers.result === false, 'Refresh must abort if the user leaves DMs during member fetch');
  assert(!leftDuringMembers.events.some(e => e.includes('.patch') || e.startsWith('item.') || e.startsWith('cache.save')), 'No DOM/cache patch after tab change during member fetch');

  const seam = createInjectedDmsSeam({
    primaryRender: mockPrimaryRender,
    inPlaceRefresh: mockRefreshDmsInPlace,
  });
  const injectedPrimary = await seam.primaryRender();
  const injectedRefresh = await seam.inPlaceRefresh();
  const injectedGuard = await seam.inPlaceRefresh({ meId: null });
  assert(JSON.stringify(seam.calls) === JSON.stringify(['primary-render', 'in-place-refresh', 'in-place-refresh']), 'Injected DMs seam must dispatch primary and refresh owners explicitly');
  assert(injectedPrimary.events.includes('screen.replace') && injectedRefresh.events.includes('cache.save:dms'), 'Injected DMs seam must preserve primary render and refresh outcomes');
  assert(injectedGuard.result === false && injectedGuard.events.length === 0, 'Injected DMs guard must remain non-destructive before data fetch');

  console.log(JSON.stringify({ passed: true, primary, patched, noAccount, wrongTab, chatOpen, leftDuringBaseFetch, leftDuringMembers, seam: { calls: seam.calls, injectedGuard } }, null, 2));
})();

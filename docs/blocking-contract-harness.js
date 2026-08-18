function getBlockedBothWaysMock(iBlockedRows, blockedMeRows) {
  const set = new Set();
  (iBlockedRows || []).forEach(row => set.add(row.blocked_id));
  (blockedMeRows || []).forEach(row => set.add(row.blocker_id));
  return set;
}

function contentIsGated(blockedBothWays, targetId) {
  return blockedBothWays.has(targetId);
}

function buttonReflectsMyAction(myBlockedSet, targetId) {
  return myBlockedSet.has(targetId) ? 'Unblock' : 'Block';
}

async function mockedBlockMutation({ duplicate = false }) {
  let throwOnErrorCalled = false;
  const builder = {
    throwOnError: async () => {
      throwOnErrorCalled = true;
      if (duplicate) throw new Error('23505 duplicate block');
      return { error: null };
    },
  };
  try {
    await builder.throwOnError();
    return { throwOnErrorCalled, status: 'success' };
  } catch (error) {
    return { throwOnErrorCalled, status: 'error', message: error.message };
  }
}

(async () => {
  const union = getBlockedBothWaysMock(
    [{ blocked_id: 'mine-1' }, { blocked_id: 'shared-1' }],
    [{ blocker_id: 'theirs-1' }, { blocker_id: 'shared-1' }],
  );
  if (union.size !== 3 || !union.has('mine-1') || !union.has('theirs-1') || !union.has('shared-1')) {
    throw new Error(`Bidirectional union mismatch: ${JSON.stringify([...union])}`);
  }
  if (!contentIsGated(union, 'mine-1') || !contentIsGated(union, 'theirs-1') || contentIsGated(union, 'free-1')) {
    throw new Error('Content gating mismatch');
  }
  if (buttonReflectsMyAction(new Set(['mine-1']), 'mine-1') !== 'Unblock') {
    throw new Error('Button must reflect my own block only');
  }
  if (buttonReflectsMyAction(new Set(), 'theirs-1') !== 'Block') {
    throw new Error('Button must not infer an unblock action from a block by the other user');
  }
  const success = await mockedBlockMutation({ duplicate: false });
  if (success.status !== 'success' || !success.throwOnErrorCalled) throw new Error('Success mutation contract mismatch');
  const duplicate = await mockedBlockMutation({ duplicate: true });
  if (duplicate.status !== 'error' || !duplicate.throwOnErrorCalled || !duplicate.message.includes('23505')) {
    throw new Error('Duplicate mutation must propagate through throwOnError');
  }
  console.log(JSON.stringify({
    passed: true,
    bidirectionalSet: [...union],
    contentGating: { mine: true, theirs: true, free: false },
    buttonSemantics: { mine: 'Unblock', theirs: 'Block' },
    throwOnError: { success: success.status, duplicate: duplicate.status },
  }, null, 2));
})();

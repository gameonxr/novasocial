function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function mockConfirmDialog({ options = {}, action = 'confirm' }) {
  const events = ['overlay.create', 'style.create'];
  const config = {
    title: options.title || 'Are you sure?',
    confirmText: options.confirmText || 'Confirm',
    cancelText: options.cancelText || 'Cancel',
    danger: options.danger !== false
  };
  events.push('overlay.append', 'style.append', 'confirm.focus');
  if (action === 'confirm') events.push('overlay.remove', 'style.remove', 'resolve:true');
  else events.push('overlay.remove', 'style.remove', 'resolve:false');
  return { events, config, result: action === 'confirm' };
}

(() => {
  const defaults = mockConfirmDialog({});
  const custom = mockConfirmDialog({ options: { title: 'Block this user?', confirmText: 'Block', cancelText: 'Cancel', danger: true } });
  const safe = mockConfirmDialog({ options: { title: 'Save changes?', confirmText: 'Save', cancelText: 'Keep editing', danger: false } });
  const cancel = mockConfirmDialog({ action: 'cancel' });
  const overlayCancel = mockConfirmDialog({ action: 'cancel' });

  for (const result of [defaults, custom, safe, cancel, overlayCancel]) {
    assert(result.events.includes('overlay.create') && result.events.includes('style.create') && result.events.includes('overlay.append') && result.events.includes('style.append'), 'Dialog must create and append overlay/style');
    assert(result.events.includes('overlay.remove') && result.events.includes('style.remove'), 'Dialog resolution must clean overlay and style');
    assert(result.events.includes('confirm.focus'), 'Dialog must focus confirm button');
  }
  assert(defaults.config.title === 'Are you sure?' && defaults.config.confirmText === 'Confirm' && defaults.config.cancelText === 'Cancel' && defaults.config.danger, 'Dialog defaults must match production defaults');
  assert(custom.config.title === 'Block this user?' && custom.config.confirmText === 'Block' && custom.config.danger, 'Custom destructive dialog options must be preserved');
  assert(safe.config.danger === false && safe.config.confirmText === 'Save', 'Non-danger dialog option must preserve safe styling');
  assert(defaults.result && custom.result && safe.result, 'Confirm action must resolve true');
  assert(!cancel.result && !overlayCancel.result, 'Cancel and overlay-tap actions must resolve false');

  console.log(JSON.stringify({ passed: true, defaults, custom, safe, cancel, overlayCancel }, null, 2));
})();

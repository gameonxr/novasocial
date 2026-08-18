async function mockedEmergencyLockCheck({ flagValue, dbError = false }) {
  const events = [];
  let intervalCleared = false;
  let intervalStarted = false;
  const db = {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => {
            if (dbError) throw new Error('feature flag unavailable');
            return { data: { flag_value: flagValue }, error: null };
          },
        }),
      }),
    }),
  };
  const showEmergencyLockScreen = () => events.push('lock-overlay.show');
  const clearIntervalMock = () => { intervalCleared = true; events.push('timer.clear'); };
  const setIntervalMock = () => { intervalStarted = true; events.push('timer.start:60000'); };
  try {
    const { data: flag } = await db.from('feature_flags').select('flag_value').eq('flag_name', 'emergency_lock').single();
    if (flag?.flag_value === true || flag?.flag_value === 'true' || flag?.flag_value?.toString() === 'true') {
      showEmergencyLockScreen();
    }
  } catch (error) {
    events.push('db-error.silent');
  }
  clearIntervalMock();
  setIntervalMock();
  return { events, intervalCleared, intervalStarted };
}

(async () => {
  const trueBoolean = await mockedEmergencyLockCheck({ flagValue: true });
  const trueString = await mockedEmergencyLockCheck({ flagValue: 'true' });
  const trueNumericString = await mockedEmergencyLockCheck({ flagValue: new String('true') });
  const falseBoolean = await mockedEmergencyLockCheck({ flagValue: false });
  const falseString = await mockedEmergencyLockCheck({ flagValue: 'false' });
  const unavailable = await mockedEmergencyLockCheck({ dbError: true });
  for (const result of [trueBoolean, trueString, trueNumericString, falseBoolean, falseString, unavailable]) {
    if (!result.intervalCleared || !result.intervalStarted || !result.events.includes('timer.start:60000')) throw new Error(`Timer contract mismatch: ${JSON.stringify(result)}`);
  }
  for (const result of [trueBoolean, trueString, trueNumericString]) {
    if (!result.events.includes('lock-overlay.show')) throw new Error(`Truthy flag did not lock: ${JSON.stringify(result)}`);
  }
  for (const result of [falseBoolean, falseString]) {
    if (result.events.includes('lock-overlay.show')) throw new Error(`False flag unexpectedly locked: ${JSON.stringify(result)}`);
  }
  if (!unavailable.events.includes('db-error.silent') || unavailable.events.includes('lock-overlay.show')) throw new Error(`DB-error handling mismatch: ${JSON.stringify(unavailable)}`);
  console.log(JSON.stringify({ passed: true, trueBoolean, trueString, trueNumericString, falseBoolean, falseString, unavailable }, null, 2));
})();

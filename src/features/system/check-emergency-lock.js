// checkEmergencyLock — extracted from index.html
// Owner SHA-256: 76a5b3b68668d0399bf493f11eb4e63c986868292e26ee3a8aa786b8fa0738e6
// Classic script — exposes window.checkEmergencyLock

window.checkEmergencyLock = async function checkEmergencyLock(){
  try {
    const { data: flag } = await db.from('feature_flags')
      .select('flag_value')
      .eq('flag_name', 'emergency_lock')
      .single();
    if(flag?.flag_value === true || flag?.flag_value === 'true' || flag?.flag_value?.toString() === 'true'){
      showEmergencyLockScreen();
    }
  } catch(e) {
    // feature_flags table might not exist yet — fail silently
  }
  // Re-check every 60 seconds
  if(_emergencyLockTimer) clearInterval(_emergencyLockTimer);
  _emergencyLockTimer = setInterval(checkEmergencyLock, 60000);
};

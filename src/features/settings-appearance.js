// Extracted from index.html during Phase 68.
function showSettingsAppearance(){
  const m=modal('Appearance'); m.querySelector('#mbody').innerHTML=`<div style="padding:16px;display:flex;flex-direction:column;gap:8px">
    <div onclick="showThemePickerModal()" class="nova-setting-row">${ico('palette','#a855f7',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">Themes</div><div style="font-size:11px;color:#8A8A8A">7 premium themes</div></div>${ico('chevron_right','#555',16)}</div>
    <div onclick="showProfileCustomizer()" class="nova-setting-row">${ico('sparkles','#a855f7',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">Profile Themes</div><div style="font-size:11px;color:#8A8A8A">Gradient ring & verified plus</div></div>${ico('chevron_right','#555',16)}</div>
    <div onclick="showThemePickerModal()" class="nova-setting-row">${ico('palette','#a855f7',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">Gradient Packs</div><div style="font-size:11px;color:#8A8A8A">Premium gradient collections</div></div>${ico('chevron_right','#555',16)}</div>
    <div onclick="showProfileCustomizer()" class="nova-setting-row">${ico('star','#a855f7',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">Premium Customization</div><div style="font-size:11px;color:#8A8A8A">Exclusive creator themes</div></div>${ico('chevron_right','#555',16)}</div>
  </div>`;
}

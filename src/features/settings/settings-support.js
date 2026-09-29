// Extracted from index.html during Phase 67.
function showSettingsSupport(){
  const m=modal('Support'); m.querySelector('#mbody').innerHTML=`<div style="padding:16px;display:flex;flex-direction:column;gap:8px">
    <div onclick="closeModal();toggleNovaAI()" class="nova-setting-row">${ico('bot','#3db83d',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">Ask Nova AI</div><div style="font-size:11px;color:#8A8A8A">Get instant help</div></div>${ico('chevron_right','#555',16)}</div>
    <div onclick="showHelpCenter()" class="nova-setting-row">${ico('book','#3db83d',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">Help Center</div><div style="font-size:11px;color:#8A8A8A">FAQs & guides</div></div>${ico('chevron_right','#555',16)}</div>
    <div onclick="showReportProblem()" class="nova-setting-row">${ico('flag','#3db83d',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">Report Problem</div><div style="font-size:11px;color:#8A8A8A">Report a bug or issue</div></div>${ico('chevron_right','#555',16)}</div>
    <div onclick="toast('Terms of Service')" class="nova-setting-row">${ico('info','#3db83d',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">Terms of Service</div><div style="font-size:11px;color:#8A8A8A">Read our terms</div></div>${ico('chevron_right','#555',16)}</div>
    <div onclick="toast('Privacy Policy')" class="nova-setting-row">${ico('lock','#3db83d',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">Privacy Policy</div><div style="font-size:11px;color:#8A8A8A">How we handle your data</div></div>${ico('chevron_right','#555',16)}</div>
    <div onclick="showAbout()" class="nova-setting-row">${ico('info','#3db83d',18)}<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#fff">About NovaSocial</div><div style="font-size:11px;color:#8A8A8A">App info & version</div></div>${ico('chevron_right','#555',16)}</div>
  </div>`;
}

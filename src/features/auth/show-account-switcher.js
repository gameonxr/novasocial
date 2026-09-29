// Account switcher modal renderer.
async function showAccountSwitcher(){
  await syncCurrentAccountToSavedList(); // current account bhi list mein confirm karo
  const accounts = getSavedAccounts();
  const m = modal('Switch Account');
  const body = m.querySelector('#mbody');

  let html = '<div style="padding:8px 0">';
  accounts.forEach(acc => {
    const isCurrent = acc.userId === ME?.id;
    html += `<div style="display:flex;align-items:center;gap:14px;padding:14px 20px;border-bottom:1px solid #1a1a1a;${isCurrent?'background:rgba(225,48,108,0.06)':'cursor:pointer'}" ${isCurrent?'':`onclick="switchToAccount('${acc.userId}')"`}>
      ${av(acc.avatarUrl, acc.username, 44)}
      <div style="flex:1">
        <div style="font-weight:700;font-size:14px;color:#fff">${acc.username}</div>
        ${isCurrent?'<div style="color:#3db83d;font-size:11px;margin-top:2px">✓ Current</div>':''}
      </div>
      ${!isCurrent?`<div onclick="event.stopPropagation();removeAccountFromSwitcher('${acc.userId}')" style="padding:8px;cursor:pointer;color:#555">${ico('close','#555',16)}</div>`:''}
    </div>`;
  });
  html += `<div onclick="closeModal();addNewAccount()" style="display:flex;align-items:center;gap:14px;padding:16px 20px;cursor:pointer">
    <div style="width:44px;height:44px;border-radius:50%;border:2px dashed #444;display:flex;align-items:center;justify-content:center">${ico('plus','#aaa',20)}</div>
    <div style="font-weight:700;font-size:14px;color:#fff">Add Account</div>
  </div>`;
  html += '</div>';
  body.innerHTML = html;
}

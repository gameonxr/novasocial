// Local DM draft persistence helpers extracted from index.html.
// DM DRAFT SYSTEM — preserves typed text when navigating away (Instagram-style)
function saveDmDraft(cid, text){
  try {
    var drafts = JSON.parse(localStorage.getItem('nova-dm-drafts') || '{}');
    if(text && text.trim()){
      drafts[cid] = text;
    } else {
      delete drafts[cid];
    }
    localStorage.setItem('nova-dm-drafts', JSON.stringify(drafts));
  } catch(e) {}
}

function clearDmDraft(cid){
  try {
    var drafts = JSON.parse(localStorage.getItem('nova-dm-drafts') || '{}');
    delete drafts[cid];
    localStorage.setItem('nova-dm-drafts', JSON.stringify(drafts));
  } catch(e) {}
}

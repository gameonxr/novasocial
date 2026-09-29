// showAddToCallMenu — extracted from index.html
// Owner SHA-256: 0c3a1dc79bdd6ec27048cd5387c736419b883b2d1694110ef573920551055f98
// Classic script — exposes window.showAddToCallMenu

window.showAddToCallMenu = function showAddToCallMenu(){
  const m = modal('Add to Call');
  const body = m.querySelector('#mbody');
  body.innerHTML = `<div style="padding:24px;text-align:center;color:#aaa;font-size:14px;line-height:1.6">
    Abhi chalti hui 1-on-1 call mein directly member add nahi kar sakte.<br><br>
    Is call ko end karke, group chat se naya <b>Group Call</b> shuru karo — usme sab members ko ek saath call ho jayegi.
    <div style="margin-top:20px">
      <button onclick="closeModal()" class="bout" style="padding:12px 24px">Theek hai</button>
    </div>
  </div>`;
};

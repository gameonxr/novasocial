// FAB speed-dial menu rendering, positioning, and close helpers.
function toggleFabMenu(){
  const menu = document.getElementById('fab-menu');
  const icon = document.getElementById('fab-icon');
  const fab = document.getElementById('fab-main');
  if(!menu || !fab) return;

  if(menu.style.display === 'flex'){
    closeFabMenu();
  } else {
    // Inject items dynamically
    const items = [
      {label: 'Post', icon: 'img', color: '#FF2D7A', fn: "showCreate('post')"},
      {label: 'Reel', icon: 'film', color: '#00E5FF', fn: "showCreate('reel')"},
      {label: 'Story', icon: 'cam', color: '#FF2D7A', fn: "showCreate('story')"},
      {label: 'Live', icon: 'radio', color: '#FF2D7A', fn: 'showLiveStreamUI()'},
      {label: 'Drafts', icon: 'edit', color: '#00E5FF', fn: 'showScheduledPosts()'},
    ];

    const fabRect = fab.getBoundingClientRect();
    const isLeftSide = fabRect.left < window.innerWidth / 2;

    menu.innerHTML = items.map(it => {
      const iconHtml = ico(it.icon, it.color, 20);
      return `<div onclick="closeFabMenu();${it.fn}" style="display:flex;align-items:center;gap:10px;cursor:pointer;flex-direction:${isLeftSide ? 'row' : 'row-reverse'}">
        <span style="color:#fff;font-size:12px;font-weight:600;background:rgba(10,10,10,0.9);padding:6px 12px;border-radius:12px;backdrop-filter:blur(10px)">${it.label}</span>
        <div style="width:44px;height:44px;border-radius:50%;background:rgba(10,10,10,0.9);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center">${iconHtml}</div>
      </div>`;
    }).join('');

    // Position menu above FAB
    menu.style.left = (fabRect.left - (isLeftSide ? 0 : 100)) + 'px';
    menu.style.bottom = (window.innerHeight - fabRect.top + 12) + 'px';
    menu.style.right = 'auto';
    menu.style.top = 'auto';
    menu.style.display = 'flex';
    menu.style.animation = 'novaScaleIn 0.25s ease';
    icon.style.transform = 'rotate(45deg)';
    fab.style.background = 'rgba(10,10,10,0.9)';
    fab.style.backdropFilter = 'blur(16px)';
  }
}

function closeFabMenu(){
  const menu = document.getElementById('fab-menu');
  const icon = document.getElementById('fab-icon');
  const fab = document.getElementById('fab-main');
  if(menu) menu.style.display = 'none';
  if(icon) icon.style.transform = 'rotate(0deg)';
  if(fab && fabStyle === 0){ fab.style.background = 'linear-gradient(135deg,#FF2D7A,#833AB4)'; fab.style.backdropFilter = 'none'; }
}

// Theme picker, persistence, and saved-theme helpers.
function toggleThemePicker(){
  const p = document.getElementById('theme-panel');
  if(p) p.classList.toggle('show');
}

function setTheme(theme, el){
  // Remove all theme attrs first
  document.documentElement.removeAttribute('data-theme');
  document.body.removeAttribute('data-theme');

  if(theme && theme !== 'default'){
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }

  // Save preference
  try { localStorage.setItem('nova-theme', theme); } catch(e) {}

  // Highlight active
  document.querySelectorAll('.theme-opt').forEach(o=>{
    o.style.background = '';
    o.querySelector('.theme-opt-swatch').style.borderColor = '#333';
  });
  if(el){
    el.style.background = 'rgba(255,255,255,0.06)';
    el.querySelector('.theme-opt-swatch').style.borderColor = '#E1306C';
  }

  // Close picker
  setTimeout(()=>{document.getElementById('theme-panel')?.classList.remove('show');}, 300);

  toast('Theme: ' + (theme==='default'?'Default':theme.charAt(0).toUpperCase()+theme.slice(1)) + ' 🎨');
}

function loadSavedTheme(){
  try {
    const t = localStorage.getItem('nova-theme');
    if(t && t !== 'default'){
      document.documentElement.setAttribute('data-theme', t);
      document.body.setAttribute('data-theme', t);
    }
  } catch(e) {}
}

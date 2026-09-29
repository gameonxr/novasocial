window.spawnLikeParticles = function(el){
  if(!el) return;
  const rect = el.getBoundingClientRect();
  const colors = ['#E1306C','#833AB4','#F77737','#7afdff','#fc007c','#ffd700'];
  for(let i=0; i<12; i++){
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = (rect.left + rect.width/2 - 4) + 'px';
    p.style.top = (rect.top + rect.height/2 - 4) + 'px';
    p.style.background = colors[i % colors.length];
    const angle = (Math.PI * 2 * i) / 12;
    const dist = 40 + Math.random()*30;
    p.style.setProperty('--tx', Math.cos(angle)*dist + 'px');
    p.style.setProperty('--ty', Math.sin(angle)*dist + 'px');
    document.body.appendChild(p);
    setTimeout(()=>p.remove(), 800);
  }
}


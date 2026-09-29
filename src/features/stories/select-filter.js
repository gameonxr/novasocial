// Isolated media filter selection UI helper.
function selectFilter(chip,css){
  window._selectedFilter=css;
  const media=document.getElementById('mprev-media');
  if(media){media.style.filter=css==='none'?'':css;}
  // Highlight selected chip
  const tray=document.getElementById('filter-tray');
  if(tray){
    tray.querySelectorAll('[data-f]').forEach(el=>{el.style.borderColor='#222';});
    chip.querySelector('[data-f]').style.borderColor='#E1306C';
    chip.querySelector('div:last-child').style.color='#fff';
    // Reset others
    tray.querySelectorAll('div[style*="flex-shrink:0"]').forEach(c=>{
      if(c!==chip){const lbl=c.querySelector('div:last-child');if(lbl)lbl.style.color='#888';const box=c.querySelector('[data-f]');if(box)box.style.borderColor='#222';}
    });
  }
  toast('Filter applied 🎨');
}

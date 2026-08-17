// Story Location, Hashtag, Link, and shared Addon modal helpers.
function seAddLocation(){
  showSeAddon('Location', [
    {id:'location', label:'Location name', placeholder:'Mumbai, India'},
  ], (values) => {
    storyEditorElements.push({
      id: 'el_' + Date.now(),
      type: 'location',
      text: '📍 ' + values.location,
      x: 50, y: 35, scale: 1, rotate: 0,
      fontSize: 16,
      color: '#fff',
      fontWeight: 600,
      fontFamily: '-apple-system, sans-serif',
      bg: 'rgba(0,0,0,0.4)',
      padding: '8px 14px',
      borderRadius: '12px',
    });
    renderStoryElements();
  });
}

function seAddHashtag(){
  showSeAddon('Hashtag', [
    {id:'hashtag', label:'#hashtag', placeholder:'novasocial'},
  ], (values) => {
    storyEditorElements.push({
      id: 'el_' + Date.now(),
      type: 'hashtag',
      text: '#' + values.hashtag,
      x: 50, y: 45, scale: 1, rotate: 0,
      fontSize: 18,
      color: '#FF2D7A',
      fontWeight: 700,
      fontFamily: '-apple-system, sans-serif',
      bg: 'rgba(255,45,122,0.1)',
      padding: '6px 14px',
      borderRadius: '20px',
    });
    renderStoryElements();
  });
}

function seAddLink(){
  showSeAddon('Add Link', [
    {id:'url', label:'URL', placeholder:'https://...'},
  ], (values) => {
    storyEditorElements.push({
      id: 'el_' + Date.now(),
      type: 'link',
      text: values.url,
      url: values.url,
      x: 50, y: 55, scale: 1, rotate: 0,
      fontSize: 14,
      color: '#00E5FF',
      fontWeight: 600,
      fontFamily: '-apple-system, sans-serif',
      bg: 'rgba(0,229,255,0.08)',
      padding: '8px 14px',
      borderRadius: '12px',
    });
    renderStoryElements();
  });
}

function showSeAddon(title, fields, callback){
  const modal = document.getElementById('se-addon-input');
  document.getElementById('se-addon-title').textContent = title;

  let fieldsHtml = '';
  fields.forEach(f => {
    fieldsHtml += `<div style="margin-bottom:10px"><div style="font-size:12px;color:#8A8A8A;margin-bottom:5px;font-weight:600">${f.label}</div><input id="se-field-${f.id}" placeholder="${f.placeholder}" style="width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 14px;color:#fff;font-size:14px;outline:none"></div>`;
  });
  document.getElementById('se-addon-fields').innerHTML = fieldsHtml;

  document.getElementById('se-addon-confirm').onclick = () => {
    const values = {};
    fields.forEach(f => {
      values[f.id] = document.getElementById('se-field-' + f.id).value.trim();
    });
    callback(values);
    closeSeAddon();
  };

  modal.style.display = 'flex';
}

function closeSeAddon(){
  document.getElementById('se-addon-input').style.display = 'none';
}

// ── ELEMENT RENDERING & GESTURES ──

// Story editor text-element confirmation controller.
function seConfirmText(){
  const text = document.getElementById('se-text-input').value.trim();
  if(!text) return;

  const fonts = [
    '-apple-system, sans-serif',
    'sans-serif',
    'serif',
    'cursive',
    'monospace',
    'sans-serif',
  ];
  const weights = [400, 800, 400, 400, 400, 900];

  if(seEditingTextId){
    // Edit existing
    const el = storyEditorElements.find(e => e.id === seEditingTextId);
    if(el){
      el.text = text;
      el.font = seCurrentFont;
      el.color = seCurrentTextColor;
      el.gradient = seGradientText;
      renderStoryElements();
    }
  } else {
    // New text element
    storyEditorElements.push({
      id: 'el_' + Date.now(),
      type: 'text',
      text: text,
      x: 50, // percent
      y: 50,
      scale: 1,
      rotate: 0,
      font: seCurrentFont,
      color: seCurrentTextColor,
      gradient: seGradientText,
      fontFamily: fonts[seCurrentFont],
      fontWeight: weights[seCurrentFont],
    });
    renderStoryElements();
  }

  document.getElementById('se-text-input').value = '';
  seCloseTextPanel();
  seEditingTextId = null;
}

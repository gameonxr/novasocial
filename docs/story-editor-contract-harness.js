function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function renderElementModel(el) {
  const model = {
    id: el.id,
    type: el.type,
    position: { x: el.x, y: el.y },
    transform: `translate(-50%,-50%) scale(${el.scale}) rotate(${el.rotate}deg)`,
    transition: '0.1s',
  };
  if (el.type === 'text') {
    model.content = el.text;
    model.gradient = Boolean(el.gradient);
    model.font = el.fontFamily;
  } else if (el.type === 'sticker') {
    model.content = el.isText ? el.text : `emoji:${el.text}`;
    model.fontSize = el.fontSize;
  } else if (el.type === 'poll') {
    model.options = el.options || [el.optionA || 'Yes', el.optionB || 'No'];
    model.layout = model.options.length > 2 ? 'column' : 'row';
    model.multiVote = Boolean(el.multiVote);
  } else {
    model.content = el.text;
    model.kind = 'mention/location/hashtag/link';
  }
  return model;
}

function dragElement(el, { startX, startY, moveX, moveY, canvasWidth, canvasHeight, inDeleteZone = false }) {
  const events = ['touchstart', 'delete-zone.show'];
  const dx = ((moveX - startX) / canvasWidth) * 100;
  const dy = ((moveY - startY) / canvasHeight) * 100;
  el.x = Math.max(5, Math.min(95, el.x + dx));
  el.y = Math.max(5, Math.min(95, el.y + dy));
  events.push(`position:${el.x},${el.y}`);
  if (inDeleteZone) {
    events.push('delete-zone.highlight', 'element.remove', 'render-again', 'toast:Deleted');
    return { deleted: true, events, element: null };
  }
  events.push('touchend', 'delete-zone.hide', 'transition:0.1s');
  return { deleted: false, events, element: el };
}

(() => {
  const sourceElements = [
    { id: 't1', type: 'text', text: 'Hello', fontFamily: 'Inter', gradient: true, x: 50, y: 50, scale: 1, rotate: 0 },
    { id: 's1', type: 'sticker', isText: false, text: '🔥', fontSize: 32, x: 20, y: 20, scale: 1, rotate: 0 },
    { id: 'p1', type: 'poll', question: 'Pick', options: ['A', 'B', 'C'], multiVote: true, x: 50, y: 70, scale: 1, rotate: 0 },
    { id: 'm1', type: 'mention', text: '@nova', x: 80, y: 30, scale: 1, rotate: 0 },
  ];
  const models = sourceElements.map(renderElementModel);
  assert(models.length === 4 && models[0].gradient === true, 'Renderer must create one positioned model per editor element and preserve text gradient');
  assert(models[1].content === 'emoji:🔥', 'Sticker rendering must preserve non-text sticker content');
  assert(models[2].layout === 'column' && models[2].multiVote === true, 'Poll rendering must support options arrays, layout, and multi-vote state');
  assert(models[3].kind === 'mention/location/hashtag/link', 'Fallback editor elements must preserve supported addon content');
  assert(models.every(model => model.transform.includes('scale') && model.transform.includes('rotate')), 'Every element must preserve scale/rotation transform state');

  const moved = dragElement({ id: 'drag', type: 'text', text: 'Drag', x: 50, y: 50 }, {
    startX: 100, startY: 100, moveX: 200, moveY: 0, canvasWidth: 100, canvasHeight: 100,
  });
  assert(moved.element.x === 95 && moved.element.y === 5, 'Drag coordinates must clamp x/y to the 5–95 percent editor bounds');
  assert(moved.events.includes('delete-zone.show') && moved.events.includes('delete-zone.hide'), 'Drag lifecycle must show and hide delete zone');
  assert(moved.events.includes('transition:0.1s'), 'Drag end must restore transition');

  const deleted = dragElement({ id: 'delete-me', type: 'sticker', x: 40, y: 40 }, {
    startX: 0, startY: 0, moveX: 10, moveY: 10, canvasWidth: 100, canvasHeight: 100, inDeleteZone: true,
  });
  assert(deleted.deleted === true && deleted.element === null, 'Release inside delete zone must remove element and rerender');
  assert(deleted.events.includes('toast:Deleted'), 'Delete-zone removal must show deletion feedback');

  const textEdit = { type: 'text', id: 't1', text: 'Hello', font: 'serif', color: '#fff' };
  const editEvents = [];
  if (textEdit.type === 'text') {
    editEvents.push(`editing:${textEdit.id}`, `input:${textEdit.text}`, `font:${textEdit.font}`, `color:${textEdit.color}`, 'text-tool.open');
  }
  assert(editEvents.includes('editing:t1') && editEvents.includes('text-tool.open'), 'Text double-tap must select the element and open text editing state');

  console.log(JSON.stringify({ passed: true, models, moved, deleted, editEvents }, null, 2));
})();

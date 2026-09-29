// Local sticker list reader with malformed-data cleanup.
function getLocalStickers(type) {
  try {
    return JSON.parse(localStorage.getItem(type+'_stickers') || '[]');
  } catch(e) {
    localStorage.removeItem(type+'_stickers');
    return [];
  }
}

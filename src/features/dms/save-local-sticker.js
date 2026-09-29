// Local sticker recents persistence helper.
function saveLocalSticker(type, url) {
  let arr = getLocalStickers(type);
  if(!arr.includes(url)) { arr.unshift(url); if(arr.length > 20) arr.pop(); localStorage.setItem(type+'_stickers', JSON.stringify(arr)); }
}

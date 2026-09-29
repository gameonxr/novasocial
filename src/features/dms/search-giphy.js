// Sticker/GIF search controller.
let giphyDebounce;

async function searchGiphy(q) {
  clearTimeout(giphyDebounce);

  const r = document.getElementById('giphy-results');
  if(!r) return;

  if(!q.trim()) {
    r.innerHTML = '';
    return;
  }

  r.innerHTML = '<div style="padding:20px;text-align:center">Loading...</div>';

  giphyDebounce = setTimeout(async () => {
    try {
      const res = await fetch(
        'https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=' +
        encodeURIComponent(q) +
        '&limit=12&rating=pg'
      );

      console.log('GIPHY STATUS:', res.status);

      const data = await res.json();
      console.log('GIPHY DATA:', data);

      if (!data.data || !data.data.length) {
        r.innerHTML =
          '<div style="padding:20px;text-align:center">No GIFs found</div>';
        return;
      }

      r.innerHTML = data.data.map(g =>
        '<img src="' + g.images.fixed_height_small.url +
        '" data-url="' + g.images.original.url +
        '" onclick="sendGif(this)" style="width:100%;height:100px;object-fit:cover;border-radius:8px;cursor:pointer;">'
      ).join('');

    } catch(err) {
      console.error(err);
      r.innerHTML =
        '<div style="padding:20px;text-align:center">Failed to load GIFs</div>';
    }
  }, 500);
}

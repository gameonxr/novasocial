// Pure Cloudinary upload-transform URL helper.
function cldUrl(url, transform) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('/upload/')) return url; // not a Cloudinary URL or unexpected format
  if (!transform) return url;
  return url.replace('/upload/', `/upload/${transform}/`);
}

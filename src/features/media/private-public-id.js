// Pure Cloudinary deletion-helper public-ID parser.
function _extractPublicId(url) {
  if(!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return null;
  try {
    const parts = url.split('/upload/');
    if(parts.length < 2) return null;
    let path = parts[1];
    // Remove version prefix (v1234567/)
    path = path.replace(/^v\d+\//, '');
    // Remove file extension
    path = path.replace(/\.[^.]+$/, '');
    return path;
  } catch(e) { return null; }
}

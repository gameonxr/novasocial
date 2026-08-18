// Pure Cloudinary delivery URL public-ID parser.
function extractCloudinaryPublicId(url) {
  if(!url || !url.includes('cloudinary.com')) return null;
  try {
    // /upload/ ke baad wala part lo
    const parts = url.split('/upload/');
    if(parts.length < 2) return null;
    let path = parts[1];
    // Version number remove karo (v1234567/)
    path = path.replace(/^v\d+\//, '');
    // Extension remove karo
    path = path.replace(/\.[^.]+$/, '');
    return path;
  } catch(e) {
    return null;
  }
}

// Cloudinary se file delete karo (via deleted_media tracking table)
// NOTE: Free plan mein client-side direct delete ke liye
// signed request chahiye — isliye hum Supabase mein URL save karke
// track karenge, aur baad mein Edge Function se delete karwayenge

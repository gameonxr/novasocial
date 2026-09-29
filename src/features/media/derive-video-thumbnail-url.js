// Pure Cloudinary video-to-poster URL derivation helper.
function _deriveVideoThumbnailUrl(videoUrl) {
  if (!videoUrl || typeof videoUrl !== 'string') return null;
  if (!videoUrl.includes('cloudinary.com')) return null;
  if (!videoUrl.includes('/video/upload/')) return null;
  try {
    // Step 1: Change resource type from video → image
    let thumbUrl = videoUrl.replace('/video/upload/', '/image/upload/');
    // Step 2: Insert so_0 transform (start_offset=0 = first frame)
    //         + f_jpg (force JPG output) + reasonable size for poster use
    thumbUrl = thumbUrl.replace(
      '/image/upload/',
      '/image/upload/so_0,f_jpg,q_auto:good,w_800,c_limit/'
    );
    // Step 3: Change video extension to .jpg (Cloudinary needs explicit ext for image delivery)
    // Common video extensions: .mp4, .webm, .mov, .avi, .m4v, .mkv
    thumbUrl = thumbUrl.replace(/\.(mp4|webm|mov|avi|m4v|mkv)$/i, '.jpg');
    return thumbUrl;
  } catch(e) {
    console.warn('[Thumbnail] Derivation failed:', e.message);
    return null;
  }
}

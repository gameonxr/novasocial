// Cloudinary delivery URL quality optimizer.
function optimizeCloudinaryUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('cloudinary.com')) return url;
  // Skip video URLs (separate concern, video compression is different)
  if (url.includes('/video/upload/')) return url;

  const quality = getConnectionQuality();
  if (quality === 'good') return url; // default — no transform needed

  const transformStr = quality === 'low' ? 'q_auto:low,f_auto' : 'q_auto:eco,f_auto';

  // Check if a transform already exists in the URL path
  // (between /upload/ and the version/public_id)
  const uploadMarker = '/upload/';
  const uploadIdx = url.indexOf(uploadMarker);
  if (uploadIdx === -1) return url; // unexpected URL structure — bail

  const afterUpload = url.slice(uploadIdx + uploadMarker.length);

  // Detect existing transform: segments starting with q_, f_, w_, h_, c_, etc.
  // (Cloudinary transform params are comma-separated, no slashes within them)
  const firstSlash = afterUpload.indexOf('/');
  const firstSegment = firstSlash === -1 ? afterUpload : afterUpload.slice(0, firstSlash);

  // If first segment looks like a transform (contains q_ f_ w_ h_ c_ etc.)
  const isTransformSegment = /^[qfwchagtrseb].*=|^[qfwchagtrseb]_|^q_auto/.test(firstSegment);

  if (isTransformSegment) {
    // Transform already exists — replace q_auto:X with our quality, keep other params
    const newSegment = firstSegment
      .replace(/q_auto:(good|low|eco|best)/g, '') // remove existing q_auto:X
      .replace(/q_auto(?!:)/g, '') // remove bare q_auto (rare)
      .replace(/,,+/g, ',') // cleanup double commas
      .replace(/^,|,$/g, ''); // trim leading/trailing commas
    const combined = newSegment ? (transformStr.split(',')[0] + ',' + newSegment) : transformStr;
    return url.slice(0, uploadIdx + uploadMarker.length) + combined + afterUpload.slice(firstSlash);
  } else {
    // No transform — insert fresh transform segment
    return url.slice(0, uploadIdx + uploadMarker.length) + transformStr + '/' + afterUpload;
  }
}

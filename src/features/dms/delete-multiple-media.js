// Media deletion orchestration helper.
async function deleteMultipleMediaProduction(mediaUrls, source, reason) {
  const urls = (mediaUrls || []).filter(Boolean);
  if(!urls.length) return [];
  const results = await Promise.allSettled(
    urls.map(url => deleteMediaProduction(url, source, reason))
  );
  return results;
}

/**
 * Cloudinary se instant delete (delete_token use karke)
 * Ye SAFE hai client-side pe use karne ke liye kyunki
 * token sirf 1 specific file ke liye kaam karta hai aur 1 hour mein expire ho jaata hai
 */

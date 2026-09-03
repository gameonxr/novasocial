// deleteCloudinaryMedia — extracted from index.html
// Owner SHA-256: d4979254f38a286e715c2f7e70318bac83361fc945bfb5952fe597286a818264
// Classic script — exposes window.deleteCloudinaryMedia

window.deleteCloudinaryMedia = async function deleteCloudinaryMedia(mediaUrl) {
  if(!mediaUrl || !mediaUrl.includes('cloudinary.com')) return;

  const publicId = extractCloudinaryPublicId(mediaUrl);
  if(!publicId) return;

  // Which account ka hai ye URL?
  const account = CLOUDINARY_ACCOUNTS.find(a => mediaUrl.includes(a.cloud));
  if(!account) return;

  // deleted_media table mein insert karo (agar table nahi hai to localStorage fallback)
  try {
    await db.from('deleted_media').insert({
      media_url: mediaUrl,
      public_id: publicId,
      cloud_name: account.cloud,
      deleted_at: new Date().toISOString(),
    }).catch(() => {
      // Table nahi hai toh localStorage mein save karo
      const pending = JSON.parse(localStorage.getItem('_pendingDeletes') || '[]');
      pending.push({ mediaUrl, publicId, cloud: account.cloud });
      // Max 100 entries rakho
      if(pending.length > 100) pending.shift();
      localStorage.setItem('_pendingDeletes', JSON.stringify(pending));
    });

    console.log(`🗑️ Queued for deletion: ${publicId}`);
  } catch(e) {
    console.log('Delete queue failed:', e);
  }
};

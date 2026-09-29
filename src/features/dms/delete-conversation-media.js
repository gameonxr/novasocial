// deleteConversationMedia — extracted from index.html
// Owner SHA-256: 09876fe1c10c08490423215f0e5261363022ebb2b8d8157c092e2115da4d5335
// Classic script — exposes window.deleteConversationMedia

window.deleteConversationMedia = async function deleteConversationMedia(cid) {
  if(!cid) return;
  try {
    const { data: mediaMessages } = await db
      .from('messages')
      .select('media_url')
      .eq('conversation_id', cid)
      .not('media_url', 'is', null);

    if(!mediaMessages?.length) return;

    const urls = mediaMessages
      .map(m => m.media_url)
      .filter(url => url && url.includes('cloudinary.com'));

    if(urls.length) {
      await deleteMultipleMediaProduction(urls, 'chat', 'user_delete');
      console.log(`🧹 ${urls.length} chat media items queued for deletion`);
    }
  } catch(e) {
    console.error('Conversation media cleanup error (non-critical):', e);
  }
};

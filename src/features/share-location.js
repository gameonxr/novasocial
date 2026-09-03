// shareLocation — extracted from index.html
// Owner SHA-256: 1d1eb282f9ec7f473200afdece6ea7a75f14de8495346f7f28bfc279c5a3fb4f
// Classic script — exposes window.shareLocation

window.shareLocation = async function shareLocation(cid) {
  closeModal();
  if (!navigator.geolocation) return toast('Geolocation not supported');
  toast('Getting location...');
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude, longitude } = pos.coords;
    const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=15&size=400x400&markers=${latitude},${longitude},red-pushpin`;
    try {
      await db.from('messages').insert({ conversation_id: cid, sender_id: ME.id, text: `${latitude},${longitude}`, media_url: mapUrl, media_type: 'location' }).throwOnError();
      toast('Location sent! 📍');
    } catch(e) {
      if (e.message?.includes('MESSAGING_BLOCKED')) {
        toast("You can't send messages to this user");
      } else {
        console.error('Location send failed:', e);
        toast('Location send nahi hui 😕');
      }
    }
  }, err => toast('Location permission denied'), { enableHighAccuracy: true });
};

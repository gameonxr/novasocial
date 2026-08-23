window.refreshProfileCounts = async function(userId) {
  try {
    const [{ data: target }, { data: me }] = await Promise.all([
      db.from('profiles').select('followers_count').eq('id', userId).single(),
      db.from('profiles').select('following_count').eq('id', ME.id).single()
    ]);
    if (target && document.getElementById('followers-count')) {
      const fel = document.getElementById('followers-count');
      fel.dataset.raw = target.followers_count || 0;
      fel.textContent = fmt(target.followers_count || 0);
    }
    if (me && document.getElementById('following-count')) {
      const myFel = document.getElementById('following-count');
      myFel.dataset.raw = me.following_count || 0;
      myFel.textContent = fmt(me.following_count || 0);
    }
  } catch (e) {}
};

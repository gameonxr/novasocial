// Story viewer clipboard helper.
async function copyStoryLink(id) {
  try {
    await navigator.clipboard.writeText(window.location.origin + '/?story=' + id);
    toast('Story link copied! 📋');
    closeModal();
  } catch(e) { toast('Could not copy'); }
}

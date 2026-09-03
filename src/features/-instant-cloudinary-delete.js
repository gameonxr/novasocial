// _instantCloudinaryDelete — extracted from index.html
// Owner SHA-256: bf508d39ae8aca9eedd97dce903aabf0e2c2becad6a6b00179266278d049a31d
// Classic script — exposes window._instantCloudinaryDelete

window._instantCloudinaryDelete = async function _instantCloudinaryDelete(deleteToken, cloudName, resourceType = 'image') {
  if(!deleteToken || !cloudName) return false;
  try {
    const resp = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/delete_by_token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: deleteToken }),
      }
    );
    if(!resp.ok) {
      console.warn('Instant delete HTTP failed:', resp.status);
      return false;
    }
    const result = await resp.json();
    return result.result === 'ok';
  } catch(e) {
    console.warn('Instant delete API call failed:', e);
    return false;
  }
};

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const featureDir = path.join(root, 'src', 'features');
const context = {
  console: { warn() {} },
  getConnectionQuality: () => 'good',
};
vm.createContext(context);

for (const file of ['cld-url.js', 'optimize-cloudinary-url.js', 'derive-video-thumbnail-url.js']) {
  const source = fs.readFileSync(path.join(featureDir, file), 'utf8');
  vm.runInContext(source, context, { filename: file });
}

const cloudinaryImage = 'https://res.cloudinary.com/demo/image/upload/v123/novasocial/posts/post.webp';
const cloudinaryVideo = 'https://res.cloudinary.com/demo/video/upload/v123/novasocial/reels/reel.mp4';
const regularImage = 'https://example.com/media/post.webp';

assert.strictEqual(
  context.cldUrl(cloudinaryImage, 'q_auto:good,f_auto,w_800'),
  'https://res.cloudinary.com/demo/image/upload/q_auto:good,f_auto,w_800/v123/novasocial/posts/post.webp',
  'cldUrl must insert a non-empty transform after /upload/'
);
assert.strictEqual(context.cldUrl(regularImage, 'q_auto:good'), regularImage, 'cldUrl must pass through non-Cloudinary URLs');
assert.strictEqual(context.cldUrl(cloudinaryImage, ''), cloudinaryImage, 'cldUrl must pass through empty transforms');

context.getConnectionQuality = () => 'good';
assert.strictEqual(context.optimizeCloudinaryUrl(cloudinaryImage), cloudinaryImage, 'good connections must preserve the original image URL');
assert.strictEqual(context.optimizeCloudinaryUrl(cloudinaryVideo), cloudinaryVideo, 'video delivery URLs must bypass image optimization');
assert.strictEqual(context.optimizeCloudinaryUrl(regularImage), regularImage, 'non-Cloudinary URLs must pass through optimization');

context.getConnectionQuality = () => 'low';
assert.strictEqual(
  context.optimizeCloudinaryUrl(cloudinaryImage),
  'https://res.cloudinary.com/demo/image/upload/q_auto:low,f_auto/v123/novasocial/posts/post.webp',
  'low-quality connections must receive the low quality transform'
);
const existingTransform = 'https://res.cloudinary.com/demo/image/upload/q_auto:good,w_800,c_limit/v123/novasocial/posts/post.webp';
assert.strictEqual(
  context.optimizeCloudinaryUrl(existingTransform),
  'https://res.cloudinary.com/demo/image/upload/q_auto:low,w_800,c_limit/v123/novasocial/posts/post.webp',
  'existing quality must be replaced while preserving other transforms'
);

const expectedPoster = 'https://res.cloudinary.com/demo/image/upload/so_0,f_jpg,q_auto:good,w_800,c_limit/v123/novasocial/reels/reel.jpg';
assert.strictEqual(context._deriveVideoThumbnailUrl(cloudinaryVideo), expectedPoster, 'video poster derivation must use the current first-frame JPG transform');
assert.strictEqual(context._deriveVideoThumbnailUrl(regularImage), null, 'non-Cloudinary poster input must return null');
assert.strictEqual(context._deriveVideoThumbnailUrl(cloudinaryImage), null, 'non-video Cloudinary input must return null');
assert.strictEqual(context._deriveVideoThumbnailUrl(null), null, 'empty poster input must return null');

console.log('CLOUDINARY_URL_BUILDER_HARNESS=PASS');
console.log('PURE_HELPERS=3');
console.log('TRANSFORM_INSERTION=PASS');
console.log('QUALITY_OPTIMIZATION=PASS');
console.log('VIDEO_POSTER_DERIVATION=PASS');
console.log('SAFE_PASSTHROUGH=PASS');

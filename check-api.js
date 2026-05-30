const fs = require('fs');
const json = JSON.parse(fs.readFileSync('./docs/backend-api-docs.txt', 'utf8'));

console.log('=== 새로운 미디어 메모 엔드포인트 확인 ===\n');

// /v1/memos/image
const imageEndpoint = json.paths['/v1/memos/image'];
if (imageEndpoint?.post) {
  console.log('✓ /v1/memos/image (POST)');
  const imgReq = imageEndpoint.post.requestBody?.content['multipart/form-data'];
  console.log('  Request Fields:', Object.keys(imgReq?.schema?.properties || {}));
  console.log('  Response: MemoDto');
  console.log();
}

// /v1/memos/video
const videoEndpoint = json.paths['/v1/memos/video'];
if (videoEndpoint?.post) {
  console.log('✓ /v1/memos/video (POST)');
  const vidReq = videoEndpoint.post.requestBody?.content['multipart/form-data'];
  console.log('  Request Fields:', Object.keys(vidReq?.schema?.properties || {}));
  console.log('  Response: MemoDto');
  console.log();
}

// /v1/memos/file
const fileEndpoint = json.paths['/v1/memos/file'];
if (fileEndpoint?.post) {
  console.log('✓ /v1/memos/file (POST)');
  const fileReq = fileEndpoint.post.requestBody?.content['multipart/form-data'];
  console.log('  Request Fields:', Object.keys(fileReq?.schema?.properties || {}));
  console.log('  Response: MemoDto');
  console.log();
}

// MemoDto 스키마 확인
const memoSchema = json.components?.schemas?.MemoDto;
if (memoSchema) {
  console.log('✓ MemoDto 응답 스키마 확인됨');
  console.log('  Properties:', Object.keys(memoSchema.properties || {}).slice(0, 10));
}

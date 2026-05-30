# 백엔드 API 명세 확인 요청

## 현재 상황
- PR #36에서 메모에 이미지, 영상, 파일 첨부 지원 추가
- 프론트엔드에서 미디어 메모 전송 기능 구현 중
- 메모 생성 시 **HTTP 500 에러** 발생

## 요청 사항

### 1. **메모 생성 API (POST /v1/memos) 최신 스키마 확인**

현재 프론트엔드에서 전송하는 Request Body:

```json
{
  "text": " ",
  "imageUris": ["https://...", "https://..."],
  "imageKeys": ["s3-key-1", "s3-key-2"],
  "videoUris": ["https://..."],
  "videoKeys": ["s3-video-key"],
  "files": [
    {
      "uid": "file-1",
      "name": "document.pdf",
      "url": "https://...",
      "key": "s3-file-key",
      "mimeType": "application/pdf",
      "size": 1024000
    }
  ]
}
```

### 2. **PR #36 이후 NewMemoDto 스키마**

다음 필드들이 **실제로 지원되는지** 확인 필요:

| 필드 | 타입 | 설명 | 필수 |
|------|------|------|------|
| `text` | string | 메모 텍스트 | ✓ |
| `urls` | string[] | 링크 URL 배열 | |
| `ogDatas` | OgData[] | OG 메타데이터 배열 | |
| `imageUris` | string[] | 이미지 URL 배열 | |
| `imageKeys` | string[] | 이미지 S3 Key 배열 | |
| `videoUris` | string[] | 동영상 URL 배열 | |
| `videoKeys` | string[] | 동영상 S3 Key 배열 | |
| `files` | FileAttachmentDto[] | 파일 첨부 배열 | |

**FileAttachmentDto 스키마:**
```
{
  uid: string
  name: string
  url: string
  key: string
  mimeType: string
  size: number
}
```

### 3. **메모 생성 응답 (Response)**

현재 프론트엔드 기대 Response 형식:

```json
{
  "success": true,
  "status": 201,
  "message": "메모가 생성되었습니다.",
  "data": {
    "uid": "memo-uuid",
    "userId": "user-uuid",
    "text": " ",
    "imageUris": ["https://..."],
    "imageKeys": ["s3-key-1"],
    "videoUris": ["https://..."],
    "videoKeys": ["s3-video-key"],
    "files": [...],
    "urls": [],
    "ogDatas": [],
    "bookmarked": false,
    "createdAt": "2026-05-30T10:00:00Z"
  }
}
```

### 4. **문제 진단 요청**

500 에러 발생 원인:

- [ ] 지원하지 않는 필드가 있는가?
- [ ] 필드명이 틀렸는가? (예: `videoUri` vs `videoUris`)
- [ ] 데이터 타입이 맞지 않는가?
- [ ] 필수 필드가 누락되었는가?
- [ ] 백엔드 로그에서 에러 메시지가 있는가?

### 5. **첨부파일 배열 필드명 확인**

백엔드에서 실제 사용하는 필드명:
- `files` (현재 전송)
- `attachments`?
- `fileAttachments`?
- 기타?

---

## 기타 참고

- 업로드 서비스: `uploadImages`, `uploadVideo`, `uploadFile` 모두 정상 동작
- 응답 형식: 
  - `uploadImages()` → `{ urls: string[], keys: string[] }`
  - `uploadVideo()` → `{ url: string, key: string, duration: number, size: number }`
  - `uploadFile()` → `{ uid: string, name: string, url: string, key: string, mimeType: string, size: number }`

---

**요청**: 위의 신규 필드들이 **실제로 지원되는지**, 그리고 **데이터 형식이 정확한지** 확인 후 API 명세 업데이트 부탁드립니다.

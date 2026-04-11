# MEMME 메모·보드·노트 도메인 백엔드 API 명세서

> 작성 기준: 프론트엔드 코드 분석 및 도메인 재설계 (2026-04-11)  
> 현재 상태: 모든 데이터는 AsyncStorage(로컬)에만 저장되며, 백엔드 연동이 전혀 없는 상태입니다.

---

## 1. 도메인 개요

### 핵심 개념 3가지

| 개념 | 코드 타입명 | `type` 값 | 한 줄 설명 |
|------|-----------|----------|----------|
| **메모** (Memo) | `Memo` | `"memo"` | 빠르게 던지는 텍스트 한 줄. 아직 정리되지 않은 생각 |
| **보드** (Board) | `Board` | `"board"` | 관련 노트들을 묶는 컨테이너. 제목·설명·태그만 가짐 |
| **노트** (Note) | `Note` | - | 보드 안에 속하는 실제 내용 단위. 이미지·링크·파일 등 모든 미디어가 여기에 귀속 |

> **역할 분리 원칙**  
> - 보드(Board): **"무엇에 관한 묶음인가"** 를 정의 → 분류와 구조  
> - 노트(Note): **"실제 내용"** 을 담음 → 텍스트, 이미지, 링크, 파일  
> - 메모(Memo): **"일단 던져두는 것"** → 보드로 변환되거나 그냥 남거나

### 데이터 타입 계층

```
TimelineItem (union)
├── Memo    (type: 'memo')   — 빠른 텍스트 메모. 독립 존재.
└── Board   (type: 'board')  — 노트들의 컨테이너.
      └── Note[]              — 실제 내용 단위. Board 없이 존재 불가.

PendingLink                   — 외부 공유 링크 임시 보관함 (별도 도메인)
```

---

## 2. 핵심 타입 정의

### 2-1. Memo (메모)

빠르게 입력하는 텍스트 한 줄 메모입니다. 수정 기능이 없으며, 보드로 변환할 수 있습니다.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | `string` | ✅ | 고유 ID |
| `userId` | `string` | ✅ | 작성자 유저 ID |
| `type` | `"memo"` | ✅ | 고정값 |
| `text` | `string` | ✅ | 메모 본문 |
| `bookMark` | `boolean` | ✅ | 북마크 여부 (기본값: `false`) |
| `createdAt` | `string` (ISO 8601) | ✅ | 생성 시각 |

**JSON 예시:**
```json
{
  "id": "1712800000000",
  "userId": "24",
  "type": "memo",
  "text": "코딩 공부하기",
  "bookMark": false,
  "createdAt": "2026-04-11T10:00:00.000Z"
}
```

---

### 2-2. Board (보드)

노트들을 묶는 최상위 컨테이너입니다. **이미지·링크·파일을 직접 갖지 않습니다.**  
"이 묶음이 무엇에 관한 것인지"를 제목·설명·태그로 표현합니다.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | `string` | ✅ | 고유 ID |
| `userId` | `string` | ✅ | 작성자 유저 ID |
| `type` | `"board"` | ✅ | 고정값 |
| `title` | `string` | ✅ | 보드 제목 (최대 100자) |
| `description` | `string` | ❌ | 이 보드가 무엇을 담는지 설명 |
| `tags` | `string[]` | ❌ | 태그 목록 (검색·필터링에 사용) |
| `notes` | `Note[]` | ❌ | 보드에 속한 노트 목록 |
| `bookMark` | `boolean` | ✅ | 북마크 여부 (기본값: `false`) |
| `createdAt` | `string` (ISO 8601) | ✅ | 생성 시각 |
| `updatedAt` | `string` (ISO 8601) | ❌ | 최근 수정 시각 |

> **태그 규칙 (백엔드 검증 권장):**
> - 태그 1개 최대 길이: 30자
> - 보드 1개당 최대 태그 수: 10개
> - 소문자로 정규화하여 저장 권장 (`"React"` → `"react"`)
> - 중복 태그 제거 후 저장

**JSON 예시:**
```json
{
  "id": "1712800000001",
  "userId": "24",
  "type": "board",
  "title": "수학교육 과동아리",
  "description": "동아리 관련 공지와 자료 모음",
  "tags": ["동아리", "학교"],
  "bookMark": false,
  "createdAt": "2026-04-11T10:05:00.000Z",
  "updatedAt": "2026-04-11T10:30:00.000Z",
  "notes": [
    {
      "id": "note_1",
      "title": "여름 MT",
      "content": "MT 추가요금 공지\n1인당 추가요금 4,115원...",
      "imageUris": [],
      "videoUris": [],
      "files": [],
      "url": null,
      "ogData": null
    },
    {
      "id": "note_2",
      "title": "수학 모임",
      "content": "이번 주 수학 모임은 화요일 오후 6시 도서관 2층",
      "imageUris": [],
      "videoUris": [],
      "files": [],
      "url": null,
      "ogData": null
    }
  ]
}
```

---

### 2-3. Note (노트)

Board에 속하는 실제 내용 단위입니다. **모든 미디어(이미지·영상·파일·링크)는 노트에서 관리합니다.**  
독립적으로 존재할 수 없으며, 반드시 하나의 Board에 속합니다.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | `string` | ✅ | 고유 ID |
| `title` | `string` | ✅ | 노트 제목 |
| `content` | `string` | ❌ | 노트 본문 텍스트 |
| `imageUris` | `string[]` | ❌ | 첨부 이미지 URL 목록 (최대 10장) |
| `videoUris` | `string[]` | ❌ | 첨부 영상 URL 목록 |
| `files` | `FileAttachment[]` | ❌ | 첨부 파일 목록 |
| `url` | `string` | ❌ | 링크 URL |
| `ogData` | `OgData` | ❌ | OG 미리보기 데이터 (`url`이 있을 때) |

> **미디어 중복 허용:** 하나의 노트에 이미지·영상·파일·링크를 동시에 첨부할 수 있습니다.

**JSON 예시 (이미지 + 링크가 있는 노트):**
```json
{
  "id": "note_3",
  "title": "여름 MT 사진",
  "content": "MT에서 찍은 사진들",
  "imageUris": [
    "https://cdn.example.com/uploads/mt1.jpg",
    "https://cdn.example.com/uploads/mt2.jpg"
  ],
  "videoUris": [],
  "files": [],
  "url": "https://photos.google.com/album/abc",
  "ogData": {
    "title": "Google Photos Album",
    "description": "MT 앨범",
    "imageUrl": "https://photos.google.com/og.jpg",
    "siteName": "Google Photos"
  }
}
```

---

### 2-4. FileAttachment (첨부 파일)

`Note.files` 배열의 원소입니다.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | `string` | ✅ | 파일 고유 ID |
| `name` | `string` | ✅ | 원본 파일명 (예: `기획서.pdf`) |
| `url` | `string` | ✅ | 파일 다운로드 URL |
| `mimeType` | `string` | ✅ | MIME 타입 (예: `application/pdf`, `video/mp4`) |
| `size` | `number` | ✅ | 파일 크기 (bytes) |

> `mimeType`이 `video/*`이면 `videoUris`로 분리하고, 그 외는 `files`로 관리합니다.  
> UI에서 영상은 인라인 재생, 파일은 다운로드 링크로 표시되므로 백엔드에서도 이를 구분하여 저장합니다.

---

### 2-5. OgData (OG 미리보기)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `title` | `string` | ✅ | OG title |
| `description` | `string` | ❌ | OG description |
| `imageUrl` | `string` | ❌ | OG 이미지 URL |
| `siteName` | `string` | ❌ | OG site_name |

---

### 2-6. PendingLink (링크 인박스 임시 항목)

외부 앱에서 공유된 링크를 사용자가 처리하기 전까지 임시 보관하는 타입입니다.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | `string` | ✅ | pending 항목 고유 ID |
| `userId` | `string` | ✅ | 수신한 유저 ID |
| `url` | `string` | ✅ | 공유된 원본 URL |
| `ogData` | `OgData` | ❌ | OG 미리보기 (서버가 수신 시점에 스크래핑) |
| `receivedAt` | `string` (ISO 8601) | ✅ | 공유 수신 시각 |

---

## 3. 핵심 사용자 흐름별 API 시나리오

### 3-A. 메모 → 보드 변환 흐름

메모를 롱프레스 → "보드로 변환" 선택 시 아래 흐름이 실행됩니다.

```
[선택지 Bottom Sheet]
├── "새 보드 만들기"    → 시나리오 3-A-1
└── "기존 보드에 추가"  → 시나리오 3-A-2
```

#### 시나리오 3-A-1: 새 보드 만들기

한 화면에서 보드 제목과 첫 번째 노트 이름을 함께 입력합니다.  
노트 이름 필드는 기존 메모 텍스트로 자동 채워지므로 사용자는 보드 제목만 입력하면 됩니다.

```
사용자 입력 화면:
  보드 제목:  [____________]  (필수)
  태그:       [+ 태그 추가]
  설명:       [____________]  (선택)
  ──────────────────────────
  첫 번째 노트 이름: [코딩 공부하기]  ← 메모 텍스트 자동 채워짐, 수정 가능
```

**API 호출 순서 (프론트에서 순차 실행):**

```
1. POST /api/boards           → 보드 생성
2. POST /api/boards/:id/notes → 노트 생성 (메모 텍스트를 title로)
3. DELETE /api/memos/:memoId  → 원본 메모 삭제
```

#### 시나리오 3-A-2: 기존 보드에 추가

```
보드 목록 피커 (최근 수정순 + 검색):
  [스터디 그룹 → 선택]

사용자 입력 화면:
  노트 이름:  [코딩 공부하기]  ← 자동 채워짐, 수정 가능
  내용:       [____________]  (선택)
```

**API 호출 순서:**

```
1. POST /api/boards/:boardId/notes → 기존 보드에 노트 추가
2. DELETE /api/memos/:memoId       → 원본 메모 삭제
```

---

### 3-B. 외부 링크 공유 → 노트 저장 흐름

```
외부 앱에서 URL 공유
       ↓
POST /api/pending-links  ← 앱이 즉시 서버에 저장 (OG 스크래핑은 서버가 처리)
       ↓
헤더 배지에 미처리 수 표시  ← GET /api/pending-links (count 기반)
       ↓
사용자가 배지 탭 → 인박스 Bottom Sheet
       ↓
링크 선택 → 목적지 선택
├── "새 보드 만들기"
│     → POST /api/boards
│     → POST /api/boards/:id/notes (url + ogData 포함)
│     → DELETE /api/pending-links/:id
│
└── "기존 보드에 추가"
      → POST /api/boards/:boardId/notes (url + ogData 포함)
      → DELETE /api/pending-links/:id
```

---

### 3-C. 노트 다른 보드로 이동

```
BoardDetailScreen에서 노트 "..." 메뉴 → "다른 보드로 이동"
       ↓
보드 피커 Bottom Sheet (최근 수정순 + 검색, 현재 보드 제외)
       ↓
PATCH /api/boards/:sourceBoardId/notes/:noteId/move
  { "targetBoardId": "..." }
       ↓
source·target 두 보드 동시 업데이트 (트랜잭션)
```

---

## 4. API 엔드포인트 상세

### 4-1. 타임라인 (메모 + 보드 혼합)

#### 타임라인 목록 조회

```
GET /api/timeline?userId={userId}
```

메모와 보드를 `createdAt` 오름차순으로 혼합하여 반환합니다.

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `userId` | `string` | ✅ | 조회할 유저 ID |
| `type` | `"memo"` \| `"board"` | ❌ | 특정 타입만 필터 |
| `tags` | `string` | ❌ | 태그 필터 (쉼표 구분, AND 조건). 예: `tags=동아리,학교` |
| `q` | `string` | ❌ | 키워드 검색 (제목·본문·태그 대상) |
| `sort` | `"createdAt"` \| `"updatedAt"` | ❌ | 정렬 기준 (기본: `createdAt`) |
| `page` | `number` | ❌ | 페이지 번호 (기본값: 1) |
| `limit` | `number` | ❌ | 페이지당 항목 수 (기본값: 50) |

> - `tags` 필터는 Board에만 적용됩니다. Memo는 태그가 없으므로 `tags` 파라미터 사용 시 Memo는 결과에서 제외됩니다.
> - `sort=updatedAt`은 보드 목적지 피커(3-A, 3-B 시나리오)에서 최근 수정 보드 목록 조회 시 사용합니다.
> - `excludeId` 파라미터: 특정 보드를 결과에서 제외 (노트 이동 시 현재 보드 제외용).

**응답 (200 OK):**
```json
{
  "items": [ /* (Memo | Board)[] */ ],
  "total": 120,
  "page": 1,
  "limit": 50
}
```

---

### 4-2. 메모 (Memo)

#### 메모 생성

```
POST /api/memos
```

```json
{
  "userId": "24",
  "text": "코딩 공부하기"
}
```

**응답 (201 Created):** 생성된 `Memo` 객체 반환 (id, createdAt 서버 부여)

---

#### 메모 삭제

```
DELETE /api/memos/:id
```

**응답 (204 No Content)**

> 메모에는 수정 기능이 없습니다. 내용을 바꾸려면 삭제 후 재작성하거나 보드로 변환합니다.

---

#### 메모 북마크 토글

```
PATCH /api/memos/:id/bookmark
```

```json
{ "bookMark": true }
```

**응답 (200 OK):** 업데이트된 `Memo` 반환

---

### 4-3. 보드 (Board)

#### 보드 생성

```
POST /api/boards
```

```json
{
  "userId": "24",
  "title": "수학교육 과동아리",
  "description": "동아리 관련 공지와 자료 모음",
  "tags": ["동아리", "학교"]
}
```

**응답 (201 Created):** 생성된 `Board` 객체 반환 (`notes: []`로 초기화)

---

#### 보드 수정

```
PUT /api/boards/:id
```

보드의 메타 정보(제목·설명·태그)를 수정합니다. 노트 목록은 이 API로 변경하지 않습니다.

```json
{
  "title": "수정된 제목",
  "description": "수정된 설명",
  "tags": ["동아리", "학교", "공지"]
}
```

**응답 (200 OK):** 수정된 `Board` 반환 (`updatedAt` 서버에서 갱신)

---

#### 보드 삭제

```
DELETE /api/boards/:id
```

보드를 삭제하면 속한 노트도 **모두 함께 삭제**됩니다.

**응답 (204 No Content)**

---

#### 보드 북마크 토글

```
PATCH /api/boards/:id/bookmark
```

```json
{ "bookMark": true }
```

**응답 (200 OK):** 업데이트된 `Board` 반환

---

### 4-4. 노트 (Note)

#### 노트 추가 (보드에 생성)

```
POST /api/boards/:boardId/notes
```

노트는 반드시 특정 보드에 속하므로 경로에 `boardId`가 포함됩니다.

```json
{
  "title": "여름 MT",
  "content": "MT 추가요금 공지...",
  "imageUris": [],
  "videoUris": [],
  "files": [],
  "url": null,
  "ogData": null
}
```

> **미디어 업로드 순서:** 이미지·영상·파일은 먼저 `/api/upload/*`로 업로드한 뒤 반환된 URL을 필드에 담아 노트를 생성합니다.

**응답 (201 Created):** 생성된 `Note` 반환, 부모 `Board.updatedAt` 갱신

---

#### 노트 수정

```
PUT /api/boards/:boardId/notes/:noteId
```

```json
{
  "title": "수정된 노트 제목",
  "content": "수정된 내용",
  "imageUris": ["https://cdn.example.com/img1.jpg"],
  "videoUris": [],
  "files": [
    {
      "id": "file_1",
      "name": "공지.pdf",
      "url": "https://cdn.example.com/notice.pdf",
      "mimeType": "application/pdf",
      "size": 204800
    }
  ],
  "url": "https://example.com",
  "ogData": {
    "title": "Example",
    "description": "...",
    "imageUrl": "https://example.com/og.jpg",
    "siteName": "Example"
  }
}
```

**응답 (200 OK):** 수정된 `Note` 반환, 부모 `Board.updatedAt` 갱신

---

#### 노트 삭제

```
DELETE /api/boards/:boardId/notes/:noteId
```

**응답 (204 No Content)**, 부모 `Board.updatedAt` 갱신

---

#### 노트 다른 보드로 이동

```
PATCH /api/boards/:sourceBoardId/notes/:noteId/move
```

source 보드에서 노트를 제거하고 target 보드의 `notes` 배열 맨 뒤에 추가합니다.  
두 보드를 **원자적으로 업데이트**합니다 (DB 트랜잭션 필수).

```json
{
  "targetBoardId": "1712800000005"
}
```

**응답 (200 OK):**
```json
{
  "sourceBoard": { /* 노트가 제거된 source Board */ },
  "targetBoard": { /* 노트가 추가된 target Board */ }
}
```

> **원자성 주의:** source 제거 성공 후 target 추가 실패 시 데이터 손실이 발생합니다.  
> MongoDB라면 세션 기반 트랜잭션, RDB라면 단일 트랜잭션으로 두 작업을 묶어야 합니다.

---

### 4-5. 태그

#### 태그 목록 조회

```
GET /api/tags?userId={userId}
```

유저가 보드에서 사용한 태그 목록을 사용 빈도 내림차순으로 반환합니다.  
태그 필터 UI 및 입력 자동완성에 사용됩니다.

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `userId` | `string` | ✅ | 조회할 유저 ID |
| `q` | `string` | ❌ | 태그 이름 prefix 검색 (자동완성용) |

**응답 (200 OK):**
```json
{
  "tags": [
    { "name": "동아리", "count": 12 },
    { "name": "학교", "count": 8 },
    { "name": "업무", "count": 5 }
  ]
}
```

---

### 4-6. 링크 인박스 (Pending Links)

외부 앱에서 공유된 URL을 즉시 보드/노트로 만들지 않고 사용자가 검토 후 배치할 수 있도록 임시 보관합니다.

#### Pending 링크 저장

```
POST /api/pending-links
```

앱이 외부 공유 URL을 수신하는 즉시 호출합니다. 서버가 OG 스크래핑을 담당합니다.

```json
{
  "userId": "24",
  "url": "https://example.com/article"
}
```

**응답 (201 Created):**
```json
{
  "pendingLink": {
    "id": "pending_1712800000000",
    "userId": "24",
    "url": "https://example.com/article",
    "ogData": {
      "title": "Article Title",
      "description": "Article description",
      "imageUrl": "https://example.com/og.jpg",
      "siteName": "Example"
    },
    "receivedAt": "2026-04-11T10:00:00.000Z"
  }
}
```

> OG 스크래핑 실패 시 `ogData: null`로 저장하고 201을 반환합니다. 링크 자체는 보관됩니다.

---

#### Pending 링크 목록 조회

```
GET /api/pending-links?userId={userId}
```

**응답 (200 OK):**
```json
{
  "pendingLinks": [ /* PendingLink[] */ ],
  "count": 3
}
```

> `count`: 헤더 배지 숫자 표시에 사용됩니다.

---

#### Pending 링크 삭제 (처리 완료)

```
DELETE /api/pending-links/:id
```

사용자가 링크를 보드/노트에 추가하거나 무시한 후 호출합니다.

**응답 (204 No Content)**

---

### 4-7. 미디어·파일 업로드

> 현재 프론트는 로컬 `file://` URI를 그대로 저장합니다. 백엔드 연동 시 업로드 API를 통해 공개 URL로 교체합니다.  
> **모든 미디어는 노트(Note)에만 첨부됩니다. 보드(Board)에는 첨부하지 않습니다.**

#### 이미지 업로드

```
POST /api/upload/image
Content-Type: multipart/form-data
```

최대 10개의 이미지 파일 (`image/jpeg`, `image/png`, `image/gif`, `image/webp` 등)

**응답 (200 OK):**
```json
{
  "urls": [
    "https://cdn.example.com/uploads/image1.jpg",
    "https://cdn.example.com/uploads/image2.jpg"
  ]
}
```

> 프론트 라이브러리: `react-native-image-picker` (`launchImageLibrary`, `selectionLimit: 10`)

---

#### 영상 업로드

```
POST /api/upload/video
Content-Type: multipart/form-data
```

영상 파일 1개 (`video/mp4`, `video/mov`, `video/avi` 등)

**응답 (200 OK):**
```json
{
  "url": "https://cdn.example.com/uploads/video1.mp4",
  "thumbnailUrl": "https://cdn.example.com/uploads/video1_thumb.jpg",
  "duration": 42,
  "size": 10485760
}
```

> `thumbnailUrl`: 영상 미리보기 썸네일 표시용.  
> `duration`: 초 단위 재생 길이.

---

#### 파일 업로드

```
POST /api/upload/file
Content-Type: multipart/form-data
```

파일 1개 (이미지·영상 제외 권장)

**응답 (200 OK):**
```json
{
  "id": "file_abc123",
  "name": "기획서.pdf",
  "url": "https://cdn.example.com/uploads/plan.pdf",
  "mimeType": "application/pdf",
  "size": 204800
}
```

> 응답 객체가 `FileAttachment` 타입과 동일합니다. 프론트에서 응답을 그대로 `Note.files`에 추가합니다.

---

### 4-8. OG 데이터 조회

```
GET /api/og?url={encodedUrl}
```

보드/노트 편집 화면에서 사용자가 URL을 직접 입력할 때 미리보기용으로 사용됩니다.  
(외부 공유 링크는 `POST /api/pending-links` 시점에 서버가 자동 스크래핑하므로 이 엔드포인트를 사용하지 않습니다.)

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `url` | `string` | ✅ | OG 데이터를 가져올 URL (URL 인코딩) |

**응답 (200 OK):**
```json
{
  "title": "Article Title",
  "description": "Article description",
  "imageUrl": "https://example.com/og.jpg",
  "siteName": "Example"
}
```

---

## 5. 인증

```
Authorization: Bearer {accessToken}
```

- `accessToken`은 AsyncStorage 키 `'accessToken'`에서 읽습니다.
- 모든 API 요청에 헤더로 포함되어야 합니다.

---

## 6. 기존 API와의 관계

`/src/utils/api.ts`에 정의된 암호화 메시지 시스템 API는 메모·보드·노트 UI와 **전혀 연결되어 있지 않습니다.**

| 기존 엔드포인트 | 용도 | 관계 |
|--------------|------|------|
| `POST /api/messages/test` | 암호화 메시지 전송 | 무관 |
| `GET /api/messages/test/:userId` | 암호화 메시지 조회 | 무관 |
| `DELETE /api/messages/clear` | 전체 삭제 | 무관 |

메모·보드·노트 API는 완전히 새로운 엔드포인트 그룹으로 설계합니다.

---

## 7. 향후 구현 예정 기능

프론트 UI에 이미 자리잡혀 있으나 아직 작동하지 않는 기능들입니다.

| 기능 | 필요한 API |
|------|-----------|
| 영상 첨부 | `POST /api/upload/video` → `Note.videoUris` |
| 파일 첨부 | `POST /api/upload/file` → `Note.files` |
| 시작/마감 날짜 (스케줄) | `Board` 또는 `Note`에 `startDate`, `dueDate` 필드 추가 |
| 사이드메뉴 미디어 목록 | `GET /api/timeline?userId=&type=board&hasMedia=true` |
| 스토리지 사용량 | 유저별 스토리지 사용량 조회 API |
| 유저 이름 | 유저 프로필 조회 API |

---

## 8. 데이터 마이그레이션 고려사항

백엔드 연동 시 AsyncStorage의 기존 데이터를 서버로 옮기는 작업이 필요합니다.

| 항목 | 처리 방법 |
|------|---------|
| 기존 `type: "chat"` 항목 | `type: "memo"`로 변환 |
| 기존 `type: "post"` 항목 | `type: "board"`로 변환, `content` → `description`으로 필드 이름 변경 |
| 기존 `subItems[]` | `notes[]`로 이름 변경 |
| 기존 `BoardPost.imageUris` | 노트가 없는 보드인 경우, 빈 제목의 노트 1개를 생성하여 이미지를 이관 |
| 기존 `BoardPost.url` / `ogData` | 동일하게 빈 제목의 노트로 이관 |
| 로컬 `id` (타임스탬프 문자열) | 서버 ID 체계와 충돌하지 않도록 별도 처리 |
| 로컬 `imageUris` (`file://` 경로) | `/api/upload/image`로 업로드 후 원격 URL로 교체 |

---

## 9. 엔드포인트 요약

**타임라인**

| Method | Endpoint | 설명 |
|--------|---------|------|
| `GET` | `/api/timeline` | 메모+보드 혼합 타임라인 (type·tags·q·sort·excludeId 지원) |

**메모 (Memo)**

| Method | Endpoint | 설명 |
|--------|---------|------|
| `POST` | `/api/memos` | 메모 생성 |
| `DELETE` | `/api/memos/:id` | 메모 삭제 |
| `PATCH` | `/api/memos/:id/bookmark` | 북마크 토글 |

**보드 (Board)**

| Method | Endpoint | 설명 |
|--------|---------|------|
| `POST` | `/api/boards` | 보드 생성 |
| `PUT` | `/api/boards/:id` | 보드 메타 수정 (제목·설명·태그) |
| `DELETE` | `/api/boards/:id` | 보드 삭제 (하위 노트 포함) |
| `PATCH` | `/api/boards/:id/bookmark` | 북마크 토글 |

**노트 (Note)**

| Method | Endpoint | 설명 |
|--------|---------|------|
| `POST` | `/api/boards/:boardId/notes` | 노트 생성 |
| `PUT` | `/api/boards/:boardId/notes/:noteId` | 노트 수정 |
| `DELETE` | `/api/boards/:boardId/notes/:noteId` | 노트 삭제 |
| `PATCH` | `/api/boards/:boardId/notes/:noteId/move` | 노트 다른 보드로 이동 |

**태그**

| Method | Endpoint | 설명 |
|--------|---------|------|
| `GET` | `/api/tags` | 태그 목록 조회 (빈도순, 자동완성 지원) |

**링크 인박스**

| Method | Endpoint | 설명 |
|--------|---------|------|
| `POST` | `/api/pending-links` | 공유 링크 임시 저장 (서버에서 OG 스크래핑) |
| `GET` | `/api/pending-links` | 미처리 링크 목록 조회 (배지 count 포함) |
| `DELETE` | `/api/pending-links/:id` | 처리 완료 링크 제거 |

**미디어 업로드**

| Method | Endpoint | 설명 |
|--------|---------|------|
| `POST` | `/api/upload/image` | 이미지 업로드 (최대 10장) |
| `POST` | `/api/upload/video` | 영상 업로드 |
| `POST` | `/api/upload/file` | 파일 업로드 |

**유틸리티**

| Method | Endpoint | 설명 |
|--------|---------|------|
| `GET` | `/api/og` | OG 메타데이터 조회 (편집 중 URL 직접 입력 시 미리보기용) |

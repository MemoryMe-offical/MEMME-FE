# MEMME 프론트엔드 작업 명세서

> 최종 업데이트: 2026-04-12 | P0 ✅ P1 ✅ P2 ✅ P3 ⏳

---

## ⚡ 세션 인계 — 다음 작업자가 여기서부터 읽으세요

### 현재 상태 (2026-04-12 기준)

**P0 · P1 · P2 모두 완료. 다음 단계는 P3 (백엔드 API 연동).**

백엔드 준비가 완료되면 `src/services/` 내 `TODO(P3):` 주석 위치를 API 호출로 교체합니다.

---

### P2 완료 컴포넌트 목록

| 컴포넌트 / 파일 | 설명 |
|----------------|------|
| `src/types/index.ts` | 도메인 타입 정의 (Memo, Board, Note, PendingLink, TimelineItem) |
| `src/utils/storage.ts` | AsyncStorage CRUD, migrateFromV1() |
| `src/services/ogService.ts` | OG 스크래핑 (P3: GET /api/og?url=) |
| `src/services/pendingLinkService.ts` | 인박스 CRUD (P3: /api/pending-links) |
| `src/screens/SplashScreen.tsx` | migrateFromV1() 호출 |
| `src/screens/MainScreen.tsx` | 타임라인, 인박스 배지, 모든 바텀시트 연결 |
| `src/screens/BoardDetailScreen.tsx` | 보드 뷰/편집, 노트 목록 |
| `src/screens/NoteDetailScreen.tsx` | 노트 편집 (이미지·링크·파일 첨부, 변경사항 감지) |
| `src/navigation/RootNavigator.tsx` | 전체 스택 네비게이션 |
| `src/components/common/Badge.tsx` | 알림 배지 (count=0→숨김, 99+) |
| `src/components/common/TagInput.tsx` | 태그 칩 입력 (쉼표/엔터, suggestions, maxTags=10) |
| `src/components/common/BoardPickerBottomSheet.tsx` | 보드 선택 피커 (검색, 최근 수정순) |
| `src/components/common/ContextMenu.tsx` | 롱프레스 컨텍스트 메뉴 |
| `src/components/common/SideMenu.tsx` | 우측 슬라이드 사이드메뉴 (북마크) |
| `src/components/board/BoardCard.tsx` | 타임라인 보드 카드 (노트 아코디언) |
| `src/components/chat/ChatMessageItem.tsx` | 타임라인 메모 아이템 |
| `src/components/note/OgPreviewCard.tsx` | OG 링크 미리보기 카드 |
| `src/components/note/NoteCard.tsx` | 노트 목록 카드 (첨부 배지) |
| `src/components/memo/MemoConvertSheet.tsx` | 메모→보드 변환 바텀시트 (2단계) |
| `src/components/pendingLinks/PendingLinksBottomSheet.tsx` | 공유 링크 인박스 바텀시트 |

### MainScreen 연결 현황 (전체 완료)

| 상태값 | 연결 대상 | 상태 |
|--------|----------|------|
| `pendingLinks.length` | `<Badge />` | ✅ |
| `pendingSheetVisible`, `pendingLinks`, `recentBoards` | `<PendingLinksBottomSheet />` | ✅ |
| `convertSheetVisible`, `convertTargetMemo`, `recentBoards` | `<MemoConvertSheet />` | ✅ |

---

### 코드 컨벤션

- **스타일:** `StyleSheet.create()`, 키는 **kebab-case** (`styles['some-key']`)
- **스타일 파일 위치:** 별도 파일 있을 때 `src/styles/[ComponentName].styles.ts`, 없으면 인라인
- **색상:** primary `#588DFF` · accent `#FF9500` · 비활성 `#AABBCC` · 배경 `#F5F8FF`
- **P3 교체 지점:** 반드시 `// TODO(P3):` 주석으로 표시
- **커밋 규칙:** 동일 단위 작업은 하나의 커밋. 푸시 금지 (사용자 명시적 요청 시만)

---

## 하드코딩 전략 (P2 — API 연동 전)

모든 데이터 접근은 `src/services/` 아래의 서비스 함수를 통해 이루어집니다.
P3에서 서비스 함수 내부만 API 호출로 교체하면 화면 코드 변경 없이 전환 가능합니다.

```
src/services/
  pendingLinkService.ts  ← AsyncStorage (P3: /api/pending-links)
  ogService.ts           ← 직접 fetch (P3: GET /api/og?url=)
  tagService.ts          ← (미구현, P3: GET /api/tags)
```

`recentBoards`는 `MainScreen`의 `items` 상태에서 직접 계산합니다.
P3에서는 `GET /api/timeline?type=board&sort=updatedAt` 호출로 교체됩니다.

---

## P3 — 백엔드 API 연동

각 서비스 파일의 `TODO(P3):` 주석 위치를 API 호출로 교체합니다.
화면(Screen) 코드는 수정 불필요.

### 작업 16. `src/services/pendingLinkService.ts`

```typescript
// addPendingLink()    → POST   /api/pending-links
// loadPendingLinks()  → GET    /api/pending-links
// removePendingLink() → DELETE /api/pending-links/:id
```

### 작업 17. `src/services/ogService.ts`

```typescript
// fetchOgData(url)    → GET /api/og?url={url}
```

### 작업 18. `src/utils/storage.ts` → `src/services/timelineService.ts` (신규)

현재 `storage.ts`의 `loadItems` / `saveItems`를 서비스 레이어로 분리하고 API 교체합니다.

```typescript
// loadItems()         → GET    /api/timeline
// saveItem()          → POST   /api/memos  또는  POST /api/boards
// updateItem()        → PUT    /api/memos/:id  또는  PUT /api/boards/:id
// deleteItem()        → DELETE /api/memos/:id  또는  DELETE /api/boards/:id
// toggleBookmark()    → PATCH  /api/items/:id/bookmark
```

### 작업 19. 인증 연동

현재 `TEMP_USER_ID = '24'`로 하드코딩된 userId를 실제 로그인 유저 정보로 교체합니다.
`src/services/authApi.ts`, `src/utils/auth.ts` 이미 존재 — 연결 작업만 필요합니다.

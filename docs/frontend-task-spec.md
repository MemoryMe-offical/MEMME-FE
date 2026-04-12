# MEMME 프론트엔드 작업 명세서

> 최종 업데이트: 2026-04-12 | P0 ✅ P1 ✅ P2 🔄 P3 ⏳

---

## ⚡ 세션 인계 — 다음 작업자가 여기서부터 읽으세요

### 현재 상태 (2026-04-12 기준)

**완료된 작업**

| 작업 | 파일 | 비고 |
|------|------|------|
| 도메인 타입 재정의 | `src/types/index.ts` | Memo, Board, Note, PendingLink, TimelineItem |
| storage 마이그레이션 | `src/utils/storage.ts` | ITEMS_KEY='timeline_items', migrateFromV1() |
| 서비스 레이어 | `src/services/ogService.ts`, `pendingLinkService.ts` | AsyncStorage 구현, TODO(P3) 주석 삽입 |
| P1 전체 리팩터 | MainScreen, BoardDetailScreen(신규), RootNavigator, BoardCard(신규), 각 컴포넌트 | BoardPostDetailScreen 삭제, NoteDetailScreen stub |
| Badge 컴포넌트 | `src/components/common/Badge.tsx` | count=0→null, 99+, 절대좌표 오버레이 |
| TagInput 컴포넌트 | `src/components/common/TagInput.tsx` | 칩+×, 쉼표/엔터 추가, suggestions 드롭다운, maxTags=10 |
| OgPreviewCard 컴포넌트 | `src/components/note/OgPreviewCard.tsx` | OG 이미지·제목·설명 카드, onRemove 지원 |
| NoteCard 컴포넌트 | `src/components/note/NoteCard.tsx` | 이미지 수·링크·파일 배지, BoardDetailScreen에 연결 |
| NoteDetailScreen 전체 구현 | `src/screens/NoteDetailScreen.tsx` | stub → 완전 구현 |
| MemoConvertSheet | `src/components/memo/MemoConvertSheet.tsx` | 2단계 바텀시트, MainScreen에 연결 |
| BoardPickerBottomSheet | `src/components/common/BoardPickerBottomSheet.tsx` | 범용 보드 선택 피커 |

**연결 현황**
- `MainScreen.tsx` — `<Badge count={pendingLinks.length} />` 연결 완료
- `MainScreen.tsx` — `<MemoConvertSheet />` 연결 완료, "준비 중" Alert 제거
- `BoardDetailScreen.tsx` 편집모드 — `<TagInput />` 연결 완료
- `BoardDetailScreen.tsx` 뷰모드 노트목록 — `<NoteCard />` 연결 완료
- `NoteDetailScreen.tsx` — 전체 구현 완료 (이미지·링크·파일 첨부, 뒤로가기 변경사항 감지)
- `RootNavigator.tsx` — `NoteDetail` 파라미터에 `boardTitle?: string` 추가

**MainScreen에 아직 연결 안 된 상태값 (TODO 주석 있음)**
```typescript
// PendingLinksBottomSheet 구현 시 연결 예정
void recentBoards;

// line ~502
{/* TODO(P2): PendingLinksBottomSheet — pendingSheetVisible, pendingLinks, recentBoards 연결 */}
{pendingSheetVisible && null}
```

---

### 다음 작업: P2 #13 — PendingLinksBottomSheet 구현 및 MainScreen 연결

**만들어야 할 파일 1개:**

1. `src/components/pendingLinks/PendingLinksBottomSheet.tsx`

**완료 후 `MainScreen.tsx` 수정 필요:**
- `import PendingLinksBottomSheet from '../components/pendingLinks/PendingLinksBottomSheet';` 추가
- `void recentBoards;` 제거 (recentBoards가 실제로 사용됨)
- `{pendingSheetVisible && null}` → `<PendingLinksBottomSheet ... />` 교체
- `handleAddToBoard` (PendingLink → Board) 핸들러 추가: `pendingLinkService.removePendingLink(id)` 호출 후 `setItems`에 업데이트된 보드 반영
- `handleDismissLink` 핸들러 추가: `pendingLinkService.removePendingLink(id)` 호출 후 `setPendingLinks` 업데이트

**커밋 규칙:** 동일 단위 작업은 하나의 커밋으로 묶음. 푸시 금지 (사용자가 명시적으로 요청 시만).

---

### 코드 컨벤션 (필독)

- 스타일: `StyleSheet.create()`, 키는 **kebab-case** (`styles['some-key']`)
- 별도 스타일 파일 있을 때: `src/styles/[ComponentName].styles.ts`에 분리, 없으면 인라인 `StyleSheet.create`
- 색상: primary `#588DFF`, accent `#FF9500`, 비활성 `#AABBCC`, 배경 `#F5F8FF`
- P2 stub 패턴: JSX 내 미사용 상태 → `{state && null}`, 외부 → `void expr`
- P3 교체 지점 반드시 `// TODO(P3):` 주석으로 표시

---
- `src/components/common/ContextMenu.tsx` — `memo`/`board` 타입 교체
- `src/components/common/SideMenu.tsx` — TimelineItem/Board/Memo 타입 교체
- `src/components/chat/ChatMessageItem.tsx` — Memo 타입 적용
- `src/components/board/BoardPostItem.tsx` — Board 타입, description 적용
- `src/components/board/BoardPostBottomSheet.tsx` — Board 타입 적용
- `src/components/board/BoardPostEditModal.tsx` — Board 타입, description 적용
- `src/screens/SplashScreen.tsx` — migrateFromV1() 추가

---

## 하드코딩 전략 (API 연동 전)

> API가 없는 P2 단계에서 기능이 동작하도록 로컬로 처리하되,  
> **API 교체 지점을 명확히 격리**하여 P3에서 최소 수정으로 전환할 수 있게 합니다.

### 데이터 레이어 규칙

모든 데이터 접근은 `src/services/` 폴더 아래의 서비스 함수를 통해 이루어집니다.  
P2까지는 서비스 함수가 AsyncStorage를 쓰고, P3에서 API 호출로 교체합니다.

```
src/services/
  timelineService.ts   ← 타임라인 CRUD (P2: AsyncStorage / P3: API)
  pendingLinkService.ts ← 인박스 CRUD ✅ 구현 완료
  ogService.ts          ← OG 스크래핑 ✅ 구현 완료
  tagService.ts         ← 태그 목록 (P2: 로컬 계산 / P3: GET /api/tags)
```

### BoardPickerBottomSheet 데이터 소스 하드코딩 전략

P2에서는 `MainScreen`의 로컬 `items` 상태에서 보드를 필터링하여 props로 전달합니다.  
P3에서는 `GET /api/timeline?type=board&sort=updatedAt` 호출로 교체됩니다.

```typescript
// MainScreen.tsx (P2) — 구현 완료
// TODO(P3): getRecentBoards()를 API 호출로 교체 → GET /api/timeline?type=board&sort=updatedAt
const recentBoards = useMemo(
  () =>
    (items.filter(i => i.type === 'board') as Board[])
      .sort((a, b) => {
        const aTime = a.updatedAt ?? a.createdAt;
        const bTime = b.updatedAt ?? b.createdAt;
        return bTime.localeCompare(aTime);
      }),
  [items]
);
```

`recentBoards`는 `MemoConvertSheet`(연결 완료), `BoardPickerBottomSheet`, `PendingLinksBottomSheet` 모두에 props로 전달됩니다.

---

## P2 — 신규 화면·컴포넌트 개발

---

### 작업 10. `NoteDetailScreen` 전체 구현 ★ ✅ 완료

**파일:** `src/screens/NoteDetailScreen.tsx`

**구현 내용:**
- 헤더: ← 뒤로 | [보드 이름 = boardTitle prop] | 🗑 (기존 노트만) | 저장
- 제목(필수), 본문 입력
- 첨부 섹션: 이미지 복수 선택(`react-native-image-picker`), 링크(OG 스크래핑 후 OgPreviewCard 표시), 파일(`@react-native-documents/picker`)
- 뒤로가기 변경사항 감지 Alert (`navigation.addListener('beforeRemove')` — Android 하드웨어 백 + iOS 스와이프 공통)
- `boardTitle?: string` 파라미터가 `RootNavigator.tsx` `NoteDetail` 타입에 추가됨
- `BoardDetailScreen.tsx`에서 `board.title` 전달

**함께 구현된 컴포넌트:**

| 컴포넌트 | 파일 | 상태 |
|---------|------|------|
| `OgPreviewCard` | `src/components/note/OgPreviewCard.tsx` | ✅ 완료 |
| `NoteCard` | `src/components/note/NoteCard.tsx` | ✅ 완료, BoardDetailScreen 연결 완료 |

---

### 작업 11. `MemoConvertSheet` 신규 개발 ✅ 완료

**파일:** `src/components/memo/MemoConvertSheet.tsx`

**구현 내용:**
- Step 1 (목적지 선택): 새 보드 만들기 버튼 + 최근 보드 목록 + 보드 검색
- Step 2-A (새 보드): 보드 제목(필수)·태그(TagInput)·설명·첫 노트 이름(메모 텍스트 자동 채움)
- Step 2-B (기존 보드에 추가): 노트 이름(자동 채움)·내용(선택)
- visible 전환 시 모든 상태 자동 초기화
- Step 1에서만 오버레이 탭으로 닫기 가능
- `MainScreen.tsx`에 연결 완료 (`handleContextConvert` "준비 중" Alert 제거)

**MainScreen의 `handleMemoConvertSuccess` 수정 사항 (버그 수정):**
```typescript
// 기존 보드에 추가(Step 2-B) 시 제자리 업데이트, 신규 보드는 끝에 추가
const handleMemoConvertSuccess = (memoId: string, targetBoard: Board) => {
  setItems(prev => {
    const boardExistsInTimeline = prev.some(i => i.id === targetBoard.id);
    if (boardExistsInTimeline) {
      return prev
        .filter(i => i.id !== memoId)
        .map(i => i.id === targetBoard.id ? targetBoard : i);
    }
    return [...prev.filter(i => i.id !== memoId), targetBoard];
  });
  ...
};
```

---

### 작업 12. `BoardPickerBottomSheet` 신규 개발 ✅ 완료

**파일:** `src/components/common/BoardPickerBottomSheet.tsx`

**구현 내용:**
- 제목(title prop), 실시간 검색, 최근 수정순 정렬
- `excludeBoardId`로 특정 보드 제외 지원
- visible 전환 시 검색어 자동 초기화
- `TODO(P3)` 주석: boards prop → API 호출로 교체 지점 표시

```typescript
interface BoardPickerBottomSheetProps {
  visible: boolean;
  title: string;
  boards: Board[];             // TODO(P3): props 대신 내부에서 API 호출로 교체 가능
  excludeBoardId?: string;
  onSelect: (board: Board) => void;
  onClose: () => void;
}
```

**현재 미연결 상태** — `PendingLinksBottomSheet` (#13) 내부에서 사용 예정.

---

### 작업 13. `PendingLinksBottomSheet` 신규 개발 ⏳ 다음 작업

**파일:** `src/components/pendingLinks/PendingLinksBottomSheet.tsx`

```
┌─────────────────────────────────┐
│  새로 들어온 링크  (2)              │
├─────────────────────────────────┤
│  [OG 이미지]  example.com        │
│  Article Title                  │
│  2분 전              [추가] [무시]│
├─────────────────────────────────┤
│  [OG 이미지]  youtube.com        │
│  Video Title                    │
│  10분 전             [추가] [무시]│
└─────────────────────────────────┘
```

- **[추가]** → `BoardPickerBottomSheet` 열기 → 보드 선택 후 노트 저장 → pending 제거
- **[무시]** → 확인 없이 pending에서 제거

```typescript
interface PendingLinksBottomSheetProps {
  visible: boolean;
  pendingLinks: PendingLink[];
  boards: Board[];
  onAddToBoard: (pendingLink: PendingLink, targetBoard: Board) => void;
  onDismiss: (pendingLinkId: string) => void;
  onClose: () => void;
}
```

> 노트 제목은 `pendingLink.ogData?.title || new URL(pendingLink.url).hostname`으로 자동 설정합니다.
> 단, `URL.hostname`은 현재 tsconfig에서 타입 오류 발생 — 정규식으로 대체할 것:
> ```typescript
> const hostname = url.match(/^(?:https?:\/\/)?([^/?#]+)/)?.[1] ?? url;
> ```

**[추가] 버튼 클릭 시 내부 상태 흐름:**
```typescript
// PendingLinksBottomSheet 내부
const [pickerVisible, setPickerVisible] = useState(false);
const [activePendingLink, setActivePendingLink] = useState<PendingLink | null>(null);

const handleAddPress = (link: PendingLink) => {
  setActivePendingLink(link);
  setPickerVisible(true);
};

const handleBoardSelect = (board: Board) => {
  if (!activePendingLink) return;
  onAddToBoard(activePendingLink, board);
  setPickerVisible(false);
  setActivePendingLink(null);
};
```

**MainScreen에서 연결할 내용:**

```typescript
// 추가할 핸들러
const handlePendingLinkAddToBoard = (link: PendingLink, board: Board) => {
  const newNote: Note = {
    id: `note_${Date.now()}`,
    title: link.ogData?.title || link.url.match(/^(?:https?:\/\/)?([^/?#]+)/)?.[1] || link.url,
    url: link.url,
    ogData: link.ogData,
  };
  const updatedBoard: Board = {
    ...board,
    notes: [...(board.notes ?? []), newNote],
    updatedAt: new Date().toISOString(),
  };
  setItems(prev => prev.map(i => i.id === board.id ? updatedBoard : i));
  pendingLinkService.removePendingLink(link.id);
  setPendingLinks(prev => prev.filter(l => l.id !== link.id));
};

const handlePendingLinkDismiss = (linkId: string) => {
  pendingLinkService.removePendingLink(linkId);
  setPendingLinks(prev => prev.filter(l => l.id !== linkId));
};
```

```typescript
// 렌더 교체 (line ~501)
// BEFORE:
{/* TODO(P2): PendingLinksBottomSheet — pendingSheetVisible, pendingLinks, recentBoards 연결 */}
{pendingSheetVisible && null}

// AFTER:
<PendingLinksBottomSheet
  visible={pendingSheetVisible}
  pendingLinks={pendingLinks}
  boards={recentBoards}
  onAddToBoard={handlePendingLinkAddToBoard}
  onDismiss={handlePendingLinkDismiss}
  onClose={() => setPendingSheetVisible(false)}
/>
```

그리고 `void recentBoards;` 라인 제거.

**OgPreviewCard 재사용:** PendingLinksBottomSheet에서 각 링크 아이템에 `OgPreviewCard`를 사용할 수 있습니다 (onRemove prop 없이).

---

## P3 — 백엔드 API 연동

P2 완료 후 진행합니다. `src/services/` 내 `TODO(P3)` 주석 위치만 교체하면 됩니다.

---

### 작업 16. `src/services/timelineService.ts` API 교체

```typescript
// TODO(P3) 교체 목록
// loadItems()         → GET /api/timeline
// saveMemo()          → POST /api/memos
// deleteMemo()        → DELETE /api/memos/:id
// toggleBookmark()    → PATCH /api/memos/:id/bookmark  or  PATCH /api/boards/:id/bookmark
// saveBoard()         → POST /api/boards
// updateBoard()       → PUT /api/boards/:id
// deleteBoard()       → DELETE /api/boards/:id
```

---

### 작업 17. `src/services/pendingLinkService.ts` API 교체

```typescript
// TODO(P3) 교체 목록
// addPendingLink()    → POST /api/pending-links
// loadPendingLinks()  → GET /api/pending-links
// removePendingLink() → DELETE /api/pending-links/:id
```

---

### 작업 18. `src/services/ogService.ts` API 교체

```typescript
// TODO(P3) 교체 목록
// fetchOgData(url)    → GET /api/og?url={url}
```

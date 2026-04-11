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

**연결 현황**
- `MainScreen.tsx` — `<Badge count={pendingLinks.length} />` 연결 완료
- `BoardDetailScreen.tsx` 편집모드 — `<TagInput tags={editTags} onChange={setEditTags} />` 연결 완료
- `BoardDetailScreen.tsx` 뷰모드 노트목록 — **`// TODO(P2): NoteCard 컴포넌트로 교체`** (인라인 TouchableOpacity, line ~249)
- `NoteDetailScreen.tsx` — stub ("노트 화면 준비 중입니다."), **전체 구현 필요**

---

### 다음 작업: P2 #10 — NoteDetailScreen 전체 구현 (+ OgPreviewCard + NoteCard)

**이 작업에서 만들어야 할 파일 3개:**

1. `src/components/note/OgPreviewCard.tsx` — OG 미리보기 카드 (공용)
2. `src/components/note/NoteCard.tsx` — BoardDetailScreen 노트 목록 카드
3. `src/screens/NoteDetailScreen.tsx` — 노트 편집/뷰 전체 화면 (현재 stub 교체)

**완료 후 이어서 할 작업 (P2 나머지):**

| 번호 | 파일 | 설명 |
|------|------|------|
| #11 | `src/components/memo/MemoConvertSheet.tsx` | 메모→보드 2단계 변환 바텀시트 |
| #12 | `src/components/common/BoardPickerBottomSheet.tsx` | 보드 선택 범용 피커 |
| #13 | `src/components/pendingLinks/PendingLinksBottomSheet.tsx` | 인박스 링크 목록 |

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
// MainScreen.tsx (P2) — 이미 구현됨
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

`recentBoards`는 `MemoConvertSheet`, `BoardPickerBottomSheet`, `PendingLinksBottomSheet` 모두에 props로 전달됩니다.

---

## P2 — 신규 화면·컴포넌트 개발

---

### 작업 10. `NoteDetailScreen` 전체 구현 ★

**파일:** `src/screens/NoteDetailScreen.tsx`  
**현재 상태:** stub ("노트 화면 준비 중입니다." 표시만)

노트 1개의 전용 편집·뷰 화면입니다. 기존 `BoardDetailScreen` 내 인라인 편집을 대체합니다.

#### 화면 구성

```
┌──────────────────────────────────────┐
│ ← 뒤로   [보드 이름]          [저장]   │  ← 헤더
├──────────────────────────────────────┤
│ [노트 제목 입력]   ← 필수, 빈값 저장 불가 │
│                                      │
│ [본문 입력...]                         │
│                                      │
│ ─── 첨부 ──────────────────────────── │
│ [이미지 1] [이미지 2] [+ 추가]          │
│ 🔗 링크: example.com  [× 삭제]        │
│ 📄 기획서.pdf          [× 삭제]        │
└──────────────────────────────────────┘
```

#### 주요 로직

- **신규 노트 (`isNew: true`):** 저장 시 `onSave(note)` 콜백 → `BoardDetailScreen`에서 `board.notes`에 append
- **기존 노트 편집:** 저장 시 `onSave(updatedNote)` 콜백
- **삭제:** `Alert` 확인 후 `onDelete(noteId)` 콜백
- **노트 제목 필수 검증:**

```typescript
const handleSave = () => {
  if (!editTitle.trim()) {
    Alert.alert('알림', '노트 이름을 입력해주세요.');
    return;
  }
  // ... 저장 진행
};
```

- **이미지 추가:** `launchImageLibrary` (`react-native-image-picker`)
- **링크 추가:** URL 입력 → `ogService.fetchOgData` → `OgPreviewCard` 표시
- **뒤로가기 시 변경사항 있으면 확인 Alert**

#### Props / Navigation Params

```typescript
// RootNavigator에서 NoteDetail 파라미터로 전달
{
  note: Note | null;      // null = 신규 작성
  boardId: string;
  isNew?: boolean;
  onSave: (note: Note) => void;
  onDelete?: (noteId: string) => void;
}
```

#### 함께 구현할 컴포넌트

| 컴포넌트 | 파일 |
|---------|------|
| `OgPreviewCard` | `src/components/note/OgPreviewCard.tsx` (공용 추출) |
| `NoteCard` | `src/components/note/NoteCard.tsx` (BoardDetailScreen 노트 목록용) |

---

### 작업 11. `MemoConvertSheet` 신규 개발

**파일:** `src/components/memo/MemoConvertSheet.tsx`

메모를 보드로 변환할 때 나타나는 2단계 Bottom Sheet입니다.

#### Step 1: 목적지 선택

```
┌─────────────────────────────────┐
│  보드로 변환                        │
│                                 │
│  [ + 새 보드 만들기 ]              │
│                                 │
│  최근 보드                         │
│  ├ 수학교육 과동아리   5분 전        │
│  ├ 스터디 그룹         어제         │
│  └ 여행 계획           3일 전       │
│                                 │
│  🔍 보드 검색...                   │
└─────────────────────────────────┘
```

#### Step 2-A: 새 보드 만들기

```
┌─────────────────────────────────┐
│  새 보드 만들기                      │
│                                 │
│  보드 제목  [____________]        │  ← 필수
│  태그      <TagInput />           │
│  설명      [____________]        │  ← 선택
│  ─────────────────────────────  │
│  첫 번째 노트 이름                   │
│  [코딩 공부하기]   ← 메모 텍스트 자동 채워짐, 수정 가능
│                                 │
│           [ 보드 만들기 ]          │
└─────────────────────────────────┘
```

#### Step 2-B: 기존 보드에 추가

```
┌─────────────────────────────────┐
│  ← [스터디 그룹]에 추가             │
│                                 │
│  노트 이름  [코딩 공부하기]          │  ← 자동 채워짐, 수정 가능
│  내용       [____________]       │  ← 선택
│                                 │
│           [ 추가 ]                │
└─────────────────────────────────┘
```

#### 저장 성공 흐름 (롤백 포함)

```typescript
const handleNewBoardSave = async (boardTitle: string, tags: string[], description: string, noteTitle: string) => {
  if (!boardTitle.trim()) { Alert.alert('보드 제목을 입력하세요.'); return; }
  if (!noteTitle.trim()) { Alert.alert('노트 이름을 입력하세요.'); return; }

  try {
    const newBoard: Board = {
      id: Date.now().toString(),
      userId: memo.userId,
      type: 'board',
      title: boardTitle.trim(),
      description: description.trim() || undefined,
      tags,
      notes: [{
        id: `note_${Date.now()}`,
        title: noteTitle.trim(),
        content: '',
      }],
      bookMark: false,
      createdAt: new Date().toISOString(),
    };

    onSuccess(memo.id, newBoard);

  } catch (e) {
    Alert.alert('오류', '변환 중 문제가 발생했습니다. 다시 시도해주세요.');
  }
};
```

#### Props

```typescript
interface MemoConvertSheetProps {
  visible: boolean;
  memo: Memo;
  recentBoards: Board[];
  onSuccess: (memoId: string, newBoard: Board) => void;
  onClose: () => void;
}
```

---

### 작업 12. `BoardPickerBottomSheet` 신규 개발

**파일:** `src/components/common/BoardPickerBottomSheet.tsx`

보드를 선택하는 범용 피커입니다.  
`MemoConvertSheet`(기존 보드 선택)와 노트 이동(`NoteDetailScreen`) 두 곳에서 재사용합니다.

```
┌─────────────────────────────────────┐
│  {title}                              │  ← props
│  ┌───────────────────────────────┐  │
│  │ 🔍 보드 검색...                 │  │  ← filter(board.title.includes(q))
│  └───────────────────────────────┘  │
│  최근 수정순                          │
│  ├ 수학교육 과동아리    5분 전         │
│  ├ 스터디 그룹          어제          │
│  └ 여행 계획            3일 전        │
└─────────────────────────────────────┘
```

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

---

### 작업 13. `PendingLinksBottomSheet` 신규 개발

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

---

### 작업 14. `Badge` 컴포넌트 신규 개발

**파일:** `src/components/common/Badge.tsx`

```typescript
interface BadgeProps {
  count: number;
}

// count가 0이면 null 반환 (렌더링 안 함)
// count가 99 초과이면 "99+" 표시
```

인박스 아이콘 우상단에 절대좌표로 오버레이합니다.

---

### 작업 15. `TagInput` 컴포넌트 신규 개발

**파일:** `src/components/common/TagInput.tsx`

`BoardDetailScreen` 편집 모드와 `MemoConvertSheet` Step 2-A에서 공통 사용합니다.

```
[#동아리] [×] [#학교] [×] [+ 태그 추가]
```

```typescript
interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;     // 기본값 10
  suggestions?: string[]; // TODO(P3): GET /api/tags 결과로 교체
}
```

- 기존 태그 칩 표시 + X 버튼으로 제거
- 텍스트 입력 시 `suggestions` 기반 드롭다운 표시
- P2: `suggestions`는 `items`에서 모든 보드의 태그를 flat하게 모아서 전달
- 최대 10개 초과 시 입력창 비활성화

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

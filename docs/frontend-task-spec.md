# MEMME 프론트엔드 작업 명세서

> 작성 기준: 서비스 도메인 재설계 (메모·보드·노트) 반영 + 설계 이슈 해소  
> 최종 업데이트: 2026-04-11

---

## 작업 우선순위

| 단계 | 성격 | 내용 |
|------|------|------|
| **P0** | 기반 | 타입 재정의. 이후 모든 작업의 전제 조건 |
| **P1** | 리팩터 | 기존 코드를 새 타입에 맞게 수정 |
| **P2** | 신규 기능 | 새로 만들어야 하는 화면·컴포넌트 |
| **P3** | API 연동 | 백엔드 연동 (로컬 → 서버). P0~P2 완료 후 진행 |

---

## 하드코딩 전략 (API 연동 전)

> API가 없는 P0~P2 단계에서 기능이 동작하도록 로컬로 처리하되,  
> **API 교체 지점을 명확히 격리**하여 P3에서 최소 수정으로 전환할 수 있게 합니다.

### 데이터 레이어 규칙

모든 데이터 접근은 `src/services/` 폴더 아래의 서비스 함수를 통해 이루어집니다.  
P2까지는 서비스 함수가 AsyncStorage를 쓰고, P3에서 API 호출로 교체합니다.

```
src/services/
  timelineService.ts   ← 타임라인 CRUD (P2: AsyncStorage / P3: API)
  pendingLinkService.ts ← 인박스 CRUD (P2: AsyncStorage / P3: API)
  ogService.ts          ← OG 스크래핑 (P2: 직접 fetch / P3: GET /api/og)
  tagService.ts         ← 태그 목록 (P2: 로컬 계산 / P3: GET /api/tags)
```

각 서비스 파일 내부 구조 예시 (`pendingLinkService.ts`):

```typescript
// ─── P2: 로컬 구현 ───────────────────────────────────────
// TODO(P3): 아래 함수들을 API 호출로 교체
// POST /api/pending-links, GET /api/pending-links, DELETE /api/pending-links/:id

const PENDING_KEY = 'pending_links';

export const addPendingLink = async (link: Omit<PendingLink, 'id'>): Promise<PendingLink> => {
  const stored = await loadPendingLinks();
  const newLink: PendingLink = { ...link, id: Date.now().toString() };
  await AsyncStorage.setItem(PENDING_KEY, JSON.stringify([...stored, newLink]));
  return newLink;
};

export const loadPendingLinks = async (): Promise<PendingLink[]> => {
  const json = await AsyncStorage.getItem(PENDING_KEY);
  return json ? JSON.parse(json) : [];
};

export const removePendingLink = async (id: string): Promise<void> => {
  const stored = await loadPendingLinks();
  await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(stored.filter(l => l.id !== id)));
};
```

### OG 스크래핑 하드코딩 전략

P2에서는 `ogService.ts`가 직접 fetch → HTML 파싱을 담당합니다.  
P3에서는 `GET /api/og?url=...` 호출 한 줄로 교체됩니다.

```typescript
// src/services/ogService.ts

// TODO(P3): 아래 함수를 GET /api/og?url={url} 호출로 교체
export const fetchOgData = async (url: string): Promise<OgData> => {
  try {
    const res = await fetch(url);
    const html = await res.text();
    // ... 기존 파싱 로직 유지
  } catch {
    return { title: url };
  }
};
```

> 이 함수는 현재 `MainScreen.tsx`와 `BoardPostDetailScreen.tsx` 두 곳에 중복 정의되어 있습니다.  
> `ogService.ts`로 **단일화**하고 두 화면에서 import합니다.

### BoardPickerBottomSheet 데이터 소스 하드코딩 전략

P2에서는 `MainScreen`의 로컬 `items` 상태에서 보드를 필터링하여 props로 전달합니다.  
P3에서는 `GET /api/timeline?type=board&sort=updatedAt` 호출로 교체됩니다.

```typescript
// MainScreen.tsx (P2)
// TODO(P3): getRecentBoards()를 API 호출로 교체 → GET /api/timeline?type=board&sort=updatedAt
const recentBoards = useMemo(
  () =>
    (items.filter(i => i.type === 'board') as Board[])
      .sort((a, b) => {
        const aTime = a.updatedAt ?? a.createdAt;
        const bTime = b.updatedAt ?? b.createdAt;
        return bTime.localeCompare(aTime);  // 최근 수정순
      }),
  [items]
);
```

`recentBoards`는 `MemoConvertSheet`, `BoardPickerBottomSheet`, `PendingLinksBottomSheet` 모두에 props로 전달됩니다.

---

## P0 — 타입 시스템 재정의

### 작업 1. `src/types/` 재구성

**삭제:** `src/types/chatBoard.type.ts`  
**신규:** `src/types/index.ts`

#### 변경 전 → 변경 후 대응표

| 변경 전 | 변경 후 | 비고 |
|--------|--------|------|
| `MessageType = 'chat' \| 'post'` | `TimelineItemType = 'memo' \| 'board'` | |
| `BaseItem` | `BaseItem` | 내용 동일 |
| `ChatMessage` | `Memo` | `type: 'memo'`, `text` 필드 유지 |
| `BoardPost` | `Board` | 구조 대폭 변경 (아래 상세) |
| `SubPostItem` | `Note` | 미디어 필드 추가 |
| `ChatBoardItem` | `TimelineItem` | `Memo \| Board` union |
| `OgData` | `OgData` | 변경 없음 |
| (없음) | `FileAttachment` | 신규 |
| (없음) | `PendingLink` | 신규 |

#### 완성된 타입 정의

```typescript
// src/types/index.ts

export type TimelineItemType = 'memo' | 'board';

export interface BaseItem {
  id: string;
  userId: string;
  type: TimelineItemType;
  createdAt: string;
  bookMark: boolean;
}

// ── 메모 ────────────────────────────────────
export interface Memo extends BaseItem {
  type: 'memo';
  text: string;
}

// ── 보드 ────────────────────────────────────
export interface Board extends BaseItem {
  type: 'board';
  title: string;
  description?: string;   // 이 보드가 무엇을 담는지 설명
  tags?: string[];
  notes?: Note[];
  updatedAt?: string;
  // imageUris, url, ogData 없음 — 모든 미디어는 Note에 귀속
}

// ── 노트 (보드에 속하는 콘텐츠 단위) ──────────
export interface Note {
  id: string;
  title: string;          // 필수. 빈 문자열 불가
  content?: string;
  imageUris?: string[];
  videoUris?: string[];
  files?: FileAttachment[];
  url?: string;
  ogData?: OgData;
}

// ── 첨부 파일 ────────────────────────────────
export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;           // bytes
}

// ── OG 미리보기 ─────────────────────────────
export interface OgData {
  title: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
}

// ── 링크 인박스 임시 항목 ─────────────────────
export interface PendingLink {
  id: string;
  userId: string;
  url: string;
  ogData?: OgData;
  receivedAt: string;
}

// ── 타임라인 유니온 ─────────────────────────
export type TimelineItem = Memo | Board;
```

---

## P1 — 기존 코드 리팩터링

---

### 작업 2. `src/utils/storage.ts` 수정

**변경 내용:**
- 타입 import: `ChatBoardItem` → `TimelineItem`
- AsyncStorage 키: `'chat_board_items'` → `'timeline_items'`
- 마이그레이션 함수 추가 (앱 업데이트 후 최초 실행 시 자동 실행)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimelineItem, Board, Note } from '../types';

const ITEMS_KEY = 'timeline_items';
const V1_KEY = 'chat_board_items';

export const loadItems = async (): Promise<TimelineItem[] | null> => {
  const json = await AsyncStorage.getItem(ITEMS_KEY);
  if (!json) return null;
  return JSON.parse(json) as TimelineItem[];
};

export const saveItems = async (items: TimelineItem[]): Promise<void> => {
  await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
};

/**
 * V1 데이터(chat/post 타입)를 V2(memo/board/note)로 마이그레이션.
 * 최초 1회만 실행 (V1 키 존재 여부로 판단).
 */
export const migrateFromV1 = async (): Promise<void> => {
  const oldJson = await AsyncStorage.getItem(V1_KEY);
  if (!oldJson) return;  // V1 데이터 없으면 건너뜀

  const oldItems: any[] = JSON.parse(oldJson);
  const newItems: TimelineItem[] = oldItems.map(item => {
    // ── chat → memo ───────────────────────────
    if (item.type === 'chat') {
      return {
        id: item.id,
        userId: item.userId,
        type: 'memo' as const,
        text: item.text,
        bookMark: item.bookMark,
        createdAt: item.createdAt,
      };
    }

    // ── post → board ──────────────────────────
    const existingNotes: Note[] = (item.subItems ?? []).map((sub: any) => ({
      id: sub.id,
      title: sub.title,
      content: sub.content,
      imageUris: sub.imageUris,
      url: sub.url,
      ogData: sub.ogData,
    }));

    // Board에 직접 붙어있던 미디어를 별도 노트로 이관
    if (item.url) {
      // URL 노트: OG title 또는 URL 도메인을 제목으로
      const noteTitle = item.ogData?.title || (() => {
        try { return new URL(item.url).hostname; } catch { return item.url; }
      })();
      existingNotes.push({
        id: `migrated_url_${item.id}`,
        title: noteTitle,
        content: item.ogData?.description,
        url: item.url,
        ogData: item.ogData,
      });
    }
    if (item.imageUris?.length) {
      // 이미지 노트: "이미지 (날짜)"를 제목으로
      const dateStr = new Date(item.createdAt).toLocaleDateString('ko-KR');
      existingNotes.push({
        id: `migrated_img_${item.id}`,
        title: `이미지 (${dateStr})`,
        imageUris: item.imageUris,
      });
    }

    const board: Board = {
      id: item.id,
      userId: item.userId,
      type: 'board' as const,
      title: item.title,
      description: item.content || undefined,
      tags: item.tags,
      notes: existingNotes.length > 0 ? existingNotes : undefined,
      bookMark: item.bookMark,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
    return board;
  });

  await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(newItems));
  await AsyncStorage.removeItem(V1_KEY);  // V1 키 제거
};
```

> `migrateFromV1`은 `SplashScreen` 또는 앱 초기화 로직에서 `loadItems` 호출 **이전에** 실행합니다.

---

### 작업 3. `src/screens/MainScreen.tsx` 수정

수정량이 가장 많은 파일입니다.

#### 3-1. 삭제: `fetchOgData` 인라인 함수
`src/services/ogService.ts`로 이동했으므로 MainScreen 내 중복 정의를 제거합니다.

#### 3-2. 삭제: `LinkPreviewItem` 인라인 컴포넌트
`Board`는 더 이상 `url` 필드를 갖지 않으므로, 이 컴포넌트는 **완전히 제거**합니다.  
링크 미리보기는 `NoteDetailScreen` 안에서 노트 단위로만 표시됩니다.

#### 3-3. import 및 타입 수정
```
ChatBoardItem → TimelineItem
ChatMessage   → Memo
BoardPost     → Board
```

#### 3-4. initItems 목데이터 수정
- `type: 'chat'` → `type: 'memo'`
- `type: 'post'` → `type: 'board'`
- `content: ''` → `description: ''` 또는 제거
- `subItems: [...]` → `notes: [...]`
- Board 최상위에서 `url`, `ogData`, `imageUris` 제거 → Note 안으로 이동

#### 3-5. `handleSharedUrl` 변경

```typescript
// TODO(P3): addPendingLink를 pendingLinkService.addPendingLink + API 호출로 교체
const handleSharedUrl = async (url: string) => {
  const ogData = await fetchOgData(url);  // ogService에서 import
  const link = await pendingLinkService.addPendingLink({
    userId: TEMP_USER_ID,
    url,
    ogData,
    receivedAt: new Date().toISOString(),
  });
  setPendingLinks(prev => [...prev, link]);
};
```

#### 3-6. `handleContextConvert` 변경 — 메모→보드 (핵심)

```typescript
const handleContextConvert = () => {
  if (!contextMenuItem) return;

  if (contextMenuItem.type === 'memo') {
    // 보드 변환: MemoConvertSheet 열기
    setConvertTargetMemo(contextMenuItem as Memo);
    setConvertSheetVisible(true);
    return;
  }

  if (contextMenuItem.type === 'board') {
    const board = contextMenuItem as Board;
    const noteCount = board.notes?.length ?? 0;
    const warningMsg = noteCount > 0
      ? `이 보드 안의 노트 ${noteCount}개가 모두 삭제됩니다. 메모로 변환하시겠습니까?`
      : '메모로 변환하시겠습니까?';

    Alert.alert('메모로 변환', warningMsg, [
      { text: '취소', style: 'cancel' },
      {
        text: '변환',
        style: 'destructive',
        onPress: () => {
          const newMemo: Memo = {
            id: board.id,
            userId: board.userId,
            type: 'memo',
            bookMark: board.bookMark,
            text: board.title,
            createdAt: board.createdAt,
          };
          setItems(prev => prev.map(i => i.id === board.id ? newMemo : i));
        },
      },
    ]);
  }
};
```

> 보드 → 메모 변환 시 노트(이미지·파일 포함) **전체 삭제**를 Alert로 명시하여 경고합니다.

#### 3-7. 메모 변환 완료 핸들러 (MemoConvertSheet onSuccess)

```typescript
// 변환 성공 후 원본 메모 삭제 — 모든 단계 완료 후에만 실행
const handleMemoConvertSuccess = (memoId: string, newBoard: Board) => {
  setItems(prev => [
    ...prev.filter(i => i.id !== memoId),  // 원본 메모 제거
    newBoard,                               // 새 보드 추가
  ]);
  setConvertSheetVisible(false);
  setConvertTargetMemo(null);
};

// 취소 시: memo는 그대로 유지 (아무것도 변경하지 않음)
const handleMemoConvertCancel = () => {
  setConvertSheetVisible(false);
  setConvertTargetMemo(null);
};
```

#### 3-8. 렌더링 조건 수정

```typescript
// 변경 전
if (item.type === 'chat') → ChatMessageItem
if (item.url) → LinkPreviewItem  // 삭제
else → BoardPostCard

// 변경 후
if (item.type === 'memo') → MemoItem
if (item.type === 'board') → BoardCard
```

#### 3-9. recentBoards 파생 상태 추가

```typescript
// TODO(P3): GET /api/timeline?type=board&sort=updatedAt 로 교체
const recentBoards = useMemo(
  () =>
    (items.filter(i => i.type === 'board') as Board[]).sort((a, b) => {
      const aTime = a.updatedAt ?? a.createdAt;
      const bTime = b.updatedAt ?? b.createdAt;
      return bTime.localeCompare(aTime);
    }),
  [items]
);
```

#### 3-10. 헤더 PendingLinks 배지 추가

```typescript
// 상태 추가
const [pendingLinks, setPendingLinks] = useState<PendingLink[]>([]);

// 초기 로드
useEffect(() => {
  pendingLinkService.loadPendingLinks().then(setPendingLinks);
}, []);

// 헤더 렌더링
<TouchableOpacity onPress={() => setPendingSheetVisible(true)}>
  <InboxIcon color="#1A1A1A" size={20} />
  <Badge count={pendingLinks.length} />
</TouchableOpacity>
```

---

### 작업 4. `src/screens/BoardPostDetailScreen.tsx` 축소 및 분리

**기존 역할:** 보드 메타 + 노트 인라인 편집 모두 처리  
**변경 후 역할:** 보드 메타(제목·설명·태그) 편집 + 노트 목록 표시만 담당. 노트 편집은 `NoteDetailScreen`으로 이관.

**파일명 변경:** `BoardPostDetailScreen.tsx` → `BoardDetailScreen.tsx`

#### 4-1. import 및 타입 수정
```
BoardPost   → Board
SubPostItem → Note
```

#### 4-2. 편집 상태 필드 수정
```
editContent  → editDescription
editSubItems → editNotes (뷰에서만 사용, 편집은 NoteDetailScreen)
```

#### 4-3. Board 편집 UI — 미디어 섹션 전면 제거
- `editImageUris`, `editUrl`, `editOgData`, 관련 UI 전부 제거
- Board 편집 모드: 제목, 설명, 태그(`TagInput`)만 표시

#### 4-4. 노트 목록 표시
- `board.notes`를 `NoteCard` 컴포넌트로 렌더링
- 각 `NoteCard` 탭 시 `NoteDetailScreen`으로 이동

#### 4-5. 노트 추가 버튼
- "+" 버튼 탭 → `NoteDetailScreen`으로 이동 (빈 노트, `isNew: true`)

#### 4-6. 빈 보드 상태 (Empty State)
- `board.notes`가 없거나 빈 배열일 때 표시:

```
┌─────────────────────────────────┐
│                                 │
│      아직 노트가 없어요.             │
│   + 노트 추가 버튼을 눌러보세요.      │
│                                 │
└─────────────────────────────────┘
```

#### 4-7. 제거할 인라인 컴포넌트 (NoteDetailScreen으로 이관)
아래 컴포넌트들은 현재 `BoardPostDetailScreen` 내부에 인라인으로 정의되어 있습니다.  
**`NoteDetailScreen` 개발 시 그곳으로 이동**하고 이 파일에서는 삭제합니다:

| 인라인 컴포넌트 | 이동 대상 |
|--------------|---------|
| `OgPreviewCard` | `src/components/note/OgPreviewCard.tsx` (공용 추출) |
| `LinkCard` | `NoteDetailScreen` 내부 |
| `SubItemLinkEditor` | `NoteDetailScreen` 내부 (NoteLink Editor로 개명) |
| `ImageEditRow` | `NoteDetailScreen` 내부 |
| `fetchOgData` | `src/services/ogService.ts` (이미 이관, import로 대체) |

#### 4-8. handleSave 수정

```typescript
const updated: Board = {
  ...board,
  title: editTitle.trim(),
  description: editDescription.trim() || undefined,
  tags: editTags,
  updatedAt: new Date().toISOString(),
  // notes는 변경하지 않음 (NoteDetailScreen에서 개별 관리)
};
```

---

### 작업 5. `src/components/common/ContextMenu.tsx` 수정

```typescript
// 변경 전
itemType: 'chat' | 'post'
convertLabel = itemType === 'chat' ? '게시물로 변환' : '채팅으로 변환'
copyLabel   = itemType === 'chat' ? '내용 복사' : '제목 복사'

// 변경 후
itemType: 'memo' | 'board'
convertLabel = itemType === 'memo' ? '보드로 변환' : '메모로 변환'
copyLabel    = itemType === 'memo' ? '내용 복사' : '제목 복사'
```

---

### 작업 6. `src/components/board/BoardPostCard.tsx` → `BoardCard.tsx`

**파일명 변경:** `BoardPostCard.tsx` → `BoardCard.tsx`  
**스타일 파일:** `BoardPostCard.styles.ts` → `BoardCard.styles.ts`

#### 변경 내용

- `BoardPost` → `Board` 타입
- `item.subItems` → `item.notes`
- `item.content` → `item.description`
- **제거:** Board 카드 상단의 `url`, `imageUris` 렌더링 로직 (Board는 미디어 없음)
- **추가:** 태그 칩 목록 표시 (`item.tags`)
- **추가:** 빈 노트 상태 처리

```typescript
// 노트 목록 미리보기 (최대 3개)
{board.notes && board.notes.length > 0 ? (
  board.notes.slice(0, 3).map(note => (
    <Text key={note.id} numberOfLines={1}>{note.title}</Text>
  ))
) : (
  <Text style={styles.emptyNotesText}>노트 없음</Text>
)}
```

---

### 작업 7. `src/components/common/SideMenu.tsx` 수정

- `ChatBoardItem` → `TimelineItem`
- `BoardPost` → `Board`
- `ChatMessage` → `Memo`
- 북마크 조건: `item.type === 'chat'` → `item.type === 'memo'`
- **스타일 파일:** `SideMenu.styles.ts` — 타입명 참조 없으므로 변경 불필요

---

### 작업 8. `src/navigation/RootNavigator.tsx` 수정

```typescript
// 변경 전
BoardPostDetail: {
  post: BoardPost;
  subItemId?: string;
  onSave?: (updated: BoardPost) => void;
  startEditing?: boolean;
};

// 변경 후
BoardDetail: {
  board: Board;
  noteId?: string;
  onSave?: (updated: Board) => void;
  startEditing?: boolean;
};

// 신규 추가
NoteDetail: {
  note: Note | null;    // null이면 신규 노트 생성 모드
  boardId: string;
  isNew?: boolean;
  onSave?: (note: Note) => void;
  onDelete?: (noteId: string) => void;
};
```

- `BoardPostDetailScreen` import → `BoardDetailScreen`으로 교체
- `NoteDetailScreen` 신규 등록

---

### 작업 9. 기타 컴포넌트 타입·스타일 수정

| 파일 | 수정 내용 | 스타일 파일 |
|------|---------|-----------|
| `board/BoardPostItem.tsx` | `BoardPost` → `Board`, `content` → `description` | `BoardPostItem.styles.ts` — 내용 검토 후 수정 |
| `board/BoardPostBottomSheet.tsx` | `BoardPost` → `Board` | `BoardPostBottomSheet.styles.ts` — 내용 검토 후 수정 |
| `board/BoardPostEditModal.tsx` | `BoardPost` → `Board`, 미디어 섹션 제거 | `BoardPostEditModal.styles.ts` — 미디어 관련 스타일 제거 |

---

## P2 — 신규 화면·컴포넌트 개발

---

### 작업 10. `NoteDetailScreen` 신규 개발 ★

**파일:** `src/screens/NoteDetailScreen.tsx`

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

#### 이관할 인라인 컴포넌트 목록

`BoardPostDetailScreen`에서 아래 컴포넌트들을 이 파일로 이동합니다:

| 기존 이름 | 새 위치 | 비고 |
|---------|--------|------|
| `OgPreviewCard` | `src/components/note/OgPreviewCard.tsx` | 별도 파일로 추출 (공용) |
| `LinkCard` | `NoteDetailScreen` 내부 | 뷰 모드용 |
| `SubItemLinkEditor` | `NoteDetailScreen` 내부 → `NoteLinkEditor`로 개명 |
| `ImageEditRow` | `NoteDetailScreen` 내부 → `NoteImageEditor`로 개명 |

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
// 새 보드 만들기 성공 핸들러
const handleNewBoardSave = async (boardTitle: string, tags: string[], description: string, noteTitle: string) => {
  if (!boardTitle.trim()) { Alert.alert('보드 제목을 입력하세요.'); return; }
  if (!noteTitle.trim()) { Alert.alert('노트 이름을 입력하세요.'); return; }

  try {
    // Step 1: 보드 생성
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

    // Step 2 + 3: 성공 시에만 onSuccess 호출 → MainScreen에서 메모 삭제
    onSuccess(memo.id, newBoard);

  } catch (e) {
    // 실패 시 아무것도 변경하지 않음 (메모 유지)
    Alert.alert('오류', '변환 중 문제가 발생했습니다. 다시 시도해주세요.');
  }
};
```

#### Props

```typescript
interface MemoConvertSheetProps {
  visible: boolean;
  memo: Memo;
  recentBoards: Board[];      // MainScreen의 recentBoards 파생 상태
  onSuccess: (memoId: string, newBoard: Board) => void;  // 완전 성공 시만 호출
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
  excludeBoardId?: string;     // 이 ID는 목록에서 제외 (노트 이동 시 현재 보드)
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
  boards: Board[];             // recentBoards from MainScreen
  onAddToBoard: (pendingLink: PendingLink, targetBoard: Board) => void;
  onDismiss: (pendingLinkId: string) => void;
  onClose: () => void;
}
```

> 노트 제목은 `pendingLink.ogData?.title || new URL(pendingLink.url).hostname`으로 자동 설정합니다.  
> 사용자가 직접 지정하고 싶다면 추가 입력 단계를 넣어도 되지만, 빠른 처리를 위해 자동 설정 후 저장 권장.

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

### 작업 16. `NoteCard` 컴포넌트 신규 개발

**파일:** `src/components/note/NoteCard.tsx`

`BoardDetailScreen` 노트 목록에서 사용하는 뷰 전용 카드입니다.  
탭 시 `NoteDetailScreen`으로 이동합니다.

```
┌─────────────────────────────┐
│ 여름 MT                  ··· │  ← ···: 다른 보드로 이동 / 삭제
│ MT 추가요금 공지             │  ← content 2줄 미리보기
│ [이미지 썸네일 x2]            │  ← 이미지 있을 때만
│ 🔗 kakao.com               │  ← 링크 있을 때만 도메인 표시
│ 📄 기획서.pdf               │  ← 파일 있을 때만
└─────────────────────────────┘
```

```typescript
interface NoteCardProps {
  note: Note;
  onPress: (note: Note) => void;          // → NoteDetailScreen
  onMoveToBoard: (note: Note) => void;    // → BoardPickerBottomSheet
  onDelete: (noteId: string) => void;
}
```

#### `OgPreviewCard` 공용 컴포넌트 분리

`BoardDetailScreen` 내 `OgPreviewCard`를 별도 파일로 추출합니다.

**파일:** `src/components/note/OgPreviewCard.tsx`

`NoteCard`(뷰)와 `NoteDetailScreen`(편집) 두 곳에서 import합니다.

---

## P3 — 백엔드 API 연동

P0~P2 완료 후 진행합니다. `src/services/` 내 `TODO(P3)` 주석 위치만 교체하면 됩니다.

---

### 작업 17. `src/services/timelineService.ts` API 교체

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

### 작업 18. `src/services/pendingLinkService.ts` API 교체

```typescript
// TODO(P3) 교체 목록
// addPendingLink()    → POST /api/pending-links
// loadPendingLinks()  → GET /api/pending-links
// removePendingLink() → DELETE /api/pending-links/:id
```

---

### 작업 19. `src/services/ogService.ts` API 교체

```typescript
// TODO(P3) 교체 목록
// fetchOgData(url)    → GET /api/og?url={url}
```

---

### 작업 20. `NoteDetailScreen` 미디어 업로드 API 연동

```typescript
// TODO(P3) 교체 목록
// 로컬 file:// URI  →  POST /api/upload/image → 원격 URL
// 로컬 file:// URI  →  POST /api/upload/video → 원격 URL
// 로컬 file:// URI  →  POST /api/upload/file  → FileAttachment 객체
```

---

### 작업 21. `TagInput` 자동완성 API 연동

```typescript
// TODO(P3) 교체 목록
// 로컬 태그 집합  →  GET /api/tags?userId=&q= (입력값 기반 prefix 검색)
```

---

## 작업 전체 체크리스트

### P0 — 타입

- [ ] `src/types/index.ts` 생성 (Memo, Board, Note, FileAttachment, PendingLink, TimelineItem, OgData)
- [ ] `src/types/chatBoard.type.ts` 삭제

### P1 — 리팩터 + 서비스 레이어

- [ ] `src/services/timelineService.ts` 생성 (AsyncStorage 기반)
- [ ] `src/services/pendingLinkService.ts` 생성 (AsyncStorage 기반)
- [ ] `src/services/ogService.ts` 생성 (`fetchOgData` 단일화)
- [ ] `src/services/tagService.ts` 생성 (로컬 태그 집합 계산)
- [ ] `src/utils/storage.ts` — 키 변경, 마이그레이션 함수 추가
- [ ] `src/screens/MainScreen.tsx` — 전체 수정 (3-1 ~ 3-10)
- [ ] `src/screens/BoardPostDetailScreen.tsx` → `BoardDetailScreen.tsx` (4-1 ~ 4-8)
- [ ] `src/navigation/RootNavigator.tsx` — 화면명·파라미터·NoteDetail 등록
- [ ] `src/components/common/ContextMenu.tsx` — 타입값 수정
- [ ] `src/components/common/SideMenu.tsx` — 타입 교체
- [ ] `src/components/board/BoardPostCard.tsx` → `BoardCard.tsx`
- [ ] `src/styles/BoardPostCard.styles.ts` → `BoardCard.styles.ts`
- [ ] `src/components/board/BoardPostItem.tsx` — 타입 교체
- [ ] `src/styles/BoardPostItem.styles.ts` — 내용 검토
- [ ] `src/components/board/BoardPostBottomSheet.tsx` — 타입 교체
- [ ] `src/styles/BoardPostBottomSheet.styles.ts` — 내용 검토
- [ ] `src/components/board/BoardPostEditModal.tsx` — 타입 교체, 미디어 섹션 제거
- [ ] `src/styles/BoardPostEditModal.styles.ts` — 미디어 관련 스타일 제거

### P2 — 신규 개발

- [ ] `src/screens/NoteDetailScreen.tsx` — 노트 편집 전용 화면 (★ 핵심)
- [ ] `src/components/note/OgPreviewCard.tsx` — 기존 인라인 컴포넌트 추출
- [ ] `src/components/note/NoteCard.tsx` — 뷰 카드
- [ ] `src/components/memo/MemoConvertSheet.tsx` — 2단계 Bottom Sheet
- [ ] `src/components/common/BoardPickerBottomSheet.tsx` — 보드 선택 피커
- [ ] `src/components/pendingLinks/PendingLinksBottomSheet.tsx` — 링크 인박스
- [ ] `src/components/common/Badge.tsx` — 숫자 배지
- [ ] `src/components/common/TagInput.tsx` — 태그 입력·자동완성

### P3 — API 연동

- [ ] `src/services/timelineService.ts` — API 교체
- [ ] `src/services/pendingLinkService.ts` — API 교체
- [ ] `src/services/ogService.ts` — API 교체
- [ ] `src/services/tagService.ts` — API 교체
- [ ] `NoteDetailScreen` — 미디어 업로드 API 연동

---

## 파일 변경 전체 요약

| 구분 | 파일 |
|------|------|
| **삭제** | `src/types/chatBoard.type.ts` |
| **삭제** | `src/screens/BoardPostDetailScreen.tsx` |
| **신규** | `src/types/index.ts` |
| **신규** | `src/services/timelineService.ts` |
| **신규** | `src/services/pendingLinkService.ts` |
| **신규** | `src/services/ogService.ts` |
| **신규** | `src/services/tagService.ts` |
| **신규** | `src/screens/BoardDetailScreen.tsx` |
| **신규** | `src/screens/NoteDetailScreen.tsx` |
| **신규** | `src/components/note/OgPreviewCard.tsx` |
| **신규** | `src/components/note/NoteCard.tsx` |
| **신규** | `src/components/memo/MemoConvertSheet.tsx` |
| **신규** | `src/components/common/BoardPickerBottomSheet.tsx` |
| **신규** | `src/components/pendingLinks/PendingLinksBottomSheet.tsx` |
| **신규** | `src/components/common/Badge.tsx` |
| **신규** | `src/components/common/TagInput.tsx` |
| **수정** | `src/utils/storage.ts` |
| **수정** | `src/utils/api.ts` |
| **수정** | `src/screens/MainScreen.tsx` |
| **수정** | `src/navigation/RootNavigator.tsx` |
| **수정** | `src/components/common/ContextMenu.tsx` |
| **수정** | `src/components/common/SideMenu.tsx` |
| **수정** | `src/components/board/BoardPostCard.tsx` (→ BoardCard) |
| **수정** | `src/styles/BoardPostCard.styles.ts` (→ BoardCard.styles) |
| **수정** | `src/components/board/BoardPostItem.tsx` |
| **수정** | `src/styles/BoardPostItem.styles.ts` |
| **수정** | `src/components/board/BoardPostBottomSheet.tsx` |
| **수정** | `src/styles/BoardPostBottomSheet.styles.ts` |
| **수정** | `src/components/board/BoardPostEditModal.tsx` |
| **수정** | `src/styles/BoardPostEditModal.styles.ts` |

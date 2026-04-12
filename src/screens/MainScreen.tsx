import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  AppState,
  NativeModules,
  StatusBar,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Board, Memo, PendingLink, TimelineItem } from '../types';
import ChatMessageItem from '../components/chat/ChatMessageItem';
import BoardCard from '../components/board/BoardCard';
import ContextMenu from '../components/common/ContextMenu';
import SideMenu from '../components/common/SideMenu';
import { HamburgerIcon, PlusIcon, SearchIcon, SendIcon } from '../components/common/Icons';
import Badge from '../components/common/Badge';
import MemoConvertSheet from '../components/memo/MemoConvertSheet';
import PendingLinksBottomSheet from '../components/pendingLinks/PendingLinksBottomSheet';
import { mainStyles as styles } from '../styles/MainScreen.styles';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { loadItems, saveItems } from '../utils/storage';
import { fetchOgData } from '../services/ogService';
import * as pendingLinkService from '../services/pendingLinkService';

const TEMP_USER_ID = '24';

const initItems: TimelineItem[] = [
  {
    id: '1',
    userId: TEMP_USER_ID,
    type: 'memo',
    bookMark: false,
    text: '코딩 공부하기',
    createdAt: new Date(2026, 1, 25, 9, 15, 0).toISOString(),
  },
  {
    id: '2',
    userId: TEMP_USER_ID,
    type: 'board',
    bookMark: true,
    title: '수학교육 과동아리',
    notes: [
      { id: '2-1', title: '여름 MT', content: '🏕 MT 추가요금 공지\nMT 정산 과정에서 비용 변동으로 1인당 추가요금 4,115원이 발생했습니다.\n번거롭겠지만 아래 계좌로 추가 입금 부탁드립니다...' },
      { id: '2-2', title: '수학 모임', content: '이번 주 수학 모임은 화요일 오후 6시 도서관 2층에서 진행됩니다.' },
      { id: '2-3', title: '잼얘즈', content: '잼있는 얘기들 공유하는 채널입니다. 자유롭게 올려주세요!' },
    ],
    createdAt: new Date(2026, 1, 25, 10, 0, 0).toISOString(),
  },
  {
    id: '3',
    userId: TEMP_USER_ID,
    type: 'memo',
    bookMark: false,
    text: '리액트 네이티브 강의 수강하기!',
    createdAt: new Date(2026, 1, 25, 11, 30, 0).toISOString(),
  },
  {
    id: '4',
    userId: TEMP_USER_ID,
    type: 'memo',
    bookMark: false,
    text: '결혼식 2월 31일 오후 12시',
    createdAt: new Date(2026, 1, 25, 12, 47, 0).toISOString(),
  },
  {
    id: '5',
    userId: TEMP_USER_ID,
    type: 'board',
    bookMark: false,
    title: '운동 루틴 메모',
    description: '월·수·금: 헬스장 하체 위주\n화·목: 홈트 30분 + 스트레칭\n주말: 한강 자전거 or 등산',
    createdAt: new Date(2026, 1, 25, 14, 20, 0).toISOString(),
  },
  {
    id: '6',
    userId: TEMP_USER_ID,
    type: 'memo',
    bookMark: false,
    text: '엄마 생신 선물 사기',
    createdAt: new Date(2026, 1, 25, 16, 5, 0).toISOString(),
  },
  {
    id: '7',
    userId: TEMP_USER_ID,
    type: 'memo',
    bookMark: true,
    text: '치과 예약: 3월 2일 오후 2시',
    createdAt: new Date(2026, 1, 25, 17, 30, 0).toISOString(),
  },
  {
    id: '8',
    userId: TEMP_USER_ID,
    type: 'board',
    bookMark: false,
    title: '독서 목록',
    tags: ['독서', '자기계발'],
    notes: [
      { id: '8-1', title: '원씽', content: '한 가지에 집중하는 삶에 대한 이야기' },
      { id: '8-2', title: '아주 작은 습관의 힘', content: '1% 향상의 복리 효과' },
      { id: '8-3', title: '도둑맞은 집중력', content: '현대 사회에서 집중력을 되찾는 방법' },
    ],
    createdAt: new Date(2026, 1, 25, 18, 45, 0).toISOString(),
  },
  {
    id: '9',
    userId: TEMP_USER_ID,
    type: 'memo',
    bookMark: false,
    text: '주말에 친구랑 영화 보기 약속!',
    createdAt: new Date(2026, 1, 26, 9, 0, 0).toISOString(),
  },
  {
    id: '10',
    userId: TEMP_USER_ID,
    type: 'board',
    bookMark: false,
    title: '스터디 그룹',
    tags: ['스터디'],
    notes: [
      { id: '10-1', title: '스터디 일정', content: '매주 수요일 오후 7시 카페에서 진행합니다.' },
      { id: '10-2', title: '회비 납부 안내', content: '3월 회비 납부 기한은 이번 주 금요일까지입니다. 계좌번호는 채팅으로 별도 안내드립니다.' },
      { id: '10-3', title: '신입 부원 모집', content: '4월 신입 부원 모집을 시작합니다. 관심 있는 친구들에게 홍보 부탁드려요!' },
      { id: '10-4', title: '종강 파티 투표', content: '종강 파티 날짜 투표 링크를 공유합니다. 24일까지 참여해 주세요.' },
    ],
    createdAt: new Date(2026, 1, 26, 15, 0, 0).toISOString(),
  },
];

const MainScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Main'>>();
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [contextMenuItem, setContextMenuItem] = useState<TimelineItem | null>(null);
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [androidKeyboardHeight, setAndroidKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList<TimelineItem>>(null);
  const shouldScrollToEnd = useRef(false);

  // 인박스 (공유된 링크 임시 저장)
  const [pendingLinks, setPendingLinks] = useState<PendingLink[]>([]);
  const [pendingSheetVisible, setPendingSheetVisible] = useState(false); // TODO(P2): PendingLinksBottomSheet 연결

  // 메모→보드 변환 시트
  const [convertSheetVisible, setConvertSheetVisible] = useState(false); // TODO(P2): MemoConvertSheet 연결
  const [convertTargetMemo, setConvertTargetMemo] = useState<Memo | null>(null);

  // TODO(P3): GET /api/timeline?type=board&sort=updatedAt 로 교체
  const recentBoards = useMemo(
    () =>
      (items.filter(i => i.type === 'board') as Board[]).sort((a, b) => {
        const aTime = a.updatedAt ?? a.createdAt;
        const bTime = b.updatedAt ?? b.createdAt;
        return bTime.localeCompare(aTime);
      }),
    [items],
  );

  const nativeShareModule =
    Platform.OS === 'ios'
      ? NativeModules.SharedDefaultsModule
      : NativeModules.SharedIntentModule;

  // TODO(P3): addPendingLink를 pendingLinkService + API 호출로 교체
  const handleSharedUrl = async (url: string) => {
    const ogData = await fetchOgData(url);
    const link = await pendingLinkService.addPendingLink({
      userId: TEMP_USER_ID,
      url,
      ogData,
      receivedAt: new Date().toISOString(),
    });
    setPendingLinks(prev => [...prev, link]);
  };

  useEffect(() => {
    loadItems().then(stored => {
      setItems(stored ?? initItems);
      setLoaded(true);
    });
    pendingLinkService.loadPendingLinks().then(setPendingLinks);
  }, []);

  useEffect(() => {
    if (loaded) saveItems(items);
  }, [items, loaded]);

  useEffect(() => {
    const getShared = async () => {
      const url = await nativeShareModule?.getSharedURL();
      if (typeof url === 'string' && url.startsWith('http')) {
        await handleSharedUrl(url);
        await nativeShareModule?.clearSharedURL();
      }
    };

    getShared();

    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') getShared();
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardVisible(true);
      if (Platform.OS === 'android') setAndroidKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
      if (Platform.OS === 'android') setAndroidKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleContextMenu = (item: TimelineItem) => setContextMenuItem(item);
  const handleCloseContextMenu = () => setContextMenuItem(null);

  const handleContextCopy = () => {
    if (!contextMenuItem) return;
    const text =
      contextMenuItem.type === 'memo'
        ? contextMenuItem.text
        : contextMenuItem.title;
    Alert.alert('복사됨', text);
  };

  const handleContextBookmark = () => {
    if (!contextMenuItem) return;
    setItems(prev =>
      prev.map(item =>
        item.id === contextMenuItem.id
          ? { ...item, bookMark: !item.bookMark }
          : item,
      ),
    );
  };

  const handleContextConvert = () => {
    if (!contextMenuItem) return;

    if (contextMenuItem.type === 'memo') {
      setConvertTargetMemo(contextMenuItem as Memo);
      handleCloseContextMenu();
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

  // 메모→보드 변환 성공 (MemoConvertSheet onSuccess)
  // targetBoard가 기존 보드면 제자리 업데이트, 신규 보드면 타임라인 끝에 추가
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
    setConvertSheetVisible(false);
    setConvertTargetMemo(null);
  };

  const handleMemoConvertCancel = () => {
    setConvertSheetVisible(false);
    setConvertTargetMemo(null);
  };

  const handleContextDelete = () => {
    if (!contextMenuItem) return;
    const id = contextMenuItem.id;
    Alert.alert('삭제', '정말 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => setItems(prev => prev.filter(item => item.id !== id)),
      },
    ]);
  };

  const handleDetailPress = (board: Board, noteId?: string) => {
    navigation.navigate('BoardDetail', {
      board,
      noteId,
      onSave: (updated: Board) => {
        setItems(prev => prev.map(item => item.id === updated.id ? updated : item));
      },
    });
  };

  const handleBookmarkPress = (item: TimelineItem) => {
    if (item.type === 'board') {
      navigation.navigate('BoardDetail', {
        board: item as Board,
        onSave: (updated: Board) => {
          setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
        },
      });
    } else {
      const index = items.findIndex(i => i.id === item.id);
      if (index !== -1) {
        flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      }
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newItem: Memo = {
      id: Date.now().toString(),
      userId: TEMP_USER_ID,
      type: 'memo',
      bookMark: false,
      text: inputText.trim(),
      createdAt: new Date().toISOString(),
    };
    shouldScrollToEnd.current = true;
    setItems(prev => [...prev, newItem]);
    setInputText('');
  };

  const handlePendingLinkAddToBoard = (link: PendingLink, board: Board) => {
    const newNote = {
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

  return (
    <SafeAreaView style={styles['main-safeArea']} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF3FF" />

      <View style={styles['main-header']}>
        <TouchableOpacity style={styles['main-header-profileButton']}>
          <Image
            source={require('../assets/imgs/mainart.png')}
            style={styles['main-header-profileButton-image']}
          />
        </TouchableOpacity>

        <Text style={styles['main-header-title']}>나와의 채팅</Text>

        <View style={styles['main-header-rightButtons']}>
          <TouchableOpacity style={styles['main-header-iconButton']}>
            <SearchIcon color="#1A1A1A" size={20} />
          </TouchableOpacity>

          {/* 인박스 아이콘 */}
          <TouchableOpacity
            style={styles['main-header-iconButton']}
            onPress={() => setPendingSheetVisible(true)}>
            <PlusIcon color="#1A1A1A" size={20} />
            <Badge count={pendingLinks.length} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles['main-header-iconButton']}
            onPress={() => setSideMenuVisible(true)}>
            <HamburgerIcon color="#1A1A1A" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={[styles['main-body'], Platform.OS === 'android' && { marginBottom: androidKeyboardHeight > 0 ? androidKeyboardHeight + insets.bottom : 0 }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles['main-content']}>
          <View style={styles['main-watermark']} pointerEvents="none">
            <Image
              source={require('../assets/imgs/mainlogo.png')}
              style={styles['main-watermark-image']}
            />
          </View>

          <FlatList<TimelineItem>
            ref={flatListRef}
            data={items}
            keyExtractor={item => item.id}
            contentContainerStyle={styles['main-listContent']}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              if (shouldScrollToEnd.current) {
                shouldScrollToEnd.current = false;
                flatListRef.current?.scrollToEnd({ animated: false });
              }
            }}
            renderItem={({ item }) => {
              if (item.type === 'memo') {
                return (
                  <ChatMessageItem
                    item={item as Memo}
                    onLongPress={handleContextMenu}
                  />
                );
              }

              return (
                <BoardCard
                  item={item as Board}
                  onContextMenu={handleContextMenu}
                  onDetailPress={handleDetailPress}
                  onPress={handleDetailPress}
                />
              );
            }}
          />
        </View>

        <View
          style={[
            styles['main-inputBar'],
            { paddingBottom: keyboardVisible ? 8 : Math.max(insets.bottom, 8) },
          ]}
        >
          <TouchableOpacity style={styles['main-inputBar-plusButton']}>
            <PlusIcon color="#000000" size={22} />
          </TouchableOpacity>

          <TextInput
            style={styles['main-inputBar-input']}
            value={inputText}
            onChangeText={setInputText}
            placeholder="나를 기억하고 기록하는 공간"
            placeholderTextColor="#AABBCC"
            multiline
          />

          <TouchableOpacity
            style={styles['main-inputBar-sendButton']}
            onPress={handleSend}
          >
            <SendIcon color="#FFFFFF" size={17} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <SideMenu
        visible={sideMenuVisible}
        items={items}
        onClose={() => setSideMenuVisible(false)}
        onSettings={() => {}}
        onBookmarkPress={handleBookmarkPress}
      />

      <ContextMenu
        visible={contextMenuItem !== null}
        itemType={contextMenuItem?.type ?? 'memo'}
        isBookmarked={contextMenuItem?.bookMark ?? false}
        onCopy={handleContextCopy}
        onBookmark={handleContextBookmark}
        onConvert={handleContextConvert}
        onDelete={handleContextDelete}
        onClose={handleCloseContextMenu}
      />

      <PendingLinksBottomSheet
        visible={pendingSheetVisible}
        pendingLinks={pendingLinks}
        boards={recentBoards}
        onAddToBoard={handlePendingLinkAddToBoard}
        onDismiss={handlePendingLinkDismiss}
        onClose={() => setPendingSheetVisible(false)}
      />

      {convertTargetMemo && (
        <MemoConvertSheet
          visible={convertSheetVisible}
          memo={convertTargetMemo}
          recentBoards={recentBoards}
          onSuccess={handleMemoConvertSuccess}
          onClose={handleMemoConvertCancel}
        />
      )}
    </SafeAreaView>
  );
};

export default MainScreen;

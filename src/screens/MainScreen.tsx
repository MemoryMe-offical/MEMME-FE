import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  AppState,
  NativeModules,
  StatusBar,
  Keyboard,
  BackHandler,
  Modal,
  ScrollView,
  Clipboard,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { useAlert } from '../context/AlertContext';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Board, Memo, PendingLink, TimelineItem } from '../types';
import ChatMessageItem from '../components/chat/ChatMessageItem';
import ChatInputBar from '../components/chat/ChatInputBar';
import BoardCard from '../components/board/BoardCard';
import ContextMenu from '../components/common/ContextMenu';
import SideMenu from '../components/common/SideMenu';
import { HamburgerIcon, PlusIcon, SearchIcon, ArrowLeftIcon, ViewIcon } from '../components/common/Icons';
import Badge from '../components/common/Badge';
import MemoConvertSheet from '../components/memo/MemoConvertSheet';
import PendingLinksBottomSheet from '../components/pendingLinks/PendingLinksBottomSheet';
import MediaPickerSheet from '../components/chat/MediaPickerSheet';
import ImageViewerModal from '../components/common/ImageViewerModal';
import { createMemoWithImage, createMemoWithVideo, createMemoWithFile } from '../services/uploadService';
import { mainStyles as styles } from '../styles/MainScreen.styles';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { fetchOgData } from '../services/ogService';
import { getHourMinute } from '../utils/date';
import { showToastNotification } from '../utils/toastHelper';
import * as pendingLinkService from '../services/pendingLinkService';
import * as timelineService from '../services/timelineService';
import * as memoService from '../services/memoService';
import * as boardService from '../services/boardService';
import * as noteService from '../services/noteService';
import * as searchService from '../services/searchService';

const MainScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Main'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Main'>>();
  const { showAlert, showConfirm } = useAlert();
  const [userId, setUserId] = useState<string>('');
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [expandedMemoId, setExpandedMemoId] = useState<string | null>(null);
  const [contextMenuItem, setContextMenuItem] = useState<TimelineItem | null>(null);
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [watermarkFrame, setWatermarkFrame] = useState<{ width: number; height: number } | null>(null);
  const flatListRef = useRef<FlatList<TimelineItem>>(null);
  const shouldScrollToEnd = useRef(false);
  const scrollRetryTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hasShownPendingLinksToastRef = useRef(false);

  const clearScrollRetryTimers = useCallback(() => {
    scrollRetryTimers.current.forEach(timer => clearTimeout(timer));
    scrollRetryTimers.current = [];
  }, []);

  const scrollToLatest = useCallback((animated = false) => {
    clearScrollRetryTimers();

    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated });
    });

    if (Platform.OS === 'ios') {
      return;
    }

    [80, 180, 360, 600].forEach(delay => {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      }, delay);
      scrollRetryTimers.current.push(timer);
    });
  }, [clearScrollRetryTimers]);

  const scrollToLatestIfNeeded = useCallback(() => {
    if (!shouldScrollToEnd.current) return;

    shouldScrollToEnd.current = false;
    if (Platform.OS === 'ios') return;

    scrollToLatest(false);
  }, [scrollToLatest]);

  useEffect(() => clearScrollRetryTimers, [clearScrollRetryTimers]);

  // 링크 감지 관련 state
  const [detectedLink, setDetectedLink] = useState<string | null>(null);
  const [linkDetectionModalVisible, setLinkDetectionModalVisible] = useState(false);
  const [linkOgData, setLinkOgData] = useState<any>(null);
  const [isFetchingOg, setIsFetchingOg] = useState(false);
  const [showNewBoardFormInLinkModal, setShowNewBoardFormInLinkModal] = useState(false);
  const [newBoardNameInLinkModal, setNewBoardNameInLinkModal] = useState('');
  const [isCreatingBoardInLinkModal, setIsCreatingBoardInLinkModal] = useState(false);

  // 로그인한 사용자 ID 로드
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        setUserId(id || '');
      } catch {
        // console.error('Failed to load userId:', error);
      }
    };
    loadUserId();
  }, []);

  // 인박스 (공유된 링크 임시 저장)
  const [pendingLinks, setPendingLinks] = useState<PendingLink[]>([]);
  const [pendingSheetVisible, setPendingSheetVisible] = useState(false); // TODO(P2): PendingLinksBottomSheet 연결

  // 메모→보드 변환 시트
  const [convertSheetVisible, setConvertSheetVisible] = useState(false); // TODO(P2): MemoConvertSheet 연결
  const [convertTargetMemo, setConvertTargetMemo] = useState<Memo | null>(null);

  // 미디어 피커
  const [mediaPickerVisible, setMediaPickerVisible] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // 이미지 뷰어
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [allImageUris, setAllImageUris] = useState<string[]>([]);

  // 검색 & 필터
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterBookmarkOnly, setFilterBookmarkOnly] = useState(false);

  // 검색 필터
  type SearchFieldFilter = 'memoTextOnly' | 'board' | 'note' | 'tag' | 'photo' | 'video' | 'file';
  const [searchFieldFilters, setSearchFieldFilters] = useState<Set<SearchFieldFilter>>(new Set());
  const [isSearchFilterVisible, setIsSearchFilterVisible] = useState(false);

  // 검색 API 관련 state
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<searchService.SearchItem[]>([]);
  const [nextSearchCursor, setNextSearchCursor] = useState<string | null>(null);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [recentBoards, setRecentBoards] = useState<Board[]>([]);

  // 보드 & 노트 펼치기/접기 상태 관리
  const [boardExpandStates, setBoardExpandStates] = useState<Record<string, boolean>>({});
  const [noteExpandStates, setNoteExpandStates] = useState<Record<string, boolean>>({});
  const [allBoardsExpanded, setAllBoardsExpanded] = useState(true);
  const [expandInitialSettings, setExpandInitialSettings] = useState({
    boardExpandMode: 'all' as 'all' | 'none',
    noteExpandMode: 'none' as 'none' | 'first' | 'all',
  });
  const [expandModalVisible, setExpandModalVisible] = useState(false);

  // 초기 설정 로드
  useEffect(() => {
    const loadExpandSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('expandInitialSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setExpandInitialSettings(settings);
        }
      } catch {
        // console.error('Failed to load expand settings:', error);
      }
    };
    loadExpandSettings();
  }, []);

  // 보드 목록 로드 (시간이 걸릴 수 있으므로 loadTimeline 이후에 시도)
  useEffect(() => {
    if (!loaded) return;

    const loadRecentBoards = async () => {
      try {
        const response = await timelineService.fetchTimeline({
          type: 'board',
          sort: 'updatedAt',
          limit: 5,
        });
        setRecentBoards(response.items as Board[]);
      } catch {
        // console.error('Failed to load recent boards:', error);
        const boards = (items.filter(i => i.type === 'board') as Board[]).slice(0, 5);
        setRecentBoards(boards);
      }
    };

    loadRecentBoards();
  }, [loaded, items]);

  // 저장소 사용량 계산 (GB 단위)
  const storageUsed = useMemo(() => {
    let totalBytes = 0;

    items.forEach(item => {
      if (item.type === 'board') {
        const board = item as Board;
        (board.notes ?? []).forEach(note => {
          // 이미지 크기 합산 (각 이미지 약 2MB로 추정)
          totalBytes += (note.imageUris?.length ?? 0) * (2 * 1024 * 1024);
          // 비디오 크기 합산 (실제 파일 크기 사용)
          (note.videos ?? []).forEach(video => {
            totalBytes += video.size ?? 0;
          });
          // 파일 크기 합산
          (note.files ?? []).forEach(file => {
            totalBytes += file.size ?? 0;
          });
        });
      }
    });

    return totalBytes / (1024 * 1024 * 1024); // GB로 변환
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = items;

    // 필터가 선택되어 있으면 항상 적용 (검색 모드 여부 상관없음)
    if (searchFieldFilters.size > 0) {
      result = result.filter(item => {
        for (const filter of searchFieldFilters) {
          // 타입 필터
          if (filter === 'memoTextOnly') {
            if (item.type === 'memo') {
              const memo = item as Memo;
              // 미디어가 없는 순수 텍스트 메모만
              if (!memo.imageUris?.length && !memo.videos?.length && !memo.files?.length) {
                return true;
              }
            }
          }
          if (filter === 'board' && item.type === 'board') return true;
          if (filter === 'note' && item.type === 'board') {
            // 노트는 보드 내에 있으므로 보드를 표시
            return true;
          }

          // 미디어/태그 필터
          if (filter === 'tag') {
            if (item.type === 'board' && ((item as Board).tags?.length ?? 0) > 0) return true;
          }

          if (filter === 'photo') {
            if (item.type === 'memo' && ((item as Memo).imageUris?.length ?? 0) > 0) return true;
            if (item.type === 'board') {
              const board = item as Board;
              if (board.notes?.some(n => (n.imageUris?.length ?? 0) > 0)) return true;
            }
          }

          if (filter === 'video') {
            if (item.type === 'memo' && ((item as Memo).videos?.length ?? 0) > 0) return true;
            if (item.type === 'board') {
              const board = item as Board;
              if (board.notes?.some(n => (n.videos?.length ?? 0) > 0)) return true;
            }
          }

          if (filter === 'file') {
            if (item.type === 'memo' && ((item as Memo).files?.length ?? 0) > 0) return true;
            if (item.type === 'board') {
              const board = item as Board;
              if (board.notes?.some(n => (n.files?.length ?? 0) > 0)) return true;
            }
          }
        }
        return false;
      });
    }

    // 검색 모드이고 필터가 없을 때는 API 검색 결과로 필터링
    if (isSearchMode && searchResults.length > 0 && searchFieldFilters.size === 0) {
      const searchUids = new Set(searchResults.map(r => r.uid));
      result = result.filter(i => searchUids.has(i.id));
      return result;
    }

    // 북마크 필터
    if (filterBookmarkOnly) {
      result = result.filter(i => i.bookmarked);
    }

    return result;
  }, [items, isSearchMode, searchResults, searchFieldFilters, filterBookmarkOnly]);

  const timelineItems = useMemo(() => [...filteredItems].reverse(), [filteredItems]);

  // 검색 함수 (디바운싱 적용)
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setNextSearchCursor(null);
      setSearchHasMore(false);
      return;
    }

    try {
      setIsLoadingSearch(true);
      const response = await searchService.search(query, undefined, 20);
      setSearchResults(response.items);
      setNextSearchCursor(response.nextCursor);
      setSearchHasMore(response.hasNext);
    } catch {
      // console.error('Search error:', error);
      showAlert({ title: '검색 오류', message: '검색 중 오류가 발생했습니다.', type: 'error' });
      setSearchResults([]);
      setNextSearchCursor(null);
      setSearchHasMore(false);
    } finally {
      setIsLoadingSearch(false);
    }
  }, [showAlert]);

  // 검색 텍스트 변경 시 디바운싱
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchText);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText, performSearch]);

  const nativeShareModule =
    Platform.OS === 'ios'
      ? NativeModules.SharedDefaultsModule
      : NativeModules.SharedIntentModule;

  const handleSharedUrl = async (url: string) => {
    if (!userId) return;

    try {
      const ogData = await fetchOgData(url);
      const link = await pendingLinkService.addPendingLink({
        userId,
        url,
        ogData,
        receivedAt: new Date().toISOString(),
      });

      const linkWithOgData = { ...link, ogData };
      setPendingLinks(prev => [...prev, linkWithOgData]);
      showToastNotification({
        message: '새로운 링크가 추가되었습니다',
        onAlert: msg => showAlert({ message: msg }),
      });
    } catch {
      // console.error('Failed to handle shared URL:', error);
    }
  };

  const loadTimeline = useCallback(async () => {
    try {
      const response = await timelineService.fetchTimeline({
        sort: 'createdAt',
        limit: 50,
      });
      if (response.items.length > 0 && !route.params?.scrollToItemId) {
        shouldScrollToEnd.current = true;
      }
      setItems(response.items);
    } catch {
      // console.error('Failed to load timeline:', error);
      setItems([]);
    } finally {
      setLoaded(true);
    }
  }, [route.params?.scrollToItemId]);

  useEffect(() => {
    loadTimeline();

    // 기존 pending links 로드 + OG 데이터 미리 fetch
    pendingLinkService.loadPendingLinks().then(async (links) => {
      const linksWithOgData = await Promise.all(
        links.map(async (link) => {
          if (link.ogData) return link;
          try {
            const ogData = await fetchOgData(link.url);
            return { ...link, ogData };
          } catch {
            // console.error('Failed to load OG data:', link.url, error);
            return link;
          }
        })
      );
      setPendingLinks(linksWithOgData);
    });
  }, [loadTimeline]);

  // 앱 시작 시 처리되지 않은 링크가 있으면 토스트 알림
  useEffect(() => {
    if (!loaded || pendingLinks.length === 0 || hasShownPendingLinksToastRef.current) {
      return;
    }
    hasShownPendingLinksToastRef.current = true;
    showToastNotification({
      message: '새로운 링크가 추가되었습니다',
      onAlert: msg => showAlert({ message: msg }),
    });
  }, [loaded, pendingLinks, showAlert]);

  // 타임라인 로드 후 보드/노트 확장 상태 초기화
  useEffect(() => {
    if (!loaded) return;

    const newBoardStates: Record<string, boolean> = {};
    const newNoteStates: Record<string, boolean> = {};

    // 노트를 펼칠 예정이면 보드도 자동으로 펼치기
    const willExpandNotes = expandInitialSettings.noteExpandMode === 'all' || expandInitialSettings.noteExpandMode === 'first';
    const boardShouldExpand = expandInitialSettings.boardExpandMode === 'all' || willExpandNotes;

    items.forEach((item) => {
      if (item.type === 'board') {
        const board = item as Board;
        newBoardStates[board.id] = boardShouldExpand;

        // 노트 펼침 설정
        if (board.notes && boardShouldExpand) {
          if (expandInitialSettings.noteExpandMode === 'all') {
            board.notes.forEach((note) => {
              newNoteStates[note.id] = true;
            });
          } else if (expandInitialSettings.noteExpandMode === 'first' && board.notes.length > 0) {
            newNoteStates[board.notes[0].id] = true;
          }
          // 'none'인 경우는 추가하지 않음
        }
      }
    });

    setBoardExpandStates(newBoardStates);
    setNoteExpandStates(newNoteStates);
    setAllBoardsExpanded(boardShouldExpand);
  }, [loaded, expandInitialSettings]);

  useFocusEffect(
    useCallback(() => {
      loadTimeline();
      // 설정이 변경되었을 수 있으니 다시 로드
      const loadExpandSettings = async () => {
        try {
          const savedSettings = await AsyncStorage.getItem('expandInitialSettings');
          if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            setExpandInitialSettings(settings);
          }
        } catch {
          // console.error('Failed to load expand settings:', error);
        }
      };
      loadExpandSettings();
    }, [loadTimeline])
  );

  useEffect(() => {
    if (route.params?.scrollToItemId) {
      const index = timelineItems.findIndex(i => i.id === route.params?.scrollToItemId);
      if (index !== -1) {
        flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      }
    }
  }, [route.params?.scrollToItemId, timelineItems]);

  useEffect(() => {
    const getShared = async () => {
      try {
        if (!nativeShareModule) return;

        const url = await nativeShareModule.getSharedURL();
        if (typeof url === 'string' && url.trim() && url.startsWith('http')) {
          await handleSharedUrl(url);
          await nativeShareModule.clearSharedURL();
        }
      } catch {
        // console.error('Failed to handle shared URL:', error);
      }
    };

    if (userId) {
      getShared();
    }

    const sub = AppState.addEventListener('change', state => {
      if (state === 'active' && userId) {
        getShared();
      }
    });

    return () => {
      sub.remove();
    };
  }, [userId]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
      if (Platform.OS === 'android') {
        shouldScrollToEnd.current = true;
      }
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Android: 키보드가 열린 상태에서 하드웨어 백 버튼 → 앱 종료 전 키보드 먼저 닫기
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (keyboardVisible) {
        Keyboard.dismiss();
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [keyboardVisible]);

  const toggleAllBoards = () => {
    const newState = !allBoardsExpanded;
    setAllBoardsExpanded(newState);

    const newBoardStates: Record<string, boolean> = {};
    const newNoteStates: Record<string, boolean> = {};

    items.forEach((item) => {
      if (item.type === 'board') {
        const board = item as Board;
        newBoardStates[board.id] = newState;

        if (newState && board.notes) {
          board.notes.forEach((note) => {
            newNoteStates[note.id] = true;
          });
        }
      }
    });

    setBoardExpandStates(newBoardStates);
    setNoteExpandStates(newNoteStates);
  };

  const handleContextMenu = (item: TimelineItem) => setContextMenuItem(item);
  const handleCloseContextMenu = () => setContextMenuItem(null);

  const handleContextCopy = async () => {
    if (!contextMenuItem) return;
    if (contextMenuItem.type !== 'memo') return;

    const memo = contextMenuItem as Memo;

    try {
      // 텍스트 메모
      if (memo.text && !memo.imageUris?.length && !memo.videos?.length && !memo.files?.length) {
        await Clipboard.setString(memo.text);
        showToastNotification({
          message: '텍스트 복사됨',
          onAlert: msg => showAlert({ message: msg }),
        });
        return;
      }

      // 이미지 메모
      if (memo.imageUris?.length) {
        // 첫 번째 이미지 URL을 클립보드에 복사
        await Clipboard.setString(memo.imageUris[0]);
        showToastNotification({
          message: `${memo.imageUris.length}개의 이미지 복사됨`,
          onAlert: msg => showAlert({ message: msg }),
        });
        return;
      }
    } catch {
      // console.error('Failed to copy to clipboard:', error);
      showToastNotification({
        message: '복사 실패',
        onAlert: msg => showAlert({ message: msg }),
      });
    }
  };

  const handleContextBookmark = async () => {
    if (!contextMenuItem) return;
    const item = contextMenuItem;

    try {
      if (item.type === 'memo') {
        const updated = await memoService.toggleMemoBookmark(item.id);
        setItems(prev =>
          prev.map(i =>
            i.id === item.id ? updated : i,
          ),
        );
      } else {
        const updated = await boardService.toggleBoardBookmark(item.id);
        setItems(prev =>
          prev.map(i =>
            i.id === item.id ? updated : i,
          ),
        );
      }
    } catch {
      // console.error('Failed to toggle bookmark:', error);
      showAlert({ title: '오류', message: '북마크 설정에 실패했습니다.', type: 'error' });
    }
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

      showConfirm({
        title: '메모로 변환',
        message: warningMsg,
        confirmText: '변환',
        cancelText: '취소',
        destructive: true,
        onConfirm: () => {
          const newMemo: Memo = {
            id: board.id,
            userId: board.userId,
            type: 'memo',
            bookmarked: board.bookmarked,
            text: board.title,
            createdAt: board.createdAt,
          };
          setItems(prev => prev.map(i => i.id === board.id ? newMemo : i));
        },
      });
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


  const createMemoWithoutLink = async (text: string, urls?: string[], ogDatas?: any[]) => {
    try {
      const newMemo = await memoService.createMemo(text, urls, ogDatas);
      shouldScrollToEnd.current = true;
      setItems(prev => [...prev, newMemo]);
      setInputText('');
    } catch {
      // console.error('Failed to create memo:', error);
      showAlert({ title: '오류', message: '메모 저장에 실패했습니다.', type: 'error' });
      setInputText(text);
    }
  };

  const handleConfirmLink = async (selectedBoard?: Board) => {
    if (!detectedLink || !userId) return;

    try {
      if (selectedBoard) {
        // 보드에 노트로 추가
        const createdNote = await noteService.createNote(selectedBoard.id, {
          title: linkOgData?.title || detectedLink.match(/^(?:https?:\/\/)?([^/?#]+)/)?.[1] || detectedLink,
          content: linkOgData?.description,
          urls: [detectedLink],
          ogDatas: linkOgData ? [linkOgData] : undefined,
        });

        const updatedBoard: Board = {
          ...selectedBoard,
          notes: [...(selectedBoard.notes ?? []), createdNote],
          updatedAt: new Date().toISOString(),
        };
        setItems(prev => prev.map(i => i.id === selectedBoard.id ? updatedBoard : i));
      } else {
        // Pending link로 저장
        const link = await pendingLinkService.addPendingLink({
          userId,
          url: detectedLink,
          ogData: linkOgData || undefined,
          receivedAt: new Date().toISOString(),
        });

        const linkWithOgData = { ...link, ogData: linkOgData };
        setPendingLinks(prev => [...prev, linkWithOgData]);
        showToastNotification({
          message: '새로운 링크가 추가되었습니다',
          onAlert: msg => showAlert({ message: msg }),
        });
      }
    } catch {
      // console.error('Failed to handle link:', error);
      showAlert({ title: '오류', message: '링크 처리에 실패했습니다.', type: 'error' });
    }

    setLinkDetectionModalVisible(false);
    setDetectedLink(null);
    setLinkOgData(null);
  };

  const handleCreateNewBoardInLinkModal = async () => {
    if (!newBoardNameInLinkModal.trim() || !detectedLink || !userId) return;

    setIsCreatingBoardInLinkModal(true);
    try {
      // 새 보드 생성
      const newBoard = await boardService.createBoard({
        title: newBoardNameInLinkModal.trim(),
      });

      // 바로 링크를 노트로 추가
      const createdNote = await noteService.createNote(newBoard.id, {
        title: linkOgData?.title || detectedLink.match(/^(?:https?:\/\/)?([^/?#]+)/)?.[1] || detectedLink,
        content: linkOgData?.description,
        urls: [detectedLink],
        ogDatas: linkOgData ? [linkOgData] : undefined,
      });

      const updatedBoard: Board = {
        ...newBoard,
        notes: [createdNote],
        updatedAt: new Date().toISOString(),
      };
      setItems(prev => [...prev, updatedBoard]);

      setLinkDetectionModalVisible(false);
      setDetectedLink(null);
      setLinkOgData(null);
      setShowNewBoardFormInLinkModal(false);
      setNewBoardNameInLinkModal('');
    } catch {
      // console.error('Failed to create board and add link:', error);
      showAlert({ title: '오류', message: '보드 생성 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setIsCreatingBoardInLinkModal(false);
    }
  };

  const handleContextDelete = () => {
    if (!contextMenuItem) return;
    const id = contextMenuItem.id;
    const item = contextMenuItem;

    showConfirm({
      title: '삭제',
      message: '정말 삭제하시겠습니까?',
      confirmText: '삭제',
      cancelText: '취소',
      destructive: true,
      onConfirm: async () => {
        try {
          if (item.type === 'memo') {
            await memoService.deleteMemo(id);
          } else {
            await boardService.deleteBoard(id);
          }
          setItems(prev => prev.filter(i => i.id !== id));
          handleCloseContextMenu();
        } catch {
          // console.error('Failed to delete item:', error);
          showAlert({ title: '오류', message: '삭제에 실패했습니다.', type: 'error' });
        }
      },
    });
  };

  const handleDetailPress = (board: Board, noteId?: string) => {
    navigation.navigate('BoardDetail', {
      board,
      noteId,
    });
  };

  const handleBookmarkPress = (item: TimelineItem) => {
    if (item.type === 'board') {
      navigation.navigate('BoardDetail', {
        board: item as Board,
      });
    } else {
      const index = items.findIndex(i => i.id === item.id);
      if (index !== -1) {
        flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      }
    }
  };


  const handleOpenLinkModal = (url: string, ogData?: any) => {
    setDetectedLink(url);
    setLinkDetectionModalVisible(true);

    if (!ogData) {
      setIsFetchingOg(true);
      fetchOgData(url)
        .then(data => {
          setLinkOgData(data || null);
        })
        .catch(() => {
          // console.error('Failed to fetch OG data:', error);
          setLinkOgData(null);
        })
        .finally(() => {
          setIsFetchingOg(false);
        });
    } else {
      setLinkOgData(ogData);
    }
  };

  const handleImagePress = (imageUri: string, allUris: string[]) => {
    setSelectedImageUri(imageUri);
    setAllImageUris(allUris);
    setImageViewerVisible(true);
  };

  // 검색 결과 클릭 처리
  const handleSearchResultPress = (item: searchService.SearchItem) => {
    setIsSearchMode(false);
    setSearchText('');

    if (item.type === 'memo') {
      // 메모: 타임라인에서 스크롤로 찾기
      const index = items.findIndex(i => i.id === item.uid);
      if (index !== -1) {
        flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      }
    } else if (item.type === 'board') {
      // 보드: 보드 상세로 이동
      const board = items.find(i => i.id === item.uid && i.type === 'board') as any;
      if (board) {
        navigation.navigate('BoardDetail', { board });
      }
    } else if (item.type === 'note') {
      // 노트: 부모 보드로 이동하되 해당 노트 포커스
      const board = items.find(i => i.id === item.parentUid && i.type === 'board') as any;
      if (board) {
        navigation.navigate('BoardDetail', {
          board,
          noteId: item.uid,
        });
      }
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();

    // 링크 감지 없이 바로 메모 저장
    await createMemoWithoutLink(text);
  };

  const handlePickImages = async (imageUris: string[]) => {
    if (imageUris.length === 0) return;
    setIsUploadingMedia(true);
    try {
      const raw = await createMemoWithImage(imageUris);
      const newMemo: Memo = {
        id: raw.uid,
        userId: raw.userId || '',
        type: 'memo',
        text: raw.text || '',
        imageUris: raw.images && raw.images.length > 0 ? raw.images.map((img: any) => img.url) : [],
        images: raw.images,
        bookmarked: raw.bookmarked ?? false,
        createdAt: raw.createdAt,
      };
      shouldScrollToEnd.current = true;
      setItems(prev => [...prev, newMemo]);
    } catch {
      // console.error('Failed to upload images:', error);
      showAlert({ title: '오류', message: '이미지 업로드에 실패했습니다.', type: 'error' });
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handlePickVideo = async (videoUri: string, videoName?: string) => {
    setIsUploadingMedia(true);
    try {
      const raw = await createMemoWithVideo(videoUri, videoName);
      const newMemo: Memo = {
        id: raw.uid,
        userId: raw.userId || '',
        type: 'memo',
        text: raw.text || '',
        videoUris: raw.videos && raw.videos.length > 0 ? raw.videos.map((vid: any) => vid.url) : [],
        videos: raw.videos,
        bookmarked: raw.bookmarked ?? false,
        createdAt: raw.createdAt,
      };
      shouldScrollToEnd.current = true;
      setItems(prev => [...prev, newMemo]);
    } catch {
      // console.error('Failed to upload video:', error);
      showAlert({ title: '오류', message: '동영상 업로드에 실패했습니다.', type: 'error' });
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handlePickFile = async (fileUri: string, fileName: string) => {
    setIsUploadingMedia(true);
    try {
      const raw = await createMemoWithFile(fileUri, fileName);
      const newMemo: Memo = {
        id: raw.uid,
        userId: raw.userId || '',
        type: 'memo',
        text: raw.text || '',
        files: raw.files,
        bookmarked: raw.bookmarked ?? false,
        createdAt: raw.createdAt,
      };
      shouldScrollToEnd.current = true;
      setItems(prev => [...prev, newMemo]);
    } catch {
      // console.error('Failed to upload file:', error);
      showAlert({ title: '오류', message: '파일 업로드에 실패했습니다.', type: 'error' });
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handlePendingLinkAddToBoard = async (link: PendingLink, board: Board) => {
    try {
      // 1. 노트 생성
      const createdNote = await noteService.createNote(board.id, {
        title: link.ogData?.title || link.url.match(/^(?:https?:\/\/)?([^/?#]+)/)?.[1] || link.url,
        content: link.ogData?.description,
        urls: [link.url],
        ogDatas: link.ogData ? [link.ogData] : undefined,
      });

      // 2. Pending link 삭제 (먼저 API 호출)
      await pendingLinkService.removePendingLink(link.id);

      // 3. 모두 성공하면 UI 업데이트
      const updatedBoard: Board = {
        ...board,
        notes: [...(board.notes ?? []), createdNote],
        updatedAt: new Date().toISOString(),
      };

      // 새 보드 여부 확인
      const isBoardExisting = items.some(i => i.id === board.id);

      if (isBoardExisting) {
        // 기존 보드: 해당 보드만 업데이트
        setItems(prev => prev.map(i => i.id === board.id ? updatedBoard : i));
      } else {
        // 새 보드: timeline 새로고침 (새 보드 반영)
        await loadTimeline();
      }

      setPendingLinks(prev => prev.filter(l => l.id !== link.id));
    } catch {
      // console.error('Failed to add note to board:', error);
      showAlert({ title: '오류', message: '노트 추가에 실패했습니다.', type: 'error' });
    }
  };

  const handlePendingLinkDismiss = async (linkId: string) => {
    try {
      await pendingLinkService.removePendingLink(linkId);
      setPendingLinks(prev => prev.filter(l => l.id !== linkId));
    } catch {
      // console.error('Failed to dismiss pending link:', error);
      showAlert({ title: '오류', message: '링크 삭제에 실패했습니다.', type: 'error' });
    }
  };

  return (
    <SafeAreaView
      style={styles['main-safeArea']}
      edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF3FF" />
      <View
        pointerEvents="none"
        style={[
          styles['main-topSafeAreaFill'],
          { height: insets.top },
        ]}
      />
      <View style={styles['main-header']}>
        {isSearchMode ? (
          <>
            <TouchableOpacity onPress={() => { setIsSearchMode(false); setSearchText(''); setSearchFieldFilters(new Set()); }} style={styles['main-header-iconButton']}>
              <ArrowLeftIcon color="#1A1A1A" size={20} />
            </TouchableOpacity>
            <TextInput
              style={[styles['main-inputBar-input'], { marginHorizontal: 8, flex: 1 }]}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="메모, 노트, 보드의 제목 검색..."
              placeholderTextColor="#AABBCC"
              autoFocus
            />
            <TouchableOpacity
              style={[styles['main-header-iconButton'], searchFieldFilters.size > 0 && { backgroundColor: '#E8EEFF' }]}
              onPress={() => setIsSearchFilterVisible(true)}>
              <Text style={[{ fontSize: 10, fontWeight: '600', color: searchFieldFilters.size > 0 ? '#588DFF' : '#1A1A1A' }]}>
                {searchFieldFilters.size > 0 ? `필터 (${searchFieldFilters.size})` : '필터'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles['main-header-leftButtons']}>
              <TouchableOpacity
                style={styles['main-header-iconButton']}
                onPress={() => setIsSearchMode(true)}>
                <SearchIcon color="#1A1A1A" size={20} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles['main-header-iconButton']}
                onPress={() => setExpandModalVisible(true)}>
                <ViewIcon color="#1A1A1A" size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles['main-header-titleWrapper']} pointerEvents="none">
              <Text style={styles['main-header-title']}>MEMoryMe</Text>
            </View>

            <View style={styles['main-header-rightButtons']}>
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
          </>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles['main-body']}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View
          style={styles['main-content']}
          onLayout={({ nativeEvent }) => {
            const { width, height } = nativeEvent.layout;
            // 값이 실제로 바뀌었을 때만 갱신 (Mac에서 창 크기를 조절해도
            // 워터마크 크기가 최초 측정값에 고정되지 않도록 함)
            setWatermarkFrame(prev =>
              prev && prev.width === width && prev.height === height
                ? prev
                : { width, height },
            );
          }}>
          {watermarkFrame ? (
            <View
              style={[
                styles['main-watermark'],
                {
                  top: (watermarkFrame.height - watermarkFrame.width * 0.55) / 2,
                  height: watermarkFrame.width * 0.55,
                },
              ]}
              pointerEvents="none">
              <Image
                source={require('../assets/imgs/mainlogo.png')}
                style={[
                  styles['main-watermark-image'],
                  {
                    width: watermarkFrame.width * 0.55,
                    height: watermarkFrame.width * 0.55,
                  },
                ]}
              />
            </View>
          ) : null}

            {/* 일반 타임라인 리스트 */}
            <FlatList<TimelineItem>
              ref={flatListRef}
              data={timelineItems}
              keyExtractor={item => item.id}
              style={styles['main-list']}
              contentContainerStyle={styles['main-listContent']}
              inverted
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => {
                scrollToLatestIfNeeded();
              }}
              onLayout={scrollToLatestIfNeeded}
              renderItem={({ item, index }) => {
                // 다음 아이템의 시간과 비교하여 같은 시간에 보낸 것인지 확인
                const currentTime = getHourMinute(item.createdAt);
                const nextItem = index > 0 ? timelineItems[index - 1] : null;
                const nextTime = nextItem ? getHourMinute(nextItem.createdAt) : null;
                const isLastInTime = !nextTime || currentTime !== nextTime;

                if (item.type === 'memo') {
                  const memo = item as Memo;
                  return (
                    <ChatMessageItem
                      item={memo}
                      expanded={expandedMemoId === memo.id}
                      showTime={isLastInTime}
                      onToggleExpand={(m) => setExpandedMemoId(expandedMemoId === m.id ? null : m.id)}
                      onLongPress={handleContextMenu}
                      onOpenLinkModal={handleOpenLinkModal}
                      onImagePress={handleImagePress}
                    />
                  );
                }

                return (
                  <BoardCard
                    item={item as Board}
                    onContextMenu={handleContextMenu}
                    onDetailPress={handleDetailPress}
                    onPress={handleDetailPress}
                    showTime={isLastInTime}
                    isExpanded={boardExpandStates[(item as Board).id] ?? true}
                    onExpandChange={(id, expanded) => setBoardExpandStates(prev => ({ ...prev, [id]: expanded }))}
                    expandedNoteIds={Object.keys(noteExpandStates).filter(key => {
                      const board = item as Board;
                      return noteExpandStates[key] && board.notes?.some(n => n.id === key);
                    })}
                    onNoteExpandChange={(noteId, expanded) => {
                      setNoteExpandStates(prev => {
                        if (expanded) {
                          return { ...prev, [noteId]: true };
                        } else {
                          const newStates = { ...prev };
                          delete newStates[noteId];
                          return newStates;
                        }
                      });
                    }}
                  />
                );
              }}
            ListEmptyComponent={
              isSearchMode && searchText.trim() && !isLoadingSearch ? (
                <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 14, color: '#AABBCC', fontFamily: 'PretendardVariable' }}>
                    검색 결과가 없습니다
                  </Text>
                </View>
              ) : undefined
            }
            />
        </View>

        {!isSearchMode && (
          <View
            style={[
              styles['main-inputBarWrapper'],
              Platform.OS === 'android' && keyboardVisible && styles['main-inputBarWrapper-keyboardVisible'],
            ]}>
            <ChatInputBar
              inputText={inputText}
              onChangeText={setInputText}
              onSend={handleSend}
              onPlusPress={() => setMediaPickerVisible(true)}
              bottomInset={Platform.OS === 'ios' && keyboardVisible ? 0 : insets.bottom}
            />
          </View>
        )}
      </KeyboardAvoidingView>

      {/* 미디어 피커 시트 */}
      <MediaPickerSheet
        visible={mediaPickerVisible}
        onClose={() => setMediaPickerVisible(false)}
        onPickImages={handlePickImages}
        onPickVideo={handlePickVideo}
        onPickFile={handlePickFile}
        isLoading={isUploadingMedia}
      />

      {/* 검색 필터 모달 */}
      <Modal
        visible={isSearchFilterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSearchFilterVisible(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }}
          activeOpacity={1}
          onPress={() => setIsSearchFilterVisible(false)}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 14,
              paddingHorizontal: 18,
              paddingBottom: Math.max(insets.bottom, 18),
              marginTop: 'auto',
            }}
            onStartShouldSetResponder={() => true}
            pointerEvents="auto">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1A1A1A', fontFamily: 'PretendardVariable' }}>
                검색 필터
              </Text>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                {searchFieldFilters.size > 0 && (
                  <TouchableOpacity onPress={() => setSearchFieldFilters(new Set())}>
                    <Text style={{ fontSize: 12, color: '#9DAFC8', fontWeight: '600', fontFamily: 'PretendardVariable' }}>
                      초기화
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setIsSearchFilterVisible(false)}>
                  <Text style={{ fontSize: 24, color: '#9DAFC8' }}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {(['memoTextOnly', 'board', 'note', 'tag', 'photo', 'video', 'file'] as SearchFieldFilter[]).map(filter => (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => {
                      const newFilters = new Set(searchFieldFilters);
                      if (newFilters.has(filter)) {
                        newFilters.delete(filter);
                      } else {
                        newFilters.add(filter);
                      }
                      setSearchFieldFilters(newFilters);
                    }}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                      backgroundColor: searchFieldFilters.has(filter) ? '#588DFF' : '#F0F4FF',
                      borderWidth: searchFieldFilters.has(filter) ? 0 : 1,
                      borderColor: '#C0CDD8',
                    }}>
                    <Text style={{
                      fontSize: 11,
                      fontWeight: '500',
                      color: searchFieldFilters.has(filter) ? '#FFFFFF' : '#588DFF',
                      fontFamily: 'PretendardVariable',
                    }}>
                      {filter === 'memoTextOnly' ? '메모(텍스트)' :
                       filter === 'board' ? '보드' :
                       filter === 'note' ? '노트' :
                       filter === 'tag' ? '태그' :
                       filter === 'photo' ? '사진' :
                       filter === 'video' ? '동영상' : '파일'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <SideMenu
        visible={sideMenuVisible}
        items={items}
        storageUsed={storageUsed}
        onClose={() => setSideMenuVisible(false)}
        onSettings={() => {
          navigation.navigate('Settings');
          setSideMenuVisible(false);
        }}
        onBookmarkPress={handleBookmarkPress}
        isBookmarkFilterActive={filterBookmarkOnly}
        onBookmarkFilterToggle={(active) => {
          setFilterBookmarkOnly(active);
          setIsSearchMode(false);
          setSearchFieldFilters(new Set());
        }}
        onMediaGalleryPress={(galleryType) => {
          navigation.navigate('MediaGallery', {
            items,
            galleryType,
          });
          setSideMenuVisible(false);
        }}
      />

      {/* 펼치기/접기 옵션 모달 */}
      <Modal
        visible={expandModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setExpandModalVisible(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
          onPress={() => setExpandModalVisible(false)}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 14,
              paddingHorizontal: 18,
              paddingBottom: Math.max(insets.bottom, 18),
              marginTop: 'auto',
            }}
            onStartShouldSetResponder={() => true}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1A1A1A', fontFamily: 'PretendardVariable' }}>
                표시 설정
              </Text>
              <TouchableOpacity onPress={() => setExpandModalVisible(false)}>
                <Text style={{ fontSize: 24, color: '#9DAFC8' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* 보드 설정 */}
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#1A1A1A', marginBottom: 10, fontFamily: 'PretendardVariable' }}>
                보드
              </Text>
              <TouchableOpacity
                onPress={() => {
                  const newMode = expandInitialSettings.boardExpandMode === 'all' ? 'none' : 'all';
                  setExpandInitialSettings(prev => ({ ...prev, boardExpandMode: newMode as 'all' | 'none' }));
                  AsyncStorage.setItem('expandInitialSettings', JSON.stringify({
                    boardExpandMode: newMode,
                    noteExpandMode: expandInitialSettings.noteExpandMode
                  }));
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: expandInitialSettings.boardExpandMode === 'all' ? '#F8FAFF' : '#FFFFFF',
                  borderRadius: 10,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: expandInitialSettings.boardExpandMode === 'all' ? '#588DFF' : '#E4ECFF',
                }}>
                <View style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  borderWidth: 2,
                  borderColor: expandInitialSettings.boardExpandMode === 'all' ? '#588DFF' : '#C0CDD8',
                  backgroundColor: expandInitialSettings.boardExpandMode === 'all' ? '#588DFF' : 'transparent',
                  marginRight: 12,
                }} />
                <Text style={{ fontSize: 14, color: '#1A1A1A', fontFamily: 'PretendardVariable', fontWeight: '500' }}>
                  모든 보드 펼치기
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setExpandInitialSettings(prev => ({
                    ...prev,
                    boardExpandMode: 'none' as 'all' | 'none',
                    noteExpandMode: 'none' as 'none' | 'first' | 'all',
                  }));
                  AsyncStorage.setItem('expandInitialSettings', JSON.stringify({
                    boardExpandMode: 'none',
                    noteExpandMode: 'none'
                  }));
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: expandInitialSettings.boardExpandMode === 'none' ? '#F8FAFF' : '#FFFFFF',
                  borderRadius: 10,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: expandInitialSettings.boardExpandMode === 'none' ? '#588DFF' : '#E4ECFF',
                }}>
                <View style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  borderWidth: 2,
                  borderColor: expandInitialSettings.boardExpandMode === 'none' ? '#588DFF' : '#C0CDD8',
                  backgroundColor: expandInitialSettings.boardExpandMode === 'none' ? '#588DFF' : 'transparent',
                  marginRight: 12,
                }} />
                <Text style={{ fontSize: 14, color: '#1A1A1A', fontFamily: 'PretendardVariable', fontWeight: '500' }}>
                  모든 보드 접기
                </Text>
              </TouchableOpacity>

              {/* 노트 설정 - 보드 접기일 때 비활성화 */}
              <Text style={{ fontSize: 12, fontWeight: '600', color: expandInitialSettings.boardExpandMode === 'none' ? '#C0CDD8' : '#1A1A1A', marginBottom: 10, fontFamily: 'PretendardVariable' }}>
                노트 {expandInitialSettings.boardExpandMode === 'none' ? '(보드 접기일 때 사용 불가)' : ''}
              </Text>

              <TouchableOpacity
                disabled={expandInitialSettings.boardExpandMode === 'none'}
                onPress={() => {
                  setExpandInitialSettings(prev => ({ ...prev, noteExpandMode: 'none' as 'none' | 'first' | 'all' }));
                  AsyncStorage.setItem('expandInitialSettings', JSON.stringify({
                    boardExpandMode: expandInitialSettings.boardExpandMode,
                    noteExpandMode: 'none'
                  }));
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: expandInitialSettings.noteExpandMode === 'none' ? '#F8FAFF' : '#FFFFFF',
                  borderRadius: 10,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: expandInitialSettings.noteExpandMode === 'none' ? '#588DFF' : '#E4ECFF',
                  opacity: expandInitialSettings.boardExpandMode === 'none' ? 0.5 : 1,
                }}>
                <View style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  borderWidth: 2,
                  borderColor: expandInitialSettings.noteExpandMode === 'none' ? '#588DFF' : '#C0CDD8',
                  backgroundColor: expandInitialSettings.noteExpandMode === 'none' ? '#588DFF' : 'transparent',
                  marginRight: 12,
                }} />
                <Text style={{ fontSize: 14, color: expandInitialSettings.boardExpandMode === 'none' ? '#C0CDD8' : '#1A1A1A', fontFamily: 'PretendardVariable', fontWeight: '500' }}>
                  모든 노트 접기
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={expandInitialSettings.boardExpandMode === 'none'}
                onPress={() => {
                  setExpandInitialSettings(prev => ({ ...prev, noteExpandMode: 'first' as 'none' | 'first' | 'all' }));
                  AsyncStorage.setItem('expandInitialSettings', JSON.stringify({
                    boardExpandMode: expandInitialSettings.boardExpandMode,
                    noteExpandMode: 'first'
                  }));
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: expandInitialSettings.noteExpandMode === 'first' ? '#F8FAFF' : '#FFFFFF',
                  borderRadius: 10,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: expandInitialSettings.noteExpandMode === 'first' ? '#588DFF' : '#E4ECFF',
                  opacity: expandInitialSettings.boardExpandMode === 'none' ? 0.5 : 1,
                }}>
                <View style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  borderWidth: 2,
                  borderColor: expandInitialSettings.noteExpandMode === 'first' ? '#588DFF' : '#C0CDD8',
                  backgroundColor: expandInitialSettings.noteExpandMode === 'first' ? '#588DFF' : 'transparent',
                  marginRight: 12,
                }} />
                <Text style={{ fontSize: 14, color: expandInitialSettings.boardExpandMode === 'none' ? '#C0CDD8' : '#1A1A1A', fontFamily: 'PretendardVariable', fontWeight: '500' }}>
                  보드당 첫 번째 노트만 펼치기
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={expandInitialSettings.boardExpandMode === 'none'}
                onPress={() => {
                  setExpandInitialSettings(prev => ({ ...prev, noteExpandMode: 'all' as 'none' | 'first' | 'all' }));
                  AsyncStorage.setItem('expandInitialSettings', JSON.stringify({
                    boardExpandMode: expandInitialSettings.boardExpandMode,
                    noteExpandMode: 'all'
                  }));
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: expandInitialSettings.noteExpandMode === 'all' ? '#F8FAFF' : '#FFFFFF',
                  borderRadius: 10,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: expandInitialSettings.noteExpandMode === 'all' ? '#588DFF' : '#E4ECFF',
                  opacity: expandInitialSettings.boardExpandMode === 'none' ? 0.5 : 1,
                }}>
                <View style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  borderWidth: 2,
                  borderColor: expandInitialSettings.noteExpandMode === 'all' ? '#588DFF' : '#C0CDD8',
                  backgroundColor: expandInitialSettings.noteExpandMode === 'all' ? '#588DFF' : 'transparent',
                  marginRight: 12,
                }} />
                <Text style={{ fontSize: 14, color: expandInitialSettings.boardExpandMode === 'none' ? '#C0CDD8' : '#1A1A1A', fontFamily: 'PretendardVariable', fontWeight: '500' }}>
                  모든 노트 펼치기
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <ContextMenu
        visible={contextMenuItem !== null}
        itemType={contextMenuItem?.type ?? 'memo'}
        isBookmarked={contextMenuItem?.bookmarked ?? false}
        showCopyButton={
          contextMenuItem?.type === 'memo' && (
            // 텍스트 메모 또는 이미지가 1개인 메모만
            (!((contextMenuItem as Memo).imageUris?.length || (contextMenuItem as Memo).videos?.length || (contextMenuItem as Memo).files?.length)) ||
            (contextMenuItem as Memo).imageUris?.length === 1
          )
        }
        copyLabel={
          (contextMenuItem as Memo)?.imageUris?.length === 1 ? '이미지 복사' : '내용 복사'
        }
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

      {/* 링크 감지 모달 */}
      <Modal
        visible={linkDetectionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setLinkDetectionModalVisible(false);
          setDetectedLink(null);
          setLinkOgData(null);
        }}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
          onPress={() => {
            setLinkDetectionModalVisible(false);
            setDetectedLink(null);
            setLinkOgData(null);
          }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 14,
              paddingHorizontal: 18,
              paddingBottom: Math.max(insets.bottom, 18),
              marginTop: 'auto',
              maxHeight: '80%',
            }}
            onStartShouldSetResponder={() => true}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1A1A1A', fontFamily: 'PretendardVariable' }}>
                링크 감지됨
              </Text>
              <TouchableOpacity onPress={() => {
                setLinkDetectionModalVisible(false);
                setDetectedLink(null);
                setLinkOgData(null);
              }}>
                <Text style={{ fontSize: 24, color: '#9DAFC8' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 12, color: '#666666', marginBottom: 12, fontFamily: 'PretendardVariable' }}>
              위 입력한 텍스트에 링크가 포함되어 있습니다. 어디에 추가할까요?
            </Text>

            {/* OG 프리뷰 */}
            {isFetchingOg ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: '#AABBCC', fontFamily: 'PretendardVariable' }}>
                  링크 정보 불러오는 중...
                </Text>
              </View>
            ) : linkOgData ? (
              <View style={{
                backgroundColor: '#F8F9FB',
                borderRadius: 12,
                padding: 12,
                marginBottom: 14,
                borderWidth: 1,
                borderColor: '#E8EEF8',
              }}>
                {linkOgData.imageUrl && (
                  <Image
                    source={{ uri: linkOgData.imageUrl }}
                    style={{ width: '100%', height: 120, borderRadius: 8, marginBottom: 10 }}
                  />
                )}
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#1A1A1A', marginBottom: 4, fontFamily: 'PretendardVariable' }}>
                  {linkOgData.title || detectedLink}
                </Text>
                {linkOgData.description && (
                  <Text style={{ fontSize: 11, color: '#666666', marginBottom: 6, fontFamily: 'PretendardVariable' }} numberOfLines={2}>
                    {linkOgData.description}
                  </Text>
                )}
                <Text style={{ fontSize: 10, color: '#9DAFC8', fontFamily: 'PretendardVariable' }}>
                  {linkOgData.siteName || detectedLink}
                </Text>
              </View>
            ) : null}

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {/* 보드 선택 옵션 */}
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#588DFF', marginBottom: 8, fontFamily: 'PretendardVariable' }}>
                보드에 추가
              </Text>

              {/* 새 보드 만들기 버튼 */}
              <TouchableOpacity
                onPress={() => setShowNewBoardFormInLinkModal(true)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 8,
                  borderRadius: 8,
                  backgroundColor: '#EEF4FF',
                  borderWidth: 1,
                  borderColor: '#C8D9FF',
                }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#588DFF', fontFamily: 'PretendardVariable' }}>
                  + 새 보드 만들기
                </Text>
              </TouchableOpacity>

              {recentBoards.length > 0 ? (
                recentBoards.map((board) => (
                  <TouchableOpacity
                    key={board.id}
                    onPress={() => handleConfirmLink(board)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      marginBottom: 8,
                      borderRadius: 8,
                      backgroundColor: '#F8F9FB',
                      borderWidth: 1,
                      borderColor: '#E8EEF8',
                    }}>
                    <Text style={{ fontSize: 12, fontWeight: '500', color: '#1A1A1A', fontFamily: 'PretendardVariable' }}>
                      {board.title}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#9DAFC8', marginTop: 2, fontFamily: 'PretendardVariable' }}>
                      노트 {board.notes?.length ?? 0}개
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{ fontSize: 11, color: '#AABBCC', fontFamily: 'PretendardVariable', textAlign: 'center', paddingVertical: 8 }}>
                  기존 보드가 없습니다
                </Text>
              )}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  setLinkDetectionModalVisible(false);
                  setDetectedLink(null);
                  setLinkOgData(null);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#E8EEF8',
                  alignItems: 'center',
                }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#588DFF', fontFamily: 'PretendardVariable' }}>
                  취소
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleConfirmLink()}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: '#588DFF',
                  alignItems: 'center',
                }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF', fontFamily: 'PretendardVariable' }}>
                  임시 보관함에 저장
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 링크 감지 모달에서의 새 보드 만들기 */}
      <Modal
        visible={showNewBoardFormInLinkModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!isCreatingBoardInLinkModal) setShowNewBoardFormInLinkModal(false);
        }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
            activeOpacity={1}
            onPress={() => {
              if (!isCreatingBoardInLinkModal) setShowNewBoardFormInLinkModal(false);
            }}>
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingTop: 14,
                paddingHorizontal: 18,
                paddingBottom: Math.max(insets.bottom, 18),
              }}
              onStartShouldSetResponder={() => true}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1A1A1A', fontFamily: 'PretendardVariable' }}>
                  새 보드 만들기
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    if (!isCreatingBoardInLinkModal) setShowNewBoardFormInLinkModal(false);
                  }}
                  disabled={isCreatingBoardInLinkModal}>
                  <Text style={{ fontSize: 24, color: '#9DAFC8' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 12, fontWeight: '600', color: '#9DAFC8', marginBottom: 8, fontFamily: 'PretendardVariable' }}>
                보드 이름
              </Text>
              <TextInput
                style={{
                  fontSize: 15,
                  color: '#1A1A1A',
                  fontFamily: 'PretendardVariable',
                  borderWidth: 1,
                  borderColor: '#E4ECFF',
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  backgroundColor: '#FAFCFF',
                  marginBottom: 20,
                }}
                value={newBoardNameInLinkModal}
                onChangeText={setNewBoardNameInLinkModal}
                placeholder="보드 이름을 입력하세요"
                placeholderTextColor="#AABBCC"
                editable={!isCreatingBoardInLinkModal}
                maxLength={100}
                returnKeyType="done"
                autoFocus
              />

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#E8EEF8',
                    alignItems: 'center',
                  }}
                  onPress={() => setShowNewBoardFormInLinkModal(false)}
                  disabled={isCreatingBoardInLinkModal}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#588DFF', fontFamily: 'PretendardVariable' }}>
                    취소
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: newBoardNameInLinkModal.trim() && !isCreatingBoardInLinkModal ? '#588DFF' : '#C0CDD8',
                    alignItems: 'center',
                  }}
                  onPress={handleCreateNewBoardInLinkModal}
                  disabled={!newBoardNameInLinkModal.trim() || isCreatingBoardInLinkModal}>
                  {isCreatingBoardInLinkModal ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF', fontFamily: 'PretendardVariable' }}>
                      만들기
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* 이미지 뷰어 모달 */}
      <ImageViewerModal
        visible={imageViewerVisible}
        imageUris={allImageUris}
        initialIndex={allImageUris.indexOf(selectedImageUri || '')}
        onClose={() => setImageViewerVisible(false)}
      />
    </SafeAreaView>
  );
};

export default MainScreen;

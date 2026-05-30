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
  Alert,
  AppState,
  NativeModules,
  StatusBar,
  Keyboard,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Board, Memo, PendingLink, TimelineItem } from '../types';
import ChatMessageItem from '../components/chat/ChatMessageItem';
import ChatInputBar from '../components/chat/ChatInputBar';
import BoardCard from '../components/board/BoardCard';
import ContextMenu from '../components/common/ContextMenu';
import SideMenu from '../components/common/SideMenu';
import { HamburgerIcon, PlusIcon, SearchIcon, ArrowLeftIcon } from '../components/common/Icons';
import Badge from '../components/common/Badge';
import ImageViewerModal from '../components/common/ImageViewerModal';
import MemoConvertSheet from '../components/memo/MemoConvertSheet';
import PendingLinksBottomSheet from '../components/pendingLinks/PendingLinksBottomSheet';
import MediaPickerSheet from '../components/chat/MediaPickerSheet';
import { createMemoWithImage, createMemoWithVideo, createMemoWithFile } from '../services/uploadService';
import { mainStyles as styles } from '../styles/MainScreen.styles';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { fetchOgData } from '../services/ogService';
import * as pendingLinkService from '../services/pendingLinkService';
import * as timelineService from '../services/timelineService';
import * as memoService from '../services/memoService';
import * as boardService from '../services/boardService';
import * as noteService from '../services/noteService';

const ANDROID_KEYBOARD_EXTRA_OFFSET = 50;

const MainScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Main'>>();
  const route = useRoute();
  const [userId, setUserId] = useState<string>('');
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [expandedMemoId, setExpandedMemoId] = useState<string | null>(null);
  const [contextMenuItem, setContextMenuItem] = useState<TimelineItem | null>(null);
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList<TimelineItem>>(null);
  const shouldScrollToEnd = useRef(false);
  const androidInputOffset = Platform.OS === 'android' && keyboardVisible
    ? keyboardHeight + Math.max(insets.bottom, ANDROID_KEYBOARD_EXTRA_OFFSET)
    : 0;

  // 링크 감지 관련 state
  const [detectedLink, setDetectedLink] = useState<string | null>(null);
  const [linkDetectionModalVisible, setLinkDetectionModalVisible] = useState(false);
  const [linkOgData, setLinkOgData] = useState<any>(null);
  const [isFetchingOg, setIsFetchingOg] = useState(false);

  // 로그인한 사용자 ID 로드
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        setUserId(id || '');
      } catch (error) {
        console.error('Failed to load userId:', error);
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

  // 검색 & 필터
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'memo' | 'board'>('all');
  const [filterBookmarkOnly, setFilterBookmarkOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagFilterVisible, setIsTagFilterVisible] = useState(false);

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

  // 이미지 뷰어
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerUris, setImageViewerUris] = useState<string[]>([]);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);

  // 초기 설정 로드
  useEffect(() => {
    const loadExpandSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('expandInitialSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setExpandInitialSettings(settings);
        }
      } catch (error) {
        console.error('Failed to load expand settings:', error);
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
      } catch (error) {
        console.error('Failed to load recent boards:', error);
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

    // 타입 필터
    if (filterType === 'memo') {
      result = result.filter(i => i.type === 'memo');
    } else if (filterType === 'board') {
      result = result.filter(i => i.type === 'board');
    }

    // 북마크 필터
    if (filterBookmarkOnly) {
      result = result.filter(i => i.bookmarked);
    }

    // 태그 필터 (보드만)
    if (selectedTags.length > 0) {
      result = result.filter(i => {
        if (i.type === 'board') {
          const board = i as Board;
          return selectedTags.some(tag => board.tags?.includes(tag));
        }
        return true;
      });
    }

    // 검색 텍스트 필터
    if (searchText.trim()) {
      const query = searchText.toLowerCase();

      // 태그 검색 (# 포함)
      if (query.startsWith('#')) {
        const tagQuery = query.substring(1).trim();
        result = result.filter(i => {
          if (i.type === 'board') {
            const board = i as Board;
            return (board.tags ?? []).some(tag => tag.toLowerCase().includes(tagQuery));
          }
          return false;
        });
      } else {
        // 일반 텍스트 검색
        result = result.filter(i => {
          if (i.type === 'memo') {
            return (i as Memo).text.toLowerCase().includes(query);
          } else {
            const board = i as Board;
            // 보드 제목 검색
            if (board.title.toLowerCase().includes(query)) {
              return true;
            }
            // 보드 내 노트 제목, 내용 검색
            return (board.notes ?? []).some(note =>
              note.title?.toLowerCase().includes(query) ||
              note.content?.toLowerCase().includes(query)
            );
          }
        });
      }
    }

    return result;
  }, [items, filterType, filterBookmarkOnly, searchText, selectedTags]);

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
    } catch (error) {
      console.error('Failed to handle shared URL:', error);
    }
  };

  const loadTimeline = useCallback(async () => {
    try {
      const response = await timelineService.fetchTimeline({
        sort: 'createdAt',
        limit: 50,
      });
      setItems(response.items);
    } catch (error) {
      console.error('Failed to load timeline:', error);
      setItems([]);
    } finally {
      setLoaded(true);
    }
  }, []);

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
          } catch (error) {
            console.error('Failed to load OG data:', link.url, error);
            return link;
          }
        })
      );
      setPendingLinks(linksWithOgData);
    });
  }, [loadTimeline]);

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
        } catch (error) {
          console.error('Failed to load expand settings:', error);
        }
      };
      loadExpandSettings();
    }, [loadTimeline])
  );

  useEffect(() => {
    if (route.params?.scrollToItemId) {
      const index = items.findIndex(i => i.id === route.params.scrollToItemId);
      if (index !== -1) {
        flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      }
    }
  }, [route.params?.scrollToItemId, items]);

  useEffect(() => {
    const getShared = async () => {
      try {
        if (!nativeShareModule) return;

        const url = await nativeShareModule.getSharedURL();
        if (typeof url === 'string' && url.trim() && url.startsWith('http')) {
          await handleSharedUrl(url);
          await nativeShareModule.clearSharedURL();
        }
      } catch (error) {
        console.error('Failed to handle shared URL:', error);
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

    return () => sub.remove();
  }, [userId]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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

  const handleContextCopy = () => {
    if (!contextMenuItem) return;
    const text =
      contextMenuItem.type === 'memo'
        ? contextMenuItem.text
        : contextMenuItem.title;
    Alert.alert('복사됨', text);
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
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      Alert.alert('오류', '북마크 설정에 실패했습니다.');
    }
  };

  const handleImagePress = (imageUri: string, imageUris: string[]) => {
    const index = imageUris.indexOf(imageUri);
    setImageViewerUris(imageUris);
    setImageViewerIndex(Math.max(0, index));
    setImageViewerVisible(true);
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
              bookmarked: board.bookmarked,
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


  const createMemoWithoutLink = async (text: string, urls?: string[], ogDatas?: any[]) => {
    try {
      const newMemo = await memoService.createMemo(text, urls, ogDatas);
      shouldScrollToEnd.current = true;
      setItems(prev => [...prev, newMemo]);
      setInputText('');
    } catch (error) {
      console.error('Failed to create memo:', error);
      Alert.alert('오류', '메모 저장에 실패했습니다.');
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
      }
    } catch (error) {
      console.error('Failed to handle link:', error);
      Alert.alert('오류', '링크 처리에 실패했습니다.');
    }

    setLinkDetectionModalVisible(false);
    setDetectedLink(null);
    setLinkOgData(null);
  };

  const handleContextDelete = () => {
    if (!contextMenuItem) return;
    const id = contextMenuItem.id;
    const item = contextMenuItem;

    Alert.alert('삭제', '정말 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            if (item.type === 'memo') {
              await memoService.deleteMemo(id);
            } else {
              await boardService.deleteBoard(id);
            }
            setItems(prev => prev.filter(i => i.id !== id));
            handleCloseContextMenu();
          } catch (error) {
            console.error('Failed to delete item:', error);
            Alert.alert('오류', '삭제에 실패했습니다.');
          }
        },
      },
    ]);
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
        .catch(error => {
          console.error('Failed to fetch OG data:', error);
          setLinkOgData(null);
        })
        .finally(() => {
          setIsFetchingOg(false);
        });
    } else {
      setLinkOgData(ogData);
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
      // 여러 이미지를 한 번의 요청으로 전송하면 하나의 메모에 함께 묶임
      const memoData = await createMemoWithImage(imageUris);
      const newMemo: Memo = {
        id: memoData.uid,
        userId: memoData.userId || '',
        type: 'memo',
        text: memoData.text,
        urls: memoData.urls,
        ogDatas: memoData.ogDatas,
        imageUris: memoData.imageUris,
        imageKeys: memoData.imageKeys,
        videos: memoData.videos,
        files: memoData.files,
        bookmarked: memoData.bookmarked ?? false,
        createdAt: memoData.createdAt,
      };
      setItems(prev => [...prev, newMemo]);
      shouldScrollToEnd.current = true;
    } catch (error) {
      console.error('Failed to upload images:', error);
      Alert.alert('오류', '이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handlePickVideo = async (videoUri: string) => {
    setIsUploadingMedia(true);
    try {
      const memoData = await createMemoWithVideo(videoUri);
      const newMemo: Memo = {
        id: memoData.uid,
        userId: memoData.userId || '',
        type: 'memo',
        text: memoData.text,
        urls: memoData.urls,
        ogDatas: memoData.ogDatas,
        imageUris: memoData.imageUris,
        imageKeys: memoData.imageKeys,
        videos: memoData.videos,
        files: memoData.files,
        bookmarked: memoData.bookmarked ?? false,
        createdAt: memoData.createdAt,
      };
      setItems(prev => [...prev, newMemo]);
      shouldScrollToEnd.current = true;
    } catch (error) {
      console.error('Failed to upload video:', error);
      Alert.alert('오류', '동영상 업로드에 실패했습니다.');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handlePickFile = async (fileUri: string, fileName: string) => {
    setIsUploadingMedia(true);
    try {
      const memoData = await createMemoWithFile(fileUri);
      const newMemo: Memo = {
        id: memoData.uid,
        userId: memoData.userId || '',
        type: 'memo',
        text: memoData.text,
        urls: memoData.urls,
        ogDatas: memoData.ogDatas,
        imageUris: memoData.imageUris,
        imageKeys: memoData.imageKeys,
        videos: memoData.videos,
        files: memoData.files,
        bookmarked: memoData.bookmarked ?? false,
        createdAt: memoData.createdAt,
      };
      setItems(prev => [...prev, newMemo]);
      shouldScrollToEnd.current = true;
    } catch (error) {
      console.error('Failed to upload file:', error);
      Alert.alert('오류', '파일 업로드에 실패했습니다.');
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
      setItems(prev => prev.map(i => i.id === board.id ? updatedBoard : i));
      setPendingLinks(prev => prev.filter(l => l.id !== link.id));
    } catch (error) {
      console.error('Failed to add note to board:', error);
      Alert.alert('오류', '노트 추가에 실패했습니다.');
    }
  };

  const handlePendingLinkDismiss = async (linkId: string) => {
    try {
      await pendingLinkService.removePendingLink(linkId);
      setPendingLinks(prev => prev.filter(l => l.id !== linkId));
    } catch (error) {
      console.error('Failed to dismiss pending link:', error);
      Alert.alert('오류', '링크 삭제에 실패했습니다.');
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
            <TouchableOpacity onPress={() => { setIsSearchMode(false); setSearchText(''); }} style={styles['main-header-iconButton']}>
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
              style={[styles['main-header-iconButton'], selectedTags.length > 0 && { backgroundColor: '#E8EEFF' }]}
              onPress={() => setIsTagFilterVisible(true)}>
              <Text style={[{ fontSize: 10, fontWeight: '600', color: selectedTags.length > 0 ? '#588DFF' : '#1A1A1A' }]}>
                필터
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
                <Text style={[{ fontSize: 10, fontWeight: '600', color: '#1A1A1A' }]}>
                  접기/펼치기
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles['main-header-title']} pointerEvents="none">MEMoryMe</Text>

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
        behavior={Platform.OS === 'ios' ? 'height' : undefined}
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
            data={filteredItems}
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
                const memo = item as Memo;
                return (
                  <ChatMessageItem
                    item={memo}
                    expanded={expandedMemoId === memo.id}
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
          />
        </View>

        <View style={Platform.OS === 'android' ? { marginBottom: androidInputOffset } : null}>
          <ChatInputBar
            inputText={inputText}
            onChangeText={setInputText}
            onSend={handleSend}
            onPlusPress={() => setMediaPickerVisible(true)}
            bottomInset={insets.bottom}
          />
        </View>
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

      {/* 태그 필터 모달 */}
      <Modal
        visible={isTagFilterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsTagFilterVisible(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
          onPress={() => setIsTagFilterVisible(false)}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 14,
              paddingHorizontal: 18,
              paddingBottom: Math.max(insets.bottom, 18),
              marginTop: 'auto',
              maxHeight: '70%',
            }}
            onStartShouldSetResponder={() => true}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1A1A1A', fontFamily: 'PretendardVariable' }}>
                태그 필터
              </Text>
              <TouchableOpacity onPress={() => setIsTagFilterVisible(false)}>
                <Text style={{ fontSize: 24, color: '#9DAFC8' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {/* 모든 태그 */}
                {Array.from(new Set(
                  items
                    .filter(i => i.type === 'board')
                    .flatMap(i => (i as Board).tags ?? [])
                )).map(tag => (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => {
                      setSelectedTags(prev =>
                        prev.includes(tag)
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                      backgroundColor: selectedTags.includes(tag) ? '#588DFF' : '#F0F4FF',
                      borderWidth: selectedTags.includes(tag) ? 0 : 1,
                      borderColor: '#C0CDD8',
                    }}>
                    <Text style={{
                      fontSize: 11,
                      fontWeight: '500',
                      color: selectedTags.includes(tag) ? '#FFFFFF' : '#588DFF',
                      fontFamily: 'PretendardVariable',
                    }}>
                      #{tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {Array.from(new Set(
                items
                  .filter(i => i.type === 'board')
                  .flatMap(i => (i as Board).tags ?? [])
              )).length === 0 && (
                <Text style={{ fontSize: 12, color: '#AABBCC', fontFamily: 'PretendardVariable', textAlign: 'center', paddingVertical: 16 }}>
                  사용 가능한 태그가 없습니다
                </Text>
              )}
            </ScrollView>

            {selectedTags.length > 0 && (
              <TouchableOpacity
                onPress={() => setSelectedTags([])}
                style={{
                  paddingVertical: 8,
                  alignItems: 'center',
                  borderTopWidth: 1,
                  borderTopColor: '#E8EEF8',
                }}>
                <Text style={{ fontSize: 12, color: '#9DAFC8', fontWeight: '600', fontFamily: 'PretendardVariable' }}>
                  필터 초기화
                </Text>
              </TouchableOpacity>
            )}
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
                  보드가 없습니다
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

      {/* 이미지 뷰어 모달 */}
      <ImageViewerModal
        visible={imageViewerVisible}
        imageUris={imageViewerUris}
        initialIndex={imageViewerIndex}
        onClose={() => setImageViewerVisible(false)}
      />
    </SafeAreaView>
  );
};

export default MainScreen;

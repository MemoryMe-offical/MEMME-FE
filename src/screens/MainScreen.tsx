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
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { fetchOgData } from '../services/ogService';
import * as pendingLinkService from '../services/pendingLinkService';
import * as timelineService from '../services/timelineService';
import * as memoService from '../services/memoService';
import * as boardService from '../services/boardService';
import * as noteService from '../services/noteService';

const MainScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Main'>>();
  const [userId, setUserId] = useState<string>('');
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [expandedMemoId, setExpandedMemoId] = useState<string | null>(null);
  const [contextMenuItem, setContextMenuItem] = useState<TimelineItem | null>(null);
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [androidKeyboardHeight, setAndroidKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList<TimelineItem>>(null);
  const shouldScrollToEnd = useRef(false);

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

  // 검색 & 필터
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'memo' | 'board'>('all');
  const [filterBookmarkOnly, setFilterBookmarkOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagFilterVisible, setIsTagFilterVisible] = useState(false);

  const [recentBoards, setRecentBoards] = useState<Board[]>([]);

  useEffect(() => {
    const loadRecentBoards = async () => {
      try {
        const boards = await timelineService.fetchTimeline({
          type: 'board',
          sort: 'updatedAt',
          order: 'desc',
          limit: 5,
        });
        setRecentBoards(boards as Board[]);
      } catch (error) {
        console.error('Failed to load recent boards:', error);
        setRecentBoards((items.filter(i => i.type === 'board') as Board[]).slice(0, 5));
      }
    };

    loadRecentBoards();
  }, []);

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
      result = result.filter(i => i.bookMark);
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
      result = result.filter(i => {
        if (i.type === 'memo') {
          return (i as Memo).text.toLowerCase().includes(query);
        } else {
          return (i as Board).title.toLowerCase().includes(query);
        }
      });
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

  useEffect(() => {
    const loadTimeline = async () => {
      try {
        const timelineItems = await timelineService.fetchTimeline({
          sort: 'createdAt',
          order: 'asc',
        });
        setItems(timelineItems);
      } catch (error) {
        console.error('Failed to load timeline:', error);
        setItems([]);
      } finally {
        setLoaded(true);
      }
    };

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
  }, []);

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

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');

    try {
      const newMemo = await memoService.createMemo(text);
      shouldScrollToEnd.current = true;
      setItems(prev => [...prev, newMemo]);
    } catch (error) {
      console.error('Failed to create memo:', error);
      Alert.alert('오류', '메모 저장에 실패했습니다.');
      setInputText(text);
    }
  };

  const handlePendingLinkAddToBoard = async (link: PendingLink, board: Board) => {
    try {
      const createdNote = await noteService.createNote(board.id, {
        title: link.ogData?.title || link.url.match(/^(?:https?:\/\/)?([^/?#]+)/)?.[1] || link.url,
        url: link.url,
      });

      const updatedBoard: Board = {
        ...board,
        notes: [...(board.notes ?? []), createdNote],
        updatedAt: new Date().toISOString(),
      };
      setItems(prev => prev.map(i => i.id === board.id ? updatedBoard : i));

      await pendingLinkService.removePendingLink(link.id);
      setPendingLinks(prev => prev.filter(l => l.id !== link.id));
    } catch (error) {
      console.error('Failed to add note to board:', error);
      Alert.alert('오류', '노트 추가에 실패했습니다.');
    }
  };

  const handlePendingLinkDismiss = (linkId: string) => {
    pendingLinkService.removePendingLink(linkId);
    setPendingLinks(prev => prev.filter(l => l.id !== linkId));
  };

  return (
    <SafeAreaView style={styles['main-safeArea']} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF3FF" />

      <View style={styles['main-header']}>
        {isSearchMode ? (
          <>
            <TouchableOpacity onPress={() => { setIsSearchMode(false); setSearchText(''); }} style={styles['main-header-profileButton']}>
              <Text style={{ fontSize: 20, color: '#588DFF' }}>←</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles['main-inputBar-input'], { marginHorizontal: 8, flex: 1 }]}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="메모, 보드 검색..."
              placeholderTextColor="#AABBCC"
              autoFocus
            />
          </>
        ) : (
          <>
            <TouchableOpacity style={styles['main-header-profileButton']}>
              <Image
                source={require('../assets/imgs/mainart.png')}
                style={styles['main-header-profileButton-image']}
              />
            </TouchableOpacity>

            <Text style={styles['main-header-title']}>나와의 채팅</Text>

            <View style={styles['main-header-rightButtons']}>
              <TouchableOpacity
                style={styles['main-header-iconButton']}
                onPress={() => setIsSearchMode(true)}>
                <SearchIcon color="#1A1A1A" size={20} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles['main-header-iconButton'], selectedTags.length > 0 && { backgroundColor: '#E8EEFF' }]}
                onPress={() => setIsTagFilterVisible(true)}>
                <Text style={[{ fontSize: 12, fontWeight: '600', color: selectedTags.length > 0 ? '#588DFF' : '#1A1A1A' }]}>
                  필터
                </Text>
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
          </>
        )}
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
              paddingTop: 16,
              paddingHorizontal: 20,
              paddingBottom: Math.max(insets.bottom, 20),
              marginTop: 'auto',
              maxHeight: '70%',
            }}
            onStartShouldSetResponder={() => true}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1A1A', fontFamily: 'PretendardVariable' }}>
                태그 필터
              </Text>
              <TouchableOpacity onPress={() => setIsTagFilterVisible(false)}>
                <Text style={{ fontSize: 24, color: '#9DAFC8' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 16 }}>
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
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: selectedTags.includes(tag) ? '#588DFF' : '#F0F4FF',
                      borderWidth: selectedTags.includes(tag) ? 0 : 1,
                      borderColor: '#C0CDD8',
                    }}>
                    <Text style={{
                      fontSize: 13,
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
                <Text style={{ fontSize: 14, color: '#AABBCC', fontFamily: 'PretendardVariable', textAlign: 'center', paddingVertical: 20 }}>
                  사용 가능한 태그가 없습니다
                </Text>
              )}
            </ScrollView>

            {selectedTags.length > 0 && (
              <TouchableOpacity
                onPress={() => setSelectedTags([])}
                style={{
                  paddingVertical: 10,
                  alignItems: 'center',
                  borderTopWidth: 1,
                  borderTopColor: '#E8EEF8',
                }}>
                <Text style={{ fontSize: 14, color: '#9DAFC8', fontWeight: '600', fontFamily: 'PretendardVariable' }}>
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
        onClose={() => setSideMenuVisible(false)}
        onSettings={() => {}}
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

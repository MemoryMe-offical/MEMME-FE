import React, { useRef, useState, useEffect } from 'react';
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
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import { BoardPost, ChatBoardItem, ChatMessage, OgData } from '../types/chatBoard.type';
import ChatMessageItem from '../components/chat/ChatMessageItem';
import BoardPostCard from '../components/board/BoardPostCard';
import ContextMenu from '../components/common/ContextMenu';
import SideMenu from '../components/common/SideMenu';
import { HamburgerIcon, PlusIcon, SearchIcon, SendIcon } from '../components/common/Icons';
import { mainStyles as styles } from '../styles/MainScreen.styles';
import type { RootStackParamList } from '../navigation/RootNavigator';

const initItems: ChatBoardItem[] = [
  {
    id: '1',
    userId: '24',
    type: 'chat',
    bookMark: false,
    text: '코딩 공부하기',
    createdAt: new Date(2026, 1, 25, 9, 15, 0).toISOString(),
  },
  {
    id: '2',
    userId: '24',
    type: 'post',
    bookMark: true,
    title: '수학교육 과동아리',
    content: '',
    subItems: [
      { id: '2-1', title: '여름 MT', content: '🏕 MT 추가요금 공지\nMT 정산 과정에서 비용 변동으로 1인당 추가요금 4,115원이 발생했습니다.\n번거롭겠지만 아래 계좌로 추가 입금 부탁드립니다...' },
      { id: '2-2', title: '수학 모임', content: '이번 주 수학 모임은 화요일 오후 6시 도서관 2층에서 진행됩니다.' },
      { id: '2-3', title: '잼얘즈', content: '잼있는 얘기들 공유하는 채널입니다. 자유롭게 올려주세요!' },
    ],
    createdAt: new Date(2026, 1, 25, 10, 0, 0).toISOString(),
  },
  {
    id: '3',
    userId: '24',
    type: 'chat',
    bookMark: false,
    text: '리액트 네이티브 강의 수강하기!',
    createdAt: new Date(2026, 1, 25, 11, 30, 0).toISOString(),
  },
  {
    id: '4',
    userId: '24',
    type: 'chat',
    bookMark: false,
    text: '결혼식 2월 31일 오후 12시',
    createdAt: new Date(2026, 1, 25, 12, 47, 0).toISOString(),
  },
  {
    id: '5',
    userId: '24',
    type: 'post',
    bookMark: false,
    title: '운동 루틴 메모',
    content: '월·수·금: 헬스장 하체 위주\n화·목: 홈트 30분 + 스트레칭\n주말: 한강 자전거 or 등산',
    createdAt: new Date(2026, 1, 25, 14, 20, 0).toISOString(),
  },
  {
    id: '6',
    userId: '24',
    type: 'chat',
    bookMark: false,
    text: '내일 팀 발표 준비 마저 하기. 슬라이드 7장까지 완성했고 마무리 멘트만 남았음',
    createdAt: new Date(2026, 1, 25, 17, 52, 0).toISOString(),
  },
  {
    id: '7',
    userId: '24',
    type: 'post',
    bookMark: false,
    title: '여행 계획 메모',
    content: '3월 여행 일정 정리\n\n1일차: 인천 출발 → 오사카 도착, 난바 숙소 체크인, 도톤보리 저녁\n2일차: 유니버설 스튜디오 재팬 종일\n3일차: 교토 당일치기 (금각사, 아라시야마, 기온)\n4일차: 오사카 쇼핑 (신사이바시, 아메리카무라) → 귀국',
    createdAt: new Date(2026, 1, 26, 9, 0, 0).toISOString(),
  },
  {
    id: '8',
    userId: '24',
    type: 'post',
    bookMark: false,
    title: '스터디 그룹',
    content: '',
    subItems: [
      { id: '8-1', title: '알고리즘 스터디', content: '매주 목요일 오후 8시 온라인 진행입니다.\n이번 주 주제: 그래프 탐색 (BFS/DFS)\n풀어올 문제: 백준 1260, 2178' },
      { id: '8-2', title: '리액트 스터디', content: '다음 주부터 React Query 챕터 시작합니다. 사전에 공식 문서 읽어오시면 좋아요!' },
    ],
    createdAt: new Date(2026, 1, 26, 11, 0, 0).toISOString(),
  },
  {
    id: '9',
    userId: '24',
    type: 'post',
    bookMark: true,
    title: '아이디어 메모 (내용 미작성)',
    content: '',
    createdAt: new Date(2026, 1, 26, 13, 30, 0).toISOString(),
  },
  {
    id: '10',
    userId: '24',
    type: 'post',
    bookMark: false,
    title: '동아리 공지 모음',
    content: '',
    subItems: [
      { id: '10-1', title: '정기 모임 안내', content: '이번 달 정기 모임은 3월 15일 토요일 오후 2시입니다. 장소는 학생회관 3층 세미나실입니다.' },
      { id: '10-2', title: '회비 납부 안내', content: '3월 회비 납부 기한은 이번 주 금요일까지입니다. 계좌번호는 채팅으로 별도 안내드립니다.' },
      { id: '10-3', title: '신입 부원 모집', content: '4월 신입 부원 모집을 시작합니다. 관심 있는 친구들에게 홍보 부탁드려요!' },
      { id: '10-4', title: '종강 파티 투표', content: '종강 파티 날짜 투표 링크를 공유합니다. 24일까지 참여해 주세요.' },
    ],
    createdAt: new Date(2026, 1, 26, 15, 0, 0).toISOString(),
  },
];

// OG 메타데이터 fetch
const fetchOgData = async (url: string): Promise<OgData> => {
  try {
    const res = await fetch(url);
    const html = await res.text();

    const getMeta = (property: string): string => {
      const match =
        html.match(new RegExp(`<meta[^>]+property=["']og:${property}["'][^>]+content=["']([^"']+)["']`, 'i')) ||
        html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${property}["']`, 'i'));
      return match?.[1] ?? '';
    };

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

    return {
      title: getMeta('title') || titleMatch?.[1] || url,
      description: getMeta('description'),
      imageUrl: getMeta('image'),
      siteName: getMeta('site_name'),
    };
  } catch {
    return { title: url };
  }
};

const MainScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Main'>>();
  const [items, setItems] = useState<ChatBoardItem[]>(initItems);
  const [inputText, setInputText] = useState('');
  const [contextMenuItem, setContextMenuItem] = useState<ChatBoardItem | null>(null);
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const flatListRef = useRef<FlatList<ChatBoardItem>>(null);
  const shouldScrollToEnd = useRef(false);
  const { SharedDefaultsModule } = NativeModules;
  const nativeShareModule =
  Platform.OS === 'ios'
    ? NativeModules.SharedDefaultsModule
    : NativeModules.SharedIntentModule;

  const handleSharedUrl = async (url: string) => {
    console.log('handleSharedUrl 호출됨:', url);
  
    const ogData = await fetchOgData(url);
  
    const newItem: BoardPost = {
      id: Date.now().toString(),
      userId: '24',
      type: 'post',
      bookMark: false,
      title: ogData.title || url,
      content: ogData.description || '',
      url,
      ogData,
      createdAt: new Date().toISOString(),
    };
  
    shouldScrollToEnd.current = true;
    setItems(prev => [...prev, newItem]);
  };
  
  useEffect(() => {
    const getShared = async () => {
      const url = await nativeShareModule?.getSharedURL();
  
      console.log('🔥 RN에서 받은 값:', url);
  
      if (typeof url === 'string' && url.startsWith('http')) {
        await handleSharedUrl(url);
        await nativeShareModule?.clearSharedURL();
      }
    };
  
    getShared();
  
    const sub = AppState.addEventListener('change', (state) => {
      console.log('AppState changed:', state);
      if (state === 'active') {
        getShared();
      }
    });
  
    return () => sub.remove();
  }, []);

  // ── 컨텍스트 메뉴 ──
  const handleContextMenu = (item: ChatBoardItem) => setContextMenuItem(item);
  const handleCloseContextMenu = () => setContextMenuItem(null);

  const handleContextCopy = () => {
    if (!contextMenuItem) return;
    const text =
      contextMenuItem.type === 'chat'
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
    if (contextMenuItem.type === 'chat') {
      const chat = contextMenuItem as ChatMessage;
      const newPost: BoardPost = {
        id: chat.id,
        userId: chat.userId,
        type: 'post',
        bookMark: chat.bookMark,
        title: chat.text,
        content: '',
        createdAt: chat.createdAt,
      };
      setItems(prev => prev.map(item => item.id === chat.id ? newPost : item));
    } else {
      const post = contextMenuItem as BoardPost;
      Alert.alert(
        '채팅으로 변환',
        '정말 채팅으로 변환하시겠습니까? 채팅으로 변환한다면, 제목을 제외한 모든 내용이 삭제됩니다.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '변환',
            style: 'destructive',
            onPress: () => {
              setItems(prev =>
                prev.map(item =>
                  item.id === post.id
                    ? {
                        id: post.id,
                        userId: post.userId,
                        type: 'chat' as const,
                        bookMark: post.bookMark,
                        text: post.title,
                        createdAt: post.createdAt,
                      }
                    : item,
                ),
              );
            },
          },
        ],
      );
    }
  };

  const handleContextDelete = () => {
    if (!contextMenuItem) return;
    const id = contextMenuItem.id;
    Alert.alert(
      '삭제',
      '정말 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => setItems(prev => prev.filter(item => item.id !== id)),
        },
      ],
    );
  };

  // ── 상세 스크린 ──
  const handleDetailPress = (post: BoardPost, subItemId?: string) => {
    navigation.navigate('BoardPostDetail', {
      post,
      subItemId,
      onSave: (updated: BoardPost) => {
        setItems(prev => prev.map(item => item.id === updated.id ? updated : item));
      },
    });
  };

  // ── 사이드 메뉴 북마크 탭 ──
  const handleBookmarkPress = (item: ChatBoardItem) => {
    if (item.type === 'post') {
      navigation.navigate('BoardPostDetail', {
        post: item as BoardPost,
        onSave: (updated: BoardPost) => {
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

  // ── 새 채팅 전송 ──
  const handleSend = () => {
    if (!inputText.trim()) return;
    const newItem: ChatBoardItem = {
      id: Date.now().toString(),
      userId: '24',
      type: 'chat',
      bookMark: false,
      text: inputText.trim(),
      createdAt: new Date().toISOString(),
    };
    shouldScrollToEnd.current = true;
    setItems(prev => [...prev, newItem]);
    setInputText('');
  };

  // 링크 형식
  const getDomainFromUrl = (url?: string) => {
    if (!url) return '';
  
    const match = url.match(/^https?:\/\/(?:www\.)?([^/]+)/i);
    return match?.[1] ?? url;
  };
  
  const LinkPreviewItem = ({
    item,
    onLongPress,
  }: {
    item: BoardPost;
    onLongPress: (item: ChatBoardItem) => void;
  }) => {
    const domain = getDomainFromUrl(item.url);
    const hasPreview = !!item.ogData?.imageUrl;
  
    if (!item.url) return null;
  
    // 썸네일 없으면 링크만
    if (!hasPreview) {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => Linking.openURL(item.url!)}
          onLongPress={() => onLongPress(item)}
          style={{
            alignSelf: 'flex-end',
            maxWidth: '78%',
            marginBottom: 10,
            backgroundColor: '#F7E600',
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 18,
          }}
        >
          <Text
            style={{
              color: '#1B1B1B',
              fontSize: 15,
              textDecorationLine: 'underline',
            }}
          >
            {item.url}
          </Text>
        </TouchableOpacity>
      );
    }
  
    // 썸네일 있으면 카톡 스타일
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => Linking.openURL(item.url!)}
        onLongPress={() => onLongPress(item)}
        style={{
          alignSelf: 'flex-end',
          width: 270,
          marginBottom: 10,
          borderRadius: 18,
          overflow: 'hidden',
          backgroundColor: '#2F2F2F',
        }}
      >
        <Image
          source={{ uri: item.ogData?.imageUrl }}
          style={{
            width: '100%',
            height: 180,
            backgroundColor: '#D9D9D9',
          }}
          resizeMode="cover"
        />
  
        <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
          {!!item.title && item.title !== item.url && (
            <Text
              numberOfLines={1}
              style={{
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: '700',
                marginBottom: 6,
              }}
            >
              {item.title}
            </Text>
          )}
  
          {!!item.content && (
            <Text
              numberOfLines={2}
              style={{
                color: '#BDBDBD',
                fontSize: 14,
                marginBottom: 8,
              }}
            >
              {item.content}
            </Text>
          )}
  
          <Text
            numberOfLines={1}
            style={{
              color: '#4DA3FF',
              fontSize: 15,
              textDecorationLine: 'underline',
            }}
          >
            {domain}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };


  return (
    <View style={styles['main-safeArea']}>
      {/* 헤더 */}
      <View style={[styles['main-header'], { paddingTop: 12 + insets.top }]}>
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
          <TouchableOpacity
            style={styles['main-header-iconButton']}
            onPress={() => setSideMenuVisible(true)}>
            <HamburgerIcon color="#1A1A1A" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles['main-body']}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles['main-content']}>
          <View style={styles['main-watermark']} pointerEvents="none">
            <Image
              source={require('../assets/imgs/mainlogo.png')}
              style={styles['main-watermark-image']}
            />
          </View>

          <FlatList<ChatBoardItem>
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
              if (item.type === 'chat') {
                return (
                  <ChatMessageItem
                    item={item}
                    onLongPress={handleContextMenu}
                  />
                );
              }
            
              if (item.url) {
                return (
                  <LinkPreviewItem
                    item={item as BoardPost}
                    onLongPress={handleContextMenu}
                  />
                );
              }
            
              return (
                <BoardPostCard
                  item={item}
                  onContextMenu={handleContextMenu}
                  onDetailPress={handleDetailPress}
                />
              );
            }}
          />
        </View>

        <View style={[styles['main-inputBar'], { paddingBottom: 10 + insets.bottom }]}>
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
            onPress={handleSend}>
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
        itemType={contextMenuItem?.type ?? 'chat'}
        isBookmarked={contextMenuItem?.bookMark ?? false}
        onCopy={handleContextCopy}
        onBookmark={handleContextBookmark}
        onConvert={handleContextConvert}
        onDelete={handleContextDelete}
        onClose={handleCloseContextMenu}
      />
    </View>
  );
};

export default MainScreen;
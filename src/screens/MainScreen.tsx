import React, { useRef, useState } from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { BoardPost, ChatBoardItem, ChatMessage } from '../types/chatBoard.type';
import ChatMessageItem from '../components/chat/ChatMessageItem';
import BoardPostItem from '../components/board/BoardPostItem';
import BoardPostBottomSheet from '../components/board/BoardPostBottomSheet';
import BoardPostEditModal from '../components/board/BoardPostEditModal';
import ContextMenu from '../components/common/ContextMenu';
import SideMenu from '../components/common/SideMenu';
import { HamburgerIcon, PlusIcon, SearchIcon, SendIcon } from '../components/common/Icons';
import { mainStyles as styles } from '../styles/MainScreen.styles';

// 테스트용 하드코딩 데이터
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
    title: '2월 독서 기록',
    content: '어린왕자, 채식주의자, 불편한 편의점 완독.',
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
];

const MainScreen = () => {
  const [items, setItems] = useState<ChatBoardItem[]>(initItems);
  const [inputText, setInputText] = useState('');
  const [selectedPost, setSelectedPost] = useState<BoardPost | null>(null);
  const [editingPost, setEditingPost] = useState<BoardPost | null>(null);
  const [contextMenuItem, setContextMenuItem] = useState<ChatBoardItem | null>(null);
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const flatListRef = useRef<FlatList<ChatBoardItem>>(null);

  // ── 게시물 바텀시트 ──
  const handlePostPress = (post: BoardPost) => setSelectedPost(post);
  const handleCloseSheet = () => setSelectedPost(null);

  // ── 게시물 수정 모달 ──
  const handleOpenEdit = () => setEditingPost(selectedPost);
  const handleCloseEdit = () => setEditingPost(null);
  const handleSaveEdit = (updated: BoardPost) => {
    setItems(prev => prev.map(item => item.id === updated.id ? updated : item));
    setSelectedPost(updated); // 바텀시트도 업데이트된 내용으로 갱신
    setEditingPost(null);
  };

  // ── 롱프레스 컨텍스트 메뉴 ──
  const handleLongPress = (item: ChatBoardItem) => setContextMenuItem(item);
  const handleCloseContextMenu = () => setContextMenuItem(null);

  const handleContextCopy = () => {
    if (!contextMenuItem) {
      return;
    }
    const text =
      contextMenuItem.type === 'chat'
        ? contextMenuItem.text
        : contextMenuItem.title;
    Alert.alert('복사됨', text);
  };

  const handleContextBookmark = () => {
    if (!contextMenuItem) {
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.id === contextMenuItem.id
          ? { ...item, bookMark: !item.bookMark }
          : item,
      ),
    );
  };

  const handleContextConvert = () => {
    if (!contextMenuItem) {
      return;
    }
    if (contextMenuItem.type === 'chat') {
      // 채팅 → 게시물: 비파괴적, Alert 없이 바로 변환 후 바텀시트 오픈
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
      setSelectedPost(newPost); // 바텀시트 자동 오픈 (편집 유도)
    } else {
      // 게시물 → 채팅: 파괴적, Alert 확인 필요
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
    if (!contextMenuItem) {
      return;
    }
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

  // ── 사이드 메뉴 북마크 탭 ──
  const handleBookmarkPress = (item: ChatBoardItem) => {
    if (item.type === 'post') {
      setSelectedPost(item as BoardPost);
    } else {
      const index = items.findIndex(i => i.id === item.id);
      if (index !== -1) {
        flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      }
    }
  };

  // ── 새 채팅 전송 ──
  const handleSend = () => {
    if (!inputText.trim()) {
      return;
    }
    const newItem: ChatBoardItem = {
      id: Date.now().toString(),
      userId: '24',
      type: 'chat',
      bookMark: false,
      text: inputText.trim(),
      createdAt: new Date().toISOString(),
    };
    setItems(prev => [...prev, newItem]);
    setInputText('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <View style={styles['main-safeArea']}>
      {/* 헤더 */}
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
          <TouchableOpacity
            style={styles['main-header-iconButton']}
            onPress={() => setSideMenuVisible(true)}>
            <HamburgerIcon color="#1A1A1A" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles['main-body']}
        behavior="padding">
        {/* 채팅 영역 (워터마크 + 메시지 리스트) */}
        <View style={styles['main-content']}>
          {/* 배경 워터마크 */}
          <View style={styles['main-watermark']} pointerEvents="none">
            <Image
              source={require('../assets/imgs/mainlogo.png')}
              style={styles['main-watermark-image']}
            />
          </View>

          {/* 메시지 리스트 */}
          <FlatList<ChatBoardItem>
            ref={flatListRef}
            data={items}
            keyExtractor={item => item.id}
            contentContainerStyle={styles['main-listContent']}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            renderItem={({ item }) => {
              if (item.type === 'chat') {
                return (
                  <ChatMessageItem
                    item={item}
                    onLongPress={handleLongPress}
                  />
                );
              }
              return (
                <BoardPostItem
                  item={item}
                  onPress={handlePostPress}
                  onLongPress={handleLongPress}
                />
              );
            }}
          />
        </View>

        {/* 입력 바 */}
        <View style={styles['main-inputBar']}>
          <TouchableOpacity style={styles['main-inputBar-plusButton']}>
            <PlusIcon color="#888" size={22} />
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

      <BoardPostBottomSheet
        post={selectedPost}
        onClose={handleCloseSheet}
        onEdit={handleOpenEdit}
      />

      <BoardPostEditModal
        post={editingPost}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
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

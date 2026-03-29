// 게시물 상세 스크린

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { BoardPost } from '../types/chatBoard.type';
import BoardPostEditModal from '../components/board/BoardPostEditModal';
import { ArrowLeftIcon, EditIcon } from '../components/common/Icons';

type Props = NativeStackScreenProps<RootStackParamList, 'BoardPostDetail'>;

const BoardPostDetailScreen = ({ route, navigation }: Props) => {
  const { post: initialPost, subItemId, onSave } = route.params;
  const [post, setPost] = useState<BoardPost>(initialPost);
  const [editingPost, setEditingPost] = useState<BoardPost | null>(null);

  const subItem = subItemId
    ? post.subItems?.find(s => s.id === subItemId)
    : null;

  const displayTitle = subItem ? subItem.title : post.title;
  const displayContent = subItem ? subItem.content : post.content;

  const handleSave = (updated: BoardPost) => {
    setPost(updated);
    setEditingPost(null);
    onSave?.(updated);
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <ArrowLeftIcon color="#1A1A1A" size={22} />
        </TouchableOpacity>
        <Text style={styles['header-title']} numberOfLines={1}>
          {displayTitle}
        </Text>
        <TouchableOpacity onPress={() => setEditingPost(post)} hitSlop={8}>
          <EditIcon color="#588DFF" size={20} />
        </TouchableOpacity>
      </View>

      {/* 본문 */}
      <ScrollView style={styles.body} contentContainerStyle={styles['body-content']}>
        <Text style={styles['content-label']}>내용</Text>
        <Text style={styles['content-text']}>{displayContent}</Text>
      </ScrollView>

      {/* 수정 모달 */}
      <BoardPostEditModal
        post={editingPost}
        onClose={() => setEditingPost(null)}
        onSave={handleSave}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEF8',
    gap: 12,
  },
  'header-title': {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },
  body: {
    flex: 1,
  },
  'body-content': {
    padding: 20,
  },
  'content-label': {
    fontSize: 12,
    fontWeight: '600',
    color: '#8899AA',
    fontFamily: 'PretendardVariable',
    marginBottom: 8,
  },
  'content-text': {
    fontSize: 15,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    lineHeight: 24,
  },
});

export default BoardPostDetailScreen;

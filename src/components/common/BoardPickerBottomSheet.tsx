import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Board } from '../../types';
import { CloseIcon, SearchIcon } from './Icons';
import * as timelineService from '../../services/timelineService';

interface BoardPickerBottomSheetProps {
  visible: boolean;
  title: string;
  boards?: Board[];
  excludeBoardId?: string;
  onSelect: (board: Board) => void;
  onClose: () => void;
  onCreateNewBoard?: () => void;
  isLoading?: boolean;
}

const formatRelativeTime = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks}주 전`;
  return `${Math.floor(diffDays / 30)}달 전`;
};

const BoardPickerBottomSheet = ({
  visible,
  title,
  boards: initialBoards,
  excludeBoardId,
  onSelect,
  onClose,
  onCreateNewBoard,
  isLoading = false,
}: BoardPickerBottomSheetProps) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [boards, setBoards] = useState<Board[]>(initialBoards ?? []);

  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      loadBoards();
    }
  }, [visible]);

  const loadBoards = async () => {
    try {
      const data = await timelineService.fetchTimeline({
        type: 'board',
        sort: 'updatedAt',
      });
      const allBoards = (Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : [])) as Board[];
      setBoards(allBoards.length > 0 ? allBoards : (initialBoards ?? []));
    } catch {
      // console.error('Failed to load boards:', error);
      setBoards(initialBoards ?? []);
    }
  };

  const filteredBoards = (boards ?? [])
    .filter(b => b.id !== excludeBoardId)
    .filter(b =>
      searchQuery.trim()
        ? b.title.toLowerCase().includes(searchQuery.toLowerCase())
        : true,
    )
    // 최근 수정순
    .sort((a, b) => {
      const aTime = a.updatedAt ?? a.createdAt;
      const bTime = b.updatedAt ?? b.createdAt;
      return bTime.localeCompare(aTime);
    });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity
          style={styles['modal-overlay']}
          activeOpacity={1}
          onPress={onClose}>
          <View
            style={[styles['modal-sheet'], { paddingBottom: 20 }]}
            onStartShouldSetResponder={() => true}>
            <View style={styles['modal-handle']} />

            {/* 헤더 */}
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={8}>
                <CloseIcon color="#9DAFC8" size={20} />
              </TouchableOpacity>
            </View>

            {/* 검색 */}
            <View style={styles['search-row']}>
              <SearchIcon color="#AABBCC" size={16} />
              <TextInput
                style={styles['search-input']}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="보드 검색..."
                placeholderTextColor="#AABBCC"
                returnKeyType="search"
              />
            </View>

            {/* 새 보드 만들기 버튼 */}
            {onCreateNewBoard && (
              <TouchableOpacity
                style={[styles['create-board-btn'], isLoading && styles['create-board-btn-disabled']]}
                onPress={onCreateNewBoard}
                disabled={isLoading}
                activeOpacity={0.7}>
                <Text style={styles['create-board-btn-text']}>+ 새 보드 만들기</Text>
              </TouchableOpacity>
            )}

            {/* 정렬 레이블 */}
            <Text style={styles['sort-label']}>최근 수정순</Text>

            {/* 보드 목록 */}
            <ScrollView
              style={styles['board-list']}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {filteredBoards.length === 0 ? (
                <Text style={styles['empty-text']}>
                  {searchQuery.trim() ? '검색 결과가 없습니다.' : '보드가 없습니다.'}
                </Text>
              ) : (
                filteredBoards.map(board => (
                  <TouchableOpacity
                    key={board.id}
                    style={[styles['board-item'], isLoading && styles['board-item-disabled']]}
                    onPress={() => onSelect(board)}
                    disabled={isLoading}
                    activeOpacity={0.7}>
                    <Text style={styles['board-item-title']} numberOfLines={1}>
                      {board.title}
                    </Text>
                    <Text style={styles['board-item-time']}>
                      {formatRelativeTime(board.updatedAt ?? board.createdAt)}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  'modal-overlay': {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  'modal-sheet': {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    maxHeight: '75%',
  },
  'modal-handle': {
    width: 40,
    height: 4,
    backgroundColor: '#E0E8F8',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },
  'search-row': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F5F8FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4ECFF',
    marginBottom: 12,
  },
  'search-input': {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    padding: 0,
  },
  'sort-label': {
    fontSize: 12,
    fontWeight: '600',
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  'board-list': {
    maxHeight: 280,
  },
  'board-item': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4FF',
  },
  'board-item-disabled': {
    opacity: 0.5,
  },
  'board-item-title': {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    marginRight: 8,
  },
  'board-item-time': {
    fontSize: 12,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
  },
  'empty-text': {
    fontSize: 14,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
    textAlign: 'center',
    paddingVertical: 24,
  },
  'create-board-btn': {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#EEF4FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C8D9FF',
    alignItems: 'center',
    marginBottom: 12,
  },
  'create-board-btn-text': {
    fontSize: 14,
    fontWeight: '600',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },
  'create-board-btn-disabled': {
    opacity: 0.5,
  },
});

export default BoardPickerBottomSheet;

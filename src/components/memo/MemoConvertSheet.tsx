import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Board, Memo } from '../../types';
import TagInput from '../common/TagInput';
import { ArrowLeftIcon, CloseIcon, SearchIcon, PlusCircleIcon } from '../common/Icons';
import * as memoConvertService from '../../services/memoConvertService';
import * as memoService from '../../services/memoService';

type Step = 'list' | 'new-board' | 'add-to-board';

interface MemoConvertSheetProps {
  visible: boolean;
  memo: Memo;
  recentBoards: Board[];
  onSuccess: (memoId: string, targetBoard: Board) => void;
  onClose: () => void;
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

const MemoConvertSheet = ({
  visible,
  memo,
  recentBoards,
  onSuccess,
  onClose,
}: MemoConvertSheetProps) => {
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>('list');
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Step 2-A 폼 상태
  const [boardTitle, setBoardTitle] = useState('');
  const [boardTags, setBoardTags] = useState<string[]>([]);
  const [boardDescription, setBoardDescription] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');

  // Step 2-B 폼 상태
  const [addNoteTitle, setAddNoteTitle] = useState('');
  const [addNoteContent, setAddNoteContent] = useState('');

  // visible 전환마다 초기화
  useEffect(() => {
    if (visible) {
      setStep('list');
      setSelectedBoard(null);
      setSearchQuery('');
      setBoardTitle('');
      setBoardTags([]);
      setBoardDescription('');
      setNewNoteTitle(memo.text || '');
      setAddNoteTitle(memo.text || '');
      setAddNoteContent('');
    }
  }, [visible, memo.text]);

  const filteredBoards = searchQuery.trim()
    ? recentBoards.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : recentBoards;

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSelectNewBoard = () => {
    setBoardTitle('');
    setBoardTags([]);
    setBoardDescription('');
    setNewNoteTitle(memo.text || '');
    setStep('new-board');
  };

  const handleSelectExistingBoard = (board: Board) => {
    setSelectedBoard(board);
    setAddNoteTitle(memo.text || '');
    setAddNoteContent('');
    setStep('add-to-board');
  };

  const handleBack = () => {
    setStep('list');
    setSelectedBoard(null);
  };

  const handleCreateNewBoard = async () => {
    if (!boardTitle.trim()) {
      Alert.alert('알림', '보드 제목을 입력해주세요.');
      return;
    }
    if (!newNoteTitle.trim()) {
      Alert.alert('알림', '노트 이름을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. 새 보드 생성
      const newBoard = await memoConvertService.convertMemoToNewBoard(memo.id, {
        title: boardTitle.trim(),
        description: boardDescription.trim() || undefined,
        tags: boardTags.length > 0 ? boardTags : undefined,
        noteTitle: newNoteTitle.trim() || undefined,
        memoCreatedAt: memo.createdAt,
      });

      // 2. 메모 삭제 (백엔드에서 자동 삭제될 수 있으므로 에러 무시)
      try {
        await memoService.deleteMemo(memo.id);
      } catch {
        console.log('Memo already deleted by backend');
      }

      onSuccess(memo.id, newBoard);
      handleClose();
    } catch (error) {
      console.error('Failed to convert memo to new board:', error);
      Alert.alert('오류', '변환 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToBoard = async () => {
    if (!selectedBoard) return;
    if (!addNoteTitle.trim()) {
      Alert.alert('알림', '노트 이름을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. 메모를 기존 보드로 변환 (노트 추가)
      const updatedBoard = await memoConvertService.convertMemoToExistingBoard(
        memo.id,
        selectedBoard.id,
        {
          noteTitle: addNoteTitle.trim(),
          content: addNoteContent.trim() || undefined,
          memoCreatedAt: memo.createdAt,
        }
      );

      // 2. 메모 삭제 (백엔드에서 자동 삭제될 수 있으므로 에러 무시)
      try {
        await memoService.deleteMemo(memo.id);
      } catch {
        console.log('Memo already deleted by backend');
      }

      onSuccess(memo.id, updatedBoard);
      handleClose();
    } catch (error) {
      console.error('Failed to convert memo to existing board:', error);
      Alert.alert('오류', '추가 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}>
      {/* 배경 오버레이 — Step 1에서만 탭하여 닫기 */}
      <TouchableOpacity
        style={styles['modal-overlay']}
        activeOpacity={1}
        onPress={step === 'list' ? handleClose : undefined}>
        <View
          style={[styles['modal-sheet'], { paddingBottom: insets.bottom + 20 }]}
          onStartShouldSetResponder={() => true}>
          <View style={styles['modal-handle']} />

          {/* ── Step 1: 목적지 선택 ── */}
          {step === 'list' && (
            <>
              <View style={styles['sheet-header']}>
                <Text style={styles['sheet-title']}>보드로 변환</Text>
                <TouchableOpacity onPress={handleClose} hitSlop={8}>
                  <CloseIcon color="#9DAFC8" size={20} />
                </TouchableOpacity>
              </View>

              {/* 새 보드 만들기 */}
              <TouchableOpacity
                style={styles['new-board-btn']}
                onPress={handleSelectNewBoard}
                activeOpacity={0.7}>
                <PlusCircleIcon color="#588DFF" size={20} />
                <Text style={styles['new-board-btn-text']}>새 보드 만들기</Text>
              </TouchableOpacity>

              {/* 최근 보드 목록 */}
              <Text style={styles['section-label']}>최근 보드</Text>
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
                      style={styles['board-item']}
                      onPress={() => handleSelectExistingBoard(board)}
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

              {/* 보드 검색 */}
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
            </>
          )}

          {/* ── Step 2-A: 새 보드 만들기 ── */}
          {step === 'new-board' && (
            <>
              <View style={styles['sheet-header']}>
                <TouchableOpacity onPress={handleBack} hitSlop={8}>
                  <ArrowLeftIcon color="#1A1A1A" size={20} />
                </TouchableOpacity>
                <Text style={styles['sheet-title']}>새 보드 만들기</Text>
                <TouchableOpacity onPress={handleClose} hitSlop={8}>
                  <CloseIcon color="#9DAFC8" size={20} />
                </TouchableOpacity>
              </View>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <View style={styles['form-row']}>
                  <Text style={styles['form-label']}>
                    보드 제목 <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles['form-input']}
                    value={boardTitle}
                    onChangeText={setBoardTitle}
                    placeholder="보드 제목을 입력하세요"
                    placeholderTextColor="#AABBCC"
                    maxLength={100}
                  />
                </View>
                <View style={styles['form-row']}>
                  <Text style={styles['form-label']}>태그</Text>
                  <TagInput tags={boardTags} onChange={setBoardTags} />
                </View>
                <View style={styles['form-row']}>
                  <Text style={styles['form-label']}>설명</Text>
                  <TextInput
                    style={[styles['form-input'], styles['form-input-multiline']]}
                    value={boardDescription}
                    onChangeText={setBoardDescription}
                    placeholder="보드 설명 (선택)"
                    placeholderTextColor="#AABBCC"
                    multiline
                    textAlignVertical="top"
                  />
                </View>
                <View style={styles['form-row']}>
                  <Text style={styles['form-label']}>
                    첫 번째 노트 이름 <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles['form-input']}
                    value={newNoteTitle}
                    onChangeText={setNewNoteTitle}
                    placeholder="노트 이름"
                    placeholderTextColor="#AABBCC"
                    maxLength={200}
                  />
                </View>
                <TouchableOpacity
                  style={[
                    styles['confirm-btn'],
                    (!boardTitle.trim() || !newNoteTitle.trim() || isLoading) &&
                      styles['confirm-btn-disabled'],
                  ]}
                  onPress={handleCreateNewBoard}
                  disabled={!boardTitle.trim() || !newNoteTitle.trim() || isLoading}
                  activeOpacity={0.8}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles['confirm-btn-text']}>보드 만들기</Text>
                  )}
                </TouchableOpacity>
                <View style={{ height: 8 }} />
              </ScrollView>
            </>
          )}

          {/* ── Step 2-B: 기존 보드에 추가 ── */}
          {step === 'add-to-board' && selectedBoard && (
            <>
              <View style={styles['sheet-header']}>
                <TouchableOpacity onPress={handleBack} hitSlop={8}>
                  <ArrowLeftIcon color="#1A1A1A" size={20} />
                </TouchableOpacity>
                <Text style={styles['sheet-title']} numberOfLines={1}>
                  [{selectedBoard.title}]에 추가
                </Text>
                <TouchableOpacity onPress={handleClose} hitSlop={8}>
                  <CloseIcon color="#9DAFC8" size={20} />
                </TouchableOpacity>
              </View>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <View style={styles['form-row']}>
                  <Text style={styles['form-label']}>
                    노트 이름 <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles['form-input']}
                    value={addNoteTitle}
                    onChangeText={setAddNoteTitle}
                    placeholder="노트 이름"
                    placeholderTextColor="#AABBCC"
                    maxLength={200}
                  />
                </View>
                <View style={styles['form-row']}>
                  <Text style={styles['form-label']}>내용</Text>
                  <TextInput
                    style={[styles['form-input'], styles['form-input-multiline']]}
                    value={addNoteContent}
                    onChangeText={setAddNoteContent}
                    placeholder="내용 (선택)"
                    placeholderTextColor="#AABBCC"
                    multiline
                    textAlignVertical="top"
                  />
                </View>
                <TouchableOpacity
                  style={[
                    styles['confirm-btn'],
                    (!addNoteTitle.trim() || isLoading) && styles['confirm-btn-disabled'],
                  ]}
                  onPress={handleAddToBoard}
                  disabled={!addNoteTitle.trim() || isLoading}
                  activeOpacity={0.8}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles['confirm-btn-text']}>추가</Text>
                  )}
                </TouchableOpacity>
                <View style={{ height: 8 }} />
              </ScrollView>
            </>
          )}
        </View>
      </TouchableOpacity>
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
    maxHeight: '80%',
  },
  'modal-handle': {
    width: 40,
    height: 4,
    backgroundColor: '#E0E8F8',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  'sheet-header': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  'sheet-title': {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  'new-board-btn': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#EEF4FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8D9FF',
    marginBottom: 16,
  },
  'new-board-btn-text': {
    fontSize: 15,
    fontWeight: '600',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },
  'section-label': {
    fontSize: 12,
    fontWeight: '600',
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  'board-list': {
    maxHeight: 200,
    marginBottom: 12,
  },
  'board-item': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4FF',
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
    paddingVertical: 20,
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
  },
  'search-input': {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    padding: 0,
  },
  'form-row': {
    marginBottom: 16,
  },
  'form-label': {
    fontSize: 12,
    fontWeight: '600',
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  required: {
    color: '#FF3B30',
  },
  'form-input': {
    fontSize: 15,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    borderWidth: 1,
    borderColor: '#E4ECFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FAFCFF',
  },
  'form-input-multiline': {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  'form-divider': {
    height: 1,
    backgroundColor: '#E8EEF8',
    marginVertical: 8,
  },
  'confirm-btn': {
    backgroundColor: '#588DFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  'confirm-btn-disabled': {
    backgroundColor: '#C0CDD8',
  },
  'confirm-btn-text': {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'PretendardVariable',
  },
});

export default MemoConvertSheet;

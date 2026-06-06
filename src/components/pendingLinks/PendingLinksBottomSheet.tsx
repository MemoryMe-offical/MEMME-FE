import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Board, PendingLink, OgData } from '../../types';
import OgPreviewCard from '../note/OgPreviewCard';
import BoardPickerBottomSheet from '../common/BoardPickerBottomSheet';
import { CloseIcon, ArrowLeftIcon } from '../common/Icons';
import { fetchOgData } from '../../services/ogService';
import * as boardService from '../../services/boardService';

interface PendingLinksBottomSheetProps {
  visible: boolean;
  pendingLinks: PendingLink[];
  boards: Board[];
  onAddToBoard: (pendingLink: PendingLink, targetBoard: Board) => Promise<void>;
  onDismiss: (pendingLinkId: string) => Promise<void>;
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

const PendingLinksBottomSheet = ({
  visible,
  pendingLinks,
  boards,
  onAddToBoard,
  onDismiss,
  onClose,
}: PendingLinksBottomSheetProps) => {
  const insets = useSafeAreaInsets();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activePendingLink, setActivePendingLink] = useState<PendingLink | null>(null);
  const [ogDataCache, setOgDataCache] = useState<Record<string, OgData>>({});
  const [loadingUrls, setLoadingUrls] = useState<Set<string>>(new Set());

  // 새 보드 만들기 상태
  const [showNewBoardForm, setShowNewBoardForm] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);

  // 링크가 변경될 때 OG 데이터 로드
  useEffect(() => {
    const loadOgData = async () => {
      const newUrls = pendingLinks.filter(
        link => !link.ogData && !ogDataCache[link.url] && !loadingUrls.has(link.url)
      );

      if (newUrls.length === 0) return;

      setLoadingUrls(prev => new Set([...prev, ...newUrls.map(l => l.url)]));

      for (const link of newUrls) {
        try {
          const ogData = await fetchOgData(link.url);
          setOgDataCache(prev => ({
            ...prev,
            [link.url]: ogData,
          }));
        } catch (error) {
          console.error('Failed to load OG data:', link.url, error);
        }
      }

      setLoadingUrls(prev => {
        const updated = new Set(prev);
        newUrls.forEach(l => updated.delete(l.url));
        return updated;
      });
    };

    loadOgData();
  }, [pendingLinks, ogDataCache, loadingUrls]);

  const handleAddPress = (link: PendingLink) => {
    setActivePendingLink(link);
    onClose(); // 현재 모달 먼저 닫기
    setTimeout(() => setPickerVisible(true), 350); // 닫힘 애니메이션 끝나고 열기
  };

  const handleBoardSelect = async (board: Board) => {
    if (!activePendingLink) return;
    try {
      await onAddToBoard(activePendingLink, board);
    } finally {
      setPickerVisible(false);
      setActivePendingLink(null);
    }
  };

  const handlePickerClose = () => {
    setPickerVisible(false);
    setActivePendingLink(null);
  };

  const handleCreateNewBoardPress = () => {
    setPickerVisible(false);
    setShowNewBoardForm(true);
    setNewBoardName('');
  };

  const handleCreateNewBoard = async () => {
    if (!newBoardName.trim() || !activePendingLink) return;

    setIsCreatingBoard(true);
    try {
      const newBoard = await boardService.createBoard({
        title: newBoardName.trim(),
      });

      // 새 보드에 링크 추가
      await onAddToBoard(activePendingLink, newBoard);
      setShowNewBoardForm(false);
      setNewBoardName('');
      setActivePendingLink(null);
    } catch (error) {
      console.error('Failed to create board:', error);
    } finally {
      setIsCreatingBoard(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}>
        <TouchableOpacity
          style={styles['modal-overlay']}
          activeOpacity={1}
          onPress={onClose}>
          <View
            style={[styles['modal-sheet'], { paddingBottom: insets.bottom + 20 }]}
            onStartShouldSetResponder={() => true}>
            <View style={styles['modal-handle']} />

            {/* 헤더 */}
            <View style={styles.header}>
              <Text style={styles.title}>
                새로 들어온 링크
                {pendingLinks.length > 0 && (
                  <Text style={styles['title-count']}> ({pendingLinks.length})</Text>
                )}
              </Text>
              <TouchableOpacity onPress={onClose} hitSlop={8}>
                <CloseIcon color="#9DAFC8" size={20} />
              </TouchableOpacity>
            </View>

            {/* 링크 목록 */}
            <ScrollView
              style={styles['link-list']}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {pendingLinks.length === 0 ? (
                <Text style={styles['empty-text']}>새로 들어온 링크가 없습니다.</Text>
              ) : (
                pendingLinks.map(link => {
                  const hostname = link.url.match(/^(?:https?:\/\/)?([^/?#]+)/)?.[1] ?? link.url;
                  // 우선순위: 백엔드 ogData → 캐시된 ogData → hostname
                  const displayOgData = link.ogData ?? ogDataCache[link.url] ?? {
                    title: hostname,
                  };

                  return (
                    <View key={link.id} style={styles['link-item']}>
                      <OgPreviewCard url={link.url} ogData={displayOgData} />

                      <View style={styles['link-footer']}>
                        <Text style={styles['link-time']}>
                          {formatRelativeTime(link.receivedAt)}
                        </Text>
                        <View style={styles['link-actions']}>
                          <TouchableOpacity
                            style={styles['btn-dismiss']}
                            onPress={() => onDismiss && onDismiss(link.id)}
                            activeOpacity={0.7}>
                            <Text style={styles['btn-dismiss-text']}>무시</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles['btn-add']}
                            onPress={() => handleAddPress(link)}
                            activeOpacity={0.7}>
                            <Text style={styles['btn-add-text']}>추가</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 보드 선택 피커 */}
      <BoardPickerBottomSheet
        visible={pickerVisible}
        title="보드 선택"
        boards={boards}
        onSelect={handleBoardSelect}
        onClose={handlePickerClose}
        onCreateNewBoard={handleCreateNewBoardPress}
      />

      {/* 새 보드 만들기 모달 */}
      <Modal
        visible={showNewBoardForm}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!isCreatingBoard) setShowNewBoardForm(false);
        }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity
            style={styles['modal-overlay']}
            activeOpacity={1}
            onPress={() => {
              if (!isCreatingBoard) setShowNewBoardForm(false);
            }}>
            <View
              style={[styles['new-board-sheet'], { paddingBottom: insets.bottom + 20 }]}
              onStartShouldSetResponder={() => true}>
              <View style={styles['modal-handle']} />

              <View style={styles['new-board-header']}>
                <TouchableOpacity
                  onPress={() => {
                    if (!isCreatingBoard) setShowNewBoardForm(false);
                  }}
                  hitSlop={8}
                  disabled={isCreatingBoard}>
                  <ArrowLeftIcon color="#1A1A1A" size={20} />
                </TouchableOpacity>
                <Text style={styles['new-board-title']}>새 보드 만들기</Text>
                <View style={{ width: 20 }} />
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={styles['new-board-content']}>
                <Text style={styles['form-label']}>보드 이름</Text>
                <TextInput
                  style={styles['form-input']}
                  value={newBoardName}
                  onChangeText={setNewBoardName}
                  placeholder="보드 이름을 입력하세요"
                  placeholderTextColor="#AABBCC"
                  editable={!isCreatingBoard}
                  maxLength={100}
                  returnKeyType="done"
                  onSubmitEditing={handleCreateNewBoard}
                  autoFocus
                />
              </ScrollView>

              <View style={styles['new-board-footer']}>
                <TouchableOpacity
                  style={styles['cancel-btn']}
                  onPress={() => setShowNewBoardForm(false)}
                  disabled={isCreatingBoard}
                  activeOpacity={0.7}>
                  <Text style={styles['cancel-btn-text']}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles['confirm-btn'],
                    (!newBoardName.trim() || isCreatingBoard) && styles['confirm-btn-disabled'],
                  ]}
                  onPress={handleCreateNewBoard}
                  disabled={!newBoardName.trim() || isCreatingBoard}
                  activeOpacity={0.7}>
                  {isCreatingBoard ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles['confirm-btn-text']}>만들기</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },
  'title-count': {
    fontSize: 17,
    fontWeight: '700',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },
  'link-list': {
    maxHeight: 480,
  },
  'link-item': {
    marginBottom: 16,
    gap: 8,
  },
  'link-footer': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  'link-time': {
    fontSize: 12,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
  },
  'link-actions': {
    flexDirection: 'row',
    gap: 8,
  },
  'btn-dismiss': {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F4FF',
  },
  'btn-dismiss-text': {
    fontSize: 13,
    fontWeight: '600',
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
  },
  'btn-add': {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#588DFF',
  },
  'btn-add-text': {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'PretendardVariable',
  },
  'empty-text': {
    fontSize: 14,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
    textAlign: 'center',
    paddingVertical: 32,
  },
  'new-board-sheet': {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    maxHeight: '60%',
  },
  'modal-handle': {
    width: 40,
    height: 4,
    backgroundColor: '#E0E8F8',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  'new-board-header': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  'new-board-title': {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    flex: 1,
    textAlign: 'center',
  },
  'new-board-content': {
    marginBottom: 16,
  },
  'form-label': {
    fontSize: 12,
    fontWeight: '600',
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  'form-input': {
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
  },
  'new-board-footer': {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F4FF',
  },
  'cancel-btn': {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8EEF8',
    alignItems: 'center',
  },
  'cancel-btn-text': {
    fontSize: 14,
    fontWeight: '600',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },
  'confirm-btn': {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#588DFF',
    alignItems: 'center',
  },
  'confirm-btn-disabled': {
    backgroundColor: '#C0CDD8',
  },
  'confirm-btn-text': {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'PretendardVariable',
  },
});

export default PendingLinksBottomSheet;

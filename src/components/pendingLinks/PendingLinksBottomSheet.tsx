import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Board, PendingLink, OgData } from '../../types';
import OgPreviewCard from '../note/OgPreviewCard';
import BoardPickerBottomSheet from '../common/BoardPickerBottomSheet';
import { CloseIcon } from '../common/Icons';
import { fetchOgData } from '../../services/ogService';

interface PendingLinksBottomSheetProps {
  visible: boolean;
  pendingLinks: PendingLink[];
  boards: Board[];
  onAddToBoard: (pendingLink: PendingLink, targetBoard: Board) => void;
  onDismiss: (pendingLinkId: string) => void;
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
          console.log('🔥 OG 데이터 로드:', link.url);
          const ogData = await fetchOgData(link.url);
          console.log('🔥 OG 데이터 로드 완료:', ogData);
          setOgDataCache(prev => ({
            ...prev,
            [link.url]: ogData,
          }));
        } catch (error) {
          console.error('🔥 OG 데이터 로드 실패:', link.url, error);
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

  const handleBoardSelect = (board: Board) => {
    if (!activePendingLink) return;
    onAddToBoard(activePendingLink, board);
    setPickerVisible(false);
    setActivePendingLink(null);
  };

  const handlePickerClose = () => {
    setPickerVisible(false);
    setActivePendingLink(null);
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
                            onPress={() => onDismiss(link.id)}
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
      />
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
});

export default PendingLinksBottomSheet;

// 햄버거 메뉴 - 우측 슬라이드 패널

import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
  StatusBar,
  useWindowDimensions,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Board, TimelineItem, Memo, FileAttachment, OgData } from '../../types';
import { CloseIcon, EditIcon, SettingsIcon, ChevronRightIcon, FileIcon } from './Icons';
import { sideMenuStyles as styles } from '../../styles/SideMenu.styles';
import { fetchOgData } from '../../services/ogService';
import ImageViewerModal from './ImageViewerModal';
import LoadingImage from './LoadingImage';
import InAppBrowser from 'react-native-inappbrowser-reborn';

const MAX_DISPLAY_ITEMS = 4;

const SideMenuImageThumbnail = ({ imageUrl, onPress }: { imageUrl: string; onPress: () => void }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Image
        source={{ uri: imageUrl }}
        style={styles['sideMenu-mediaThumbnail']}
      />
    </TouchableOpacity>
  );
};

interface Props {
  visible: boolean;
  items: TimelineItem[];
  storageUsed?: number;
  onClose: () => void;
  onSettings: () => void;
  onBookmarkPress: (item: TimelineItem) => void;
  isBookmarkFilterActive?: boolean;
  onBookmarkFilterToggle?: (active: boolean) => void;
  onMediaGalleryPress?: (galleryType: 'images' | 'videos' | 'files' | 'links' | 'bookmarks') => void;
}

const SideMenu = ({ visible, items, storageUsed = 0, onClose, onSettings, onBookmarkPress, isBookmarkFilterActive, onBookmarkFilterToggle, onMediaGalleryPress }: Props) => {
  // 창 크기에 따라 실시간으로 다시 계산 (Mac에서는 창 크기를 조절할 수 있음)
  const { width: windowWidth, height: SCREEN_HEIGHT } = useWindowDimensions();
  const sideMenuWidth = windowWidth * 0.82;
  const slideAnim = useRef(new Animated.Value(sideMenuWidth)).current;
  const insets = useSafeAreaInsets();
  const panelTopInset =
    Platform.OS === 'android'
      ? Math.max(insets.top, StatusBar.currentHeight ?? 0)
      : insets.top;
  const [cachedOgData, setCachedOgData] = useState<{ [url: string]: OgData }>({});
  const [imageViewerState, setImageViewerState] = useState({
    visible: false,
    uris: [] as string[],
    index: 0,
  });

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(sideMenuWidth);
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('transparent');
      }
      Animated.spring(slideAnim, {
        toValue: 0,
        bounciness: 3,
        speed: 14,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim, sideMenuWidth]);

  const handleClose = () => {
    Animated.spring(slideAnim, {
      toValue: sideMenuWidth,
      bounciness: 3,
      speed: 14,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const bookmarkedItems = items.filter(item => item.bookmarked);

  // OG 데이터 자동 로드 (NoteDetailScreen과 동일한 방식)
  useEffect(() => {
    const loadOgDataForLinks = async () => {
      const boards = items.filter(i => i.type === 'board') as Board[];

      for (const board of boards) {
        for (const note of (board.notes ?? [])) {
          // 배열 형식의 URLs 처리
          if (note.urls && note.urls.length > 0) {
            for (let idx = 0; idx < note.urls.length; idx++) {
              const url = note.urls[idx];
              if (cachedOgData[url] || note.ogDatas?.[idx]) continue;

              try {
                const ogData = await fetchOgData(url);
                setCachedOgData(prev => ({
                  ...prev,
                  [url]: ogData,
                }));
              } catch {
                // console.error('Failed to fetch OG data for link:', url, error);
              }
            }
          } else if (note.url && !cachedOgData[note.url] && !note.ogData) {
            // 레거시 단수 형식 호환
            const noteUrl = note.url;
            try {
              const ogData = await fetchOgData(noteUrl);
              setCachedOgData(prev => ({
                ...prev,
                [noteUrl]: ogData,
              }));
            } catch {
              // console.error('Failed to fetch OG data for link:', note.url, error);
            }
          }
        }
      }
    };

    loadOgDataForLinks();
  }, [items]);

  // 모든 노트와 메모에서 이미지, 동영상, 파일, 링크 수집
  const mediaData = useMemo(() => {
    const boards = items.filter(i => i.type === 'board') as Board[];
    const memos = items.filter(i => i.type === 'memo') as any[];
    const images: string[] = [];
    const videos: string[] = [];
    const files: FileAttachment[] = [];
    const links: { url: string; title: string; imageUrl?: string; hasOgData?: boolean }[] = [];

    // 보드의 노트에서 미디어 수집
    boards.forEach(board => {
      (board.notes ?? []).forEach(note => {
        if (note.imageUris) {
          images.push(...note.imageUris);
        }
        if (note.videoUris) {
          videos.push(...note.videoUris);
        }
        if (note.files) {
          files.push(...note.files);
        }
        // 배열 형식의 URLs 처리
        if (note.urls && note.urls.length > 0) {
          note.urls.forEach((url, idx) => {
            const ogData = (note.ogDatas?.[idx]) || cachedOgData[url];
            links.push({
              url,
              // RN의 URL 폴리필은 hostname을 지원하지 않으므로(항상 undefined)
              // 다른 화면들과 동일하게 정규식으로 도메인을 추출한다.
              title: ogData?.title || url.match(/^(?:https?:\/\/)?([^/?#]+)/)?.[1] || url,
              imageUrl: ogData?.imageUrl,
              hasOgData: !!(note.ogDatas?.[idx] || cachedOgData[url]),
            });
          });
        } else if (note.url) {
          // 레거시 단수 형식 호환
          const ogData = note.ogData || cachedOgData[note.url];
          links.push({
            url: note.url,
            title: ogData?.title || note.url.match(/^(?:https?:\/\/)?([^/?#]+)/)?.[1] || note.url,
            imageUrl: ogData?.imageUrl,
            hasOgData: !!(note.ogData || cachedOgData[note.url]),
          });
        }
      });
    });

    // 메모에서 미디어 수집
    memos.forEach((memo: any) => {
      if (memo.imageUris) {
        images.push(...memo.imageUris);
      }
      if (memo.videoUris) {
        videos.push(...memo.videoUris);
      }
      if (memo.files) {
        files.push(...memo.files);
      }
      // 배열 형식의 URLs 처리
      if (memo.urls && memo.urls.length > 0) {
        memo.urls.forEach((url: string, idx: number) => {
          const ogData = (memo.ogDatas?.[idx]) || cachedOgData[url];
          const hostname = url.replace(/^https?:\/\//, '').split('/')[0];
          links.push({
            url,
            title: ogData?.title || hostname,
            imageUrl: ogData?.imageUrl,
            hasOgData: !!(memo.ogDatas?.[idx] || cachedOgData[url]),
          });
        });
      } else if (memo.url) {
        // 레거시 단수 형식 호환
        const ogData = memo.ogData || cachedOgData[memo.url];
        const hostname = memo.url.replace(/^https?:\/\//, '').split('/')[0];
        links.push({
          url: memo.url,
          title: ogData?.title || hostname,
          imageUrl: ogData?.imageUrl,
          hasOgData: !!(memo.ogData || cachedOgData[memo.url]),
        });
      }
    });

    return { images, videos, files, links };
  }, [items, cachedOgData]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent={false}
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" />

      <View style={styles['sideMenu-overlay']}>
        {/* 백드롭 */}
        <TouchableOpacity
          style={styles['sideMenu-backdrop']}
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* 패널 */}
        <Animated.View
          style={[
            styles['sideMenu-panel'],
            {
              width: sideMenuWidth,
              marginTop: panelTopInset,
              height: SCREEN_HEIGHT - panelTopInset - insets.bottom,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View style={styles['sideMenu-safeArea']}>
            {/* 파란 헤더 */}
            <View style={styles['sideMenu-headerBg']}>
              <View style={styles['sideMenu-header']}>
                <TouchableOpacity
                  style={styles['sideMenu-header-btn']}
                  onPress={handleClose}
                >
                  <CloseIcon color="rgba(255,255,255,0.85)" size={25} />
                </TouchableOpacity>

                <View>
                  <Text style={styles['sideMenu-header-logo']}>MEMoryME</Text>
                  <Text style={styles['sideMenu-header-subtitle']}>나를 기억하고 기록하는 공간</Text>
                </View>

                <TouchableOpacity
                  style={styles['sideMenu-header-btn']}
                  onPress={onSettings}
                >
                  <SettingsIcon color="rgba(255,255,255,0.85)" size={23} />
                </TouchableOpacity>
              </View>
            </View>

            {/* 흰 프로필 영역 */}
            <View style={styles['sideMenu-profileSection']}>
              <View style={styles['sideMenu-profile-nameRow']}>
                <Text style={styles['sideMenu-profile-name']}>사용자 님</Text>
                {/* <EditIcon color="#9DAFC8" size={14} /> */}
              </View>

              {/* 스토리지 */}
              <View style={styles['sideMenu-storage']}>
                <View style={styles['sideMenu-storage-textRow']}>
                  <Text style={styles['sideMenu-storage-usedText']}>{storageUsed.toFixed(2)} GB</Text>
                  <Text style={styles['sideMenu-storage-totalText']}>/ 10 GB</Text>
                  {/* <TouchableOpacity style={styles['sideMenu-storage-detailBtn']}>
                    <Text style={styles['sideMenu-storage-detailText']}>자세히</Text>
                  </TouchableOpacity> */}
                </View>

                <View style={styles['sideMenu-storage-barWrapper']}>
                  <View style={styles['sideMenu-storage-barBg']}>
                    <View
                      style={[
                        styles['sideMenu-storage-barFill'],
                        { width: `${Math.min((storageUsed / 10) * 100, 100)}%` },
                      ]}
                    />
                  </View>
                  <View
                    style={[
                      styles['sideMenu-storage-barThumb'],
                      { left: `${Math.min((storageUsed / 10) * 100, 100)}%` },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* 흰 콘텐츠 영역 */}
            <ScrollView
              style={styles['sideMenu-scroll']}
              contentContainerStyle={[
                styles['sideMenu-scrollContent'],
                { paddingBottom: Math.max(insets.bottom, 16) },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {/* 북마크 */}
              <View style={styles['sideMenu-section']}>
                <View style={styles['sideMenu-section-header']}>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => onBookmarkFilterToggle?.(!isBookmarkFilterActive)}>
                    <Text style={[styles['sideMenu-section-title'], { color: '#FF9500' }, isBookmarkFilterActive && { fontWeight: '700' }]}>
                      북마크{isBookmarkFilterActive ? ' (필터)' : ''} ({bookmarkedItems.length})
                    </Text>
                  </TouchableOpacity>
                  {bookmarkedItems.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        handleClose();
                        onMediaGalleryPress?.('bookmarks');
                      }}>
                      <ChevronRightIcon color="#9DAFC8" size={20} />
                    </TouchableOpacity>
                  )}
                </View>

                {bookmarkedItems.length === 0 ? (
                  <Text style={styles['sideMenu-empty-text']}>
                    북마크된 항목이 없습니다
                  </Text>
                ) : (
                  <>
                    {bookmarkedItems.slice(0, MAX_DISPLAY_ITEMS).map(item => {
                      const isBoard = item.type === 'board';
                      const label = isBoard
                        ? (item as Board).title
                        : (item as Memo).text;
                      const accentColor = isBoard ? '#FF9500' : '#588DFF';
                      const badgeBg = isBoard ? '#FFF0D9' : '#E8EEFF';
                      const badgeColor = isBoard ? '#FF9500' : '#588DFF';
                      const badgeLabel = isBoard ? '보드' : '메모';

                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={styles['sideMenu-bookmark-card']}
                          activeOpacity={0.7}
                          onPress={() => {
                            handleClose();
                            onBookmarkPress(item);
                          }}
                        >
                          <View
                            style={[
                              styles['sideMenu-bookmark-accent'],
                              { backgroundColor: accentColor },
                            ]}
                          />
                          <Text
                            style={styles['sideMenu-bookmark-label']}
                            numberOfLines={1}
                          >
                            {label}
                          </Text>
                          <View
                            style={[
                              styles['sideMenu-bookmark-badge'],
                              { backgroundColor: badgeBg },
                            ]}
                          >
                            <Text
                              style={[
                                styles['sideMenu-bookmark-badgeText'],
                                { color: badgeColor },
                              ]}
                            >
                              {badgeLabel}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                    {bookmarkedItems.length > MAX_DISPLAY_ITEMS && (
                      <TouchableOpacity
                        style={[styles['sideMenu-bookmark-card'], { justifyContent: 'center', alignItems: 'center', paddingVertical: 10 }]}
                        activeOpacity={0.7}
                        onPress={() => {
                          handleClose();
                          onMediaGalleryPress?.('bookmarks');
                        }}>
                        <Text style={{ fontSize: 12, color: '#FF9500', fontWeight: '600', marginRight: 4 }}>더보기</Text>
                        <ChevronRightIcon color="#FF9500" size={14} />
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>

              <View style={styles['sideMenu-divider']} />

              {/* 사진 */}
              <View style={styles['sideMenu-section']}>
                <View style={styles['sideMenu-section-header']}>
                  <Text style={[styles['sideMenu-section-title'], { color: '#588DFF' }]}>사진 ({mediaData.images.length})</Text>
                  {mediaData.images.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        handleClose();
                        onMediaGalleryPress?.('images');
                      }}>
                      <ChevronRightIcon color="#9DAFC8" size={20} />
                    </TouchableOpacity>
                  )}
                </View>
                {mediaData.images.length === 0 ? (
                  <View style={styles['sideMenu-placeholder-box']}>
                    <Text style={styles['sideMenu-placeholder-text']}>사진이 없습니다</Text>
                    <Text style={styles['sideMenu-placeholder-subText']}>
                      사진을 추가하면 이곳에 표시됩니다
                    </Text>
                  </View>
                ) : (
                  <>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles['sideMenu-mediaRow']}>
                      {mediaData.images.slice(0, MAX_DISPLAY_ITEMS).map((imageUrl, idx) => (
                        <SideMenuImageThumbnail
                          key={`image-${idx}`}
                          imageUrl={imageUrl}
                          onPress={() => {
                            setImageViewerState({
                              visible: true,
                              uris: mediaData.images,
                              index: idx,
                            });
                          }}
                        />
                      ))}
                      {mediaData.images.length > MAX_DISPLAY_ITEMS && (
                        <TouchableOpacity
                          style={[styles['sideMenu-mediaThumbnail'], { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F5FF' }]}
                          onPress={() => {
                            handleClose();
                            onMediaGalleryPress?.('images');
                          }}>
                          <View style={{ alignItems: 'center', gap: 4 }}>
                            <ChevronRightIcon color="#588DFF" size={16} />
                            <Text style={{ fontSize: 10, color: '#588DFF', fontWeight: '600' }}>더보기</Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    </ScrollView>
                  </>
                )}
              </View>

              <View style={styles['sideMenu-divider']} />

              {/* 동영상 */}
              <View style={styles['sideMenu-section']}>
                <View style={styles['sideMenu-section-header']}>
                  <Text style={[styles['sideMenu-section-title'], { color: '#6B4DFF' }]}>동영상 ({mediaData.videos.length})</Text>
                  {mediaData.videos.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        handleClose();
                        onMediaGalleryPress?.('videos');
                      }}>
                      <ChevronRightIcon color="#9DAFC8" size={20} />
                    </TouchableOpacity>
                  )}
                </View>
                {mediaData.videos.length === 0 ? (
                  <View style={styles['sideMenu-placeholder-box']}>
                    <Text style={styles['sideMenu-placeholder-text']}>동영상이 없습니다</Text>
                    <Text style={styles['sideMenu-placeholder-subText']}>
                      동영상을 추가하면 이곳에 표시됩니다
                    </Text>
                  </View>
                ) : (
                  <>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles['sideMenu-mediaRow']}>
                      {mediaData.videos.slice(0, MAX_DISPLAY_ITEMS).map((uri, idx) => (
                        <TouchableOpacity
                          key={`video-${idx}`}
                          onPress={() => Linking.openURL(uri)}
                        >
                          <View style={styles['sideMenu-videoThumbnail']}>
                            <Image
                              source={{ uri }}
                              style={styles['sideMenu-mediaThumbnail']}
                            />
                            <View style={styles['sideMenu-videoPlayIcon']}>
                              <Text style={styles['sideMenu-videoPlayText']}>▶</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                      {mediaData.videos.length > MAX_DISPLAY_ITEMS && (
                        <TouchableOpacity
                          style={[styles['sideMenu-mediaThumbnail'], { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F5FF' }]}
                          onPress={() => {
                            handleClose();
                            onMediaGalleryPress?.('videos');
                          }}>
                          <View style={{ alignItems: 'center', gap: 4 }}>
                            <ChevronRightIcon color="#6B4DFF" size={16} />
                            <Text style={{ fontSize: 10, color: '#6B4DFF', fontWeight: '600' }}>더보기</Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    </ScrollView>
                  </>
                )}
              </View>

              <View style={styles['sideMenu-divider']} />

              {/* 링크 */}
              <View style={styles['sideMenu-section']}>
                <View style={styles['sideMenu-section-header']}>
                  <Text style={[styles['sideMenu-section-title'], { color: '#00B386' }]}>링크 ({mediaData.links.length})</Text>
                  {mediaData.links.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        handleClose();
                        onMediaGalleryPress?.('links');
                      }}>
                      <ChevronRightIcon color="#9DAFC8" size={20} />
                    </TouchableOpacity>
                  )}
                </View>
                {mediaData.links.length === 0 ? (
                  <View style={styles['sideMenu-placeholder-box']}>
                    <Text style={styles['sideMenu-placeholder-text']}>링크가 없습니다</Text>
                    <Text style={styles['sideMenu-placeholder-subText']}>
                      링크를 추가하면 이곳에 표시됩니다
                    </Text>
                  </View>
                ) : (
                  <>
                    <View style={styles['sideMenu-filesList']}>
                      {mediaData.links.slice(0, MAX_DISPLAY_ITEMS).map((link, idx) => (
                        <TouchableOpacity
                          key={`link-${idx}`}
                          style={styles['sideMenu-linkPreview']}
                          onPress={async () => {
                            try {
                              if (await InAppBrowser.isAvailable()) {
                                await InAppBrowser.open(link.url, {
                                  modalPresentationStyle: 'pageSheet',
                                });
                              } else {
                                Linking.openURL(link.url);
                              }
                            } catch {
                              Linking.openURL(link.url);
                            }
                          }}
                        >
                          <LoadingImage
                            source={link.imageUrl ? { uri: link.imageUrl } : require('../../assets/imgs/mainlogo.png')}
                            style={styles['sideMenu-linkPreviewImage']}
                            resizeMode="cover"
                          />
                          <View style={styles['sideMenu-linkPreviewContent']}>
                            <Text style={styles['sideMenu-linkTitle']} numberOfLines={2}>{link.title}</Text>
                            <Text style={styles['sideMenu-linkUrl']} numberOfLines={1}>{link.url}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                      {mediaData.links.length > MAX_DISPLAY_ITEMS && (
                        <TouchableOpacity
                          style={[styles['sideMenu-linkPreview'], { justifyContent: 'center', alignItems: 'center', paddingVertical: 8, backgroundColor: '#F7FAFF' }]}
                          onPress={() => {
                            handleClose();
                            onMediaGalleryPress?.('links');
                          }}>
                          <Text style={{ fontSize: 12, color: '#00B386', fontWeight: '600' }}>더보기</Text>
                          <ChevronRightIcon color="#00B386" size={14} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                )}
              </View>

              <View style={styles['sideMenu-divider']} />

              {/* 파일 */}
              <View style={styles['sideMenu-section']}>
                <View style={styles['sideMenu-section-header']}>
                  <Text style={[styles['sideMenu-section-title'], { color: '#FF6B6B' }]}>파일 ({mediaData.files.length})</Text>
                  {mediaData.files.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        handleClose();
                        onMediaGalleryPress?.('files');
                      }}>
                      <ChevronRightIcon color="#9DAFC8" size={20} />
                    </TouchableOpacity>
                  )}
                </View>
                {mediaData.files.length === 0 ? (
                  <View style={styles['sideMenu-placeholder-box']}>
                    <Text style={styles['sideMenu-placeholder-text']}>파일이 없습니다</Text>
                    <Text style={styles['sideMenu-placeholder-subText']}>
                      파일을 추가하면 이곳에 표시됩니다
                    </Text>
                  </View>
                ) : (
                  <>
                    <View style={styles['sideMenu-filesList']}>
                      {mediaData.files.slice(0, MAX_DISPLAY_ITEMS).map((file, idx) => (
                        <TouchableOpacity
                          key={`file-${idx}`}
                          style={styles['sideMenu-fileItem']}
                          onPress={() => {
                            try {
                              let fileUrl = file.url;
                              if (!fileUrl.startsWith('http')) {
                                fileUrl = `https://memme.o-r.kr${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
                              }
                              Linking.openURL(fileUrl);
                            } catch {
                              // console.error('Failed to open file:', error);
                            }
                          }}
                        >
                          <View style={styles['sideMenu-fileIconContainer']}>
                            <FileIcon color="#588DFF" size={18} />
                          </View>
                          <Text style={styles['sideMenu-fileName']} numberOfLines={2}>{decodeURIComponent(decodeURIComponent(file.name))}</Text>
                        </TouchableOpacity>
                      ))}
                      {mediaData.files.length > MAX_DISPLAY_ITEMS && (
                        <TouchableOpacity
                          style={[styles['sideMenu-fileItem'], { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7FAFF' }]}
                          onPress={() => {
                            handleClose();
                            onMediaGalleryPress?.('files');
                          }}>
                          <Text style={{ fontSize: 12, color: '#FF6B6B', fontWeight: '600' }}>더보기</Text>
                          <ChevronRightIcon color="#FF6B6B" size={14} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                )}
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </View>

      <ImageViewerModal
        visible={imageViewerState.visible}
        imageUris={imageViewerState.uris}
        initialIndex={imageViewerState.index}
        onClose={() => setImageViewerState(prev => ({ ...prev, visible: false }))}
      />
    </Modal>
  );
};

export default SideMenu;

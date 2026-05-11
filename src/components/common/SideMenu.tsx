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
  Dimensions,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Board, TimelineItem, Memo, Note, FileAttachment, OgData } from '../../types';
import { CloseIcon, EditIcon, SettingsIcon, ChevronRightIcon } from './Icons';
import { SIDE_MENU_WIDTH, sideMenuStyles as styles } from '../../styles/SideMenu.styles';
import { fetchOgData } from '../../services/ogService';
import { getUploadObject } from '../../services/uploadService';
import ImageViewerModal from './ImageViewerModal';
import InAppBrowser from 'react-native-inappbrowser-reborn';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAX_DISPLAY_ITEMS = 4;

interface Props {
  visible: boolean;
  items: TimelineItem[];
  onClose: () => void;
  onSettings: () => void;
  onBookmarkPress: (item: TimelineItem) => void;
  isBookmarkFilterActive?: boolean;
  onBookmarkFilterToggle?: (active: boolean) => void;
  onMediaGalleryPress?: (galleryType: 'images' | 'videos' | 'files' | 'links') => void;
}

const SideMenu = ({ visible, items, onClose, onSettings, onBookmarkPress, isBookmarkFilterActive, onBookmarkFilterToggle, onMediaGalleryPress }: Props) => {
  const slideAnim = useRef(new Animated.Value(SIDE_MENU_WIDTH)).current;
  const insets = useSafeAreaInsets();
  const [cachedOgData, setCachedOgData] = useState<{ [url: string]: OgData }>({});
  const [imageViewerState, setImageViewerState] = useState({
    visible: false,
    uris: [] as string[],
    index: 0,
  });

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(SIDE_MENU_WIDTH);
      Animated.spring(slideAnim, {
        toValue: 0,
        bounciness: 3,
        speed: 14,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SIDE_MENU_WIDTH,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const bookmarkedItems = items.filter(item => item.bookMark);

  // OG 데이터 자동 로드 (NoteDetailScreen과 동일한 방식)
  useEffect(() => {
    const loadOgDataForLinks = async () => {
      const linksNeedingOgData = mediaData.links.filter(link => !link.hasOgData);

      for (const link of linksNeedingOgData) {
        if (cachedOgData[link.url]) continue;

        try {
          const ogData = await fetchOgData(link.url);
          setCachedOgData(prev => ({
            ...prev,
            [link.url]: ogData,
          }));
        } catch (error) {
          console.error('Failed to fetch OG data for link:', link.url, error);
        }
      }
    };

    loadOgDataForLinks();
  }, [items]);

  // 모든 노트에서 이미지, 동영상, 파일, 링크 수집
  const mediaData = useMemo(() => {
    const boards = items.filter(i => i.type === 'board') as Board[];
    const images: string[] = [];
    const videos: string[] = [];
    const files: FileAttachment[] = [];
    const links: { url: string; title: string; imageUrl?: string; hasOgData?: boolean }[] = [];

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
        if (note.url) {
          const ogData = note.ogData || cachedOgData[note.url];
          links.push({
            url: note.url,
            title: ogData?.title || new URL(note.url).hostname,
            imageUrl: ogData?.imageUrl,
            hasOgData: !!(note.ogData || cachedOgData[note.url]),
          });
        }
      });
    });

    return { images, videos, files, links };
  }, [items, cachedOgData]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0, 0, 0, 0.38)" />

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
              marginTop: insets.top,
              height: SCREEN_HEIGHT - insets.top - insets.bottom,
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
              <Image
                source={require('../../assets/imgs/mainart.png')}
                style={styles['sideMenu-profile-avatar']}
              />

              <View style={styles['sideMenu-profile-nameRow']}>
                <Text style={styles['sideMenu-profile-name']}>사용자 님</Text>
                <EditIcon color="#9DAFC8" size={14} />
              </View>

              {/* 스토리지 */}
              <View style={styles['sideMenu-storage']}>
                <View style={styles['sideMenu-storage-textRow']}>
                  <Text style={styles['sideMenu-storage-usedText']}>0 GB</Text>
                  <Text style={styles['sideMenu-storage-totalText']}>/ 100 GB</Text>
                  <TouchableOpacity style={styles['sideMenu-storage-detailBtn']}>
                    <Text style={styles['sideMenu-storage-detailText']}>자세히</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles['sideMenu-storage-barWrapper']}>
                  <View style={styles['sideMenu-storage-barBg']}>
                    <View
                      style={[
                        styles['sideMenu-storage-barFill'],
                        { width: '0%' },
                      ]}
                    />
                  </View>
                  <View
                    style={[
                      styles['sideMenu-storage-barThumb'],
                      { left: 0 },
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
                      {mediaData.images.slice(0, MAX_DISPLAY_ITEMS).map((uri, idx) => (
                        <TouchableOpacity
                          key={`image-${idx}`}
                          onPress={() => {
                            setImageViewerState({
                              visible: true,
                              uris: mediaData.images,
                              index: idx,
                            });
                          }}
                        >
                          <Image
                            source={{ uri }}
                            style={styles['sideMenu-mediaThumbnail']}
                          />
                        </TouchableOpacity>
                      ))}
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
                            } catch (error) {
                              Linking.openURL(link.url);
                            }
                          }}
                        >
                          {link.imageUrl && (
                            <Image
                              source={{ uri: link.imageUrl }}
                              style={styles['sideMenu-linkPreviewImage']}
                            />
                          )}
                          <View style={styles['sideMenu-linkPreviewContent']}>
                            <Text style={styles['sideMenu-linkTitle']} numberOfLines={2}>{link.title}</Text>
                            <Text style={styles['sideMenu-linkUrl']} numberOfLines={1}>{link.url}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
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
                          onPress={async () => {
                            try {
                              if (file.url.startsWith('http')) {
                                Linking.openURL(file.url);
                              } else {
                                const key = file.url.split('key=')[1];
                                const presignedData = await getUploadObject(key);
                                Linking.openURL(presignedData.url || presignedData);
                              }
                            } catch (error) {
                              console.error('Failed to open file:', error);
                            }
                          }}
                        >
                          <Text style={styles['sideMenu-fileIcon']}>📄</Text>
                          <Text style={styles['sideMenu-fileName']} numberOfLines={2}>{file.name}</Text>
                        </TouchableOpacity>
                      ))}
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
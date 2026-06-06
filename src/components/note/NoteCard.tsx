import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Linking, StyleSheet, Modal, FlatList, Dimensions, Pressable, ActivityIndicator, useWindowDimensions, ScrollView } from 'react-native';
import { Note, OgData } from '../../types';
import { LinkIcon, FileIcon } from '../common/Icons';
import ImageViewerModal from '../common/ImageViewerModal';
import { fetchOgData } from '../../services/ogService';
import LoadingImage from '../common/LoadingImage';

const formatDate = (iso?: string): string => {
  if (!iso) return '날짜 없음';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '날짜 없음';
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
};

interface NoteCardProps {
  note: Note;
  onPress?: () => void;
  isSelected?: boolean;
  onLongPress?: () => void;
  selectionMode?: boolean;
}

const ImageThumbnail = ({ imageUrl, onPress }: { imageUrl: string; onPress: () => void }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles['image-thumbnail'],
        pressed && styles['image-thumbnail-pressed'],
      ]}>
      <LoadingImage
        source={{ uri: imageUrl }}
        style={styles['image-thumbnail']}
        resizeMode="cover"
      />
    </Pressable>
  );
};

const NoteCard = ({ note, onPress, isSelected, onLongPress, selectionMode }: NoteCardProps) => {
  const { width: windowWidth } = useWindowDimensions();
  const [ogDataCache, setOgDataCache] = useState<Record<string, OgData>>({});
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerImages, setImageViewerImages] = useState<string[]>([]);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const [videoViewerVisible, setVideoViewerVisible] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  // 화면 너비에 따라 표시 가능한 미디어 개수 계산
  // 각 아이템(56px) + gap(8px) = 64px
  // container padding: 16 + 16 = 32px
  const maxMediaItems = Math.max(2, Math.floor((windowWidth - 32) / 64));

  const openImageViewer = (images: string[]) => {
    setImageViewerImages(images);
    setImageViewerIndex(0);
    setImageViewerVisible(true);
  };

  // OG 데이터 로드
  useEffect(() => {
    const loadOgData = async () => {
      const urlsToLoad = note.urls || (note.url ? [note.url] : []);

      for (const url of urlsToLoad) {
        if (!url || ogDataCache[url]) continue;

        try {
          const ogData = await fetchOgData(url);
          setOgDataCache(prev => ({
            ...prev,
            [url]: ogData,
          }));
        } catch (error) {
          console.error('Failed to load OG data for URL:', url, error);
        }
      }
    };

    loadOgData();
  }, [note.urls, note.url, note.ogData, ogDataCache]);

  const hasImages = (note.imageUris?.length ?? 0) > 0;
  const hasVideos = (note.videos?.length ?? 0) > 0;
  const hasLinks = (note.urls?.length ?? 0) > 0 || !!note.url;
  const hasFiles = (note.files?.length ?? 0) > 0;

  return (
    <>
      <TouchableOpacity
        style={[styles.container, isSelected && styles.containerSelected]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}>
        {(selectionMode || isSelected) && (
          <View style={styles.checkboxContainer}>
            <View style={[styles.checkbox, !isSelected && styles.checkboxEmpty]}>
              <Text style={styles.checkmark}>{isSelected ? '✓' : ''}</Text>
            </View>
          </View>
        )}
        <Text style={[styles.title, (selectionMode || isSelected) && styles.titleWithCheckbox]} numberOfLines={2}>{note.title}</Text>

        {note.content ? (
          <View style={[styles['section-row'], { marginTop: 16, ...((!hasImages && !hasVideos && !hasFiles && !hasLinks) && { marginBottom: 16 }) }]}>
            <Text style={styles['section-label']}>내용</Text>
            <Text style={styles['content-text']}>{note.content}</Text>
          </View>
        ) : (!hasImages && !hasVideos && !hasFiles && !hasLinks) && (
          <View style={[styles['section-row'], { marginTop: 16, marginBottom: 16 }]}>
            <Text style={styles['empty-content-text']}>아직 내용이 없습니다</Text>
          </View>
        )}

        {hasImages && (
          <View style={[styles['section-row'], { marginTop: 16, ...(!hasVideos && !hasFiles && !hasLinks && { marginBottom: 16 }) }]}>
            <Text style={styles['section-label']}>이미지</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                persistentScrollbar={true}
                scrollEventThrottle={16}
                scrollIndicatorInsets={{ bottom: 4 }}
                contentContainerStyle={styles['images-preview']}>
                <>
                  {note.imageUris!.slice(0, maxMediaItems).map((imageUrl) => (
                    <ImageThumbnail
                      key={imageUrl}
                      imageUrl={imageUrl}
                      onPress={() => {
                        openImageViewer(note.imageUris!);
                      }}
                    />
                  ))}
                </>
                {(note.imageUris!.length ?? 0) > maxMediaItems && (
                  <Pressable
                    onPress={() => {
                      openImageViewer(note.imageUris!);
                    }}
                    style={({ pressed }) => [
                      styles['image-more'],
                      pressed && styles['image-more-pressed'],
                    ]}>
                    <Text style={styles['image-more-text']}>
                      +{note.imageUris!.length - maxMediaItems}
                    </Text>
                  </Pressable>
                )}
              </ScrollView>
            </View>
        )}

        {hasVideos && (
          <View style={[styles['section-row'], { marginTop: 16, ...(!hasFiles && !hasLinks && { marginBottom: 16 }) }]}>
            <Text style={styles['section-label']}>동영상</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                persistentScrollbar={true}
                scrollEventThrottle={16}
                scrollIndicatorInsets={{ bottom: 4 }}
                contentContainerStyle={styles['videos-preview']}>
                <>
                  {note.videos!.slice(0, maxMediaItems).map((video) => (
                    <Pressable
                      key={video.uid}
                      onPress={() => {
                        setSelectedVideoUrl(video.url);
                        setVideoViewerVisible(true);
                      }}
                      style={({ pressed }) => [
                        styles['video-thumbnail'],
                        pressed && styles['video-thumbnail-pressed'],
                      ]}>
                      {video.thumbnailUrl ? (
                        <LoadingImage
                          source={{ uri: video.thumbnailUrl }}
                          style={styles['video-thumbnail']}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles['video-thumbnail-placeholder']}>
                          <Text style={styles['video-icon']}>▶</Text>
                        </View>
                      )}
                    </Pressable>
                  ))}
                </>
                {(note.videos!.length ?? 0) > maxMediaItems && (
                  <Text style={styles['video-more']}>
                    +{note.videos!.length - maxMediaItems}개
                  </Text>
                )}
              </ScrollView>
            </View>
        )}

        {hasFiles && (
          <View style={[styles['section-row'], { marginTop: 16, ...(!hasLinks && { marginBottom: 16 }) }]}>
            <Text style={styles['section-label']}>파일</Text>
              <View style={styles['files-preview']}>
                <>
                  {note.files!.slice(0, 5).map((file) => (
                    <TouchableOpacity
                      key={file.uid}
                      style={styles['file-item']}
                      onPress={() => {
                        Linking.openURL(file.url).catch(() => {
                          console.error('Failed to open file:', file.url);
                        });
                      }}
                      activeOpacity={0.7}>
                      <View style={styles['file-icon-container']}>
                        <FileIcon color="#588DFF" size={20} />
                      </View>
                      <Text style={styles['file-name']} numberOfLines={1}>
                        {file.name || 'file'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </>
                {(note.files!.length ?? 0) > 5 && (
                  <Text style={styles['file-more']}>
                    +{note.files!.length - 5}개
                  </Text>
                )}
              </View>
            </View>
        )}

        {hasLinks && (() => {
          const urlsToShow = note.urls && note.urls.length > 0 ? note.urls : (note.url ? [note.url] : []);
          const maxLinksToShow = 3;
          const linksToDisplay = urlsToShow.slice(0, maxLinksToShow);

          const getOgDataForUrl = (url: string, urlIndex: number) => {
            return ogDataCache[url] || note.ogDatas?.[urlIndex] ||
                   (urlIndex === 0 ? note.ogData : undefined);
          };

          return (
            <View style={[styles['section-row'], { marginTop: 16, marginBottom: 16 }]}>
              <View style={styles['link-header']}>
                <Text style={styles['section-label']}>링크</Text>
                  {urlsToShow.length > maxLinksToShow && (
                    <Text style={styles['link-count']}>+{urlsToShow.length - maxLinksToShow}</Text>
                  )}
                </View>
                <View style={styles['links-container']}>
                  {linksToDisplay.map((url, displayIndex) => {
                    const ogData = getOgDataForUrl(url, displayIndex);
                    return (
                      <TouchableOpacity
                        key={url}
                        style={styles['link-card']}
                        onPress={() => {
                          Linking.openURL(url).catch(() => {
                            console.error('Failed to open URL:', url);
                          });
                        }}
                        activeOpacity={0.7}>
                        <LoadingImage
                          source={ogData?.imageUrl ? { uri: ogData.imageUrl } : require('../../assets/imgs/mainlogo.png')}
                          style={styles['link-image']}
                          resizeMode="cover"
                        />
                        <View style={styles['link-info']}>
                          <Text style={styles['link-domain']} numberOfLines={1}>
                            {ogData?.siteName || (url.match(/^(?:https?:\/\/)?([^/?#]+)/)?.[1] || url)}
                          </Text>
                          <Text style={styles['link-title']} numberOfLines={1}>
                            {ogData?.title || '링크'}
                          </Text>
                          {!!ogData?.description && (
                            <Text style={styles['link-desc']} numberOfLines={1}>
                              {ogData.description}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
        })()}

        {/* 날짜 정보 */}
        <View style={styles['date-info']}>
          <Text style={styles['date-text']}>
            {formatDate(note.updatedAt ?? note.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* 이미지 뷰어 모달 */}
      <ImageViewerModal
        visible={imageViewerVisible}
        imageUris={imageViewerImages}
        initialIndex={imageViewerIndex}
        onClose={() => setImageViewerVisible(false)}
      />

      {/* 동영상 뷰어 모달 */}
      <Modal
        visible={videoViewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setVideoViewerVisible(false)}>
        <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 20, left: 16, padding: 8 }}
            onPress={() => setVideoViewerVisible(false)}>
            <Text style={{ fontSize: 28, color: '#FFFFFF', fontWeight: '600' }}>✕</Text>
          </TouchableOpacity>

          {selectedVideoUrl && (
            <TouchableOpacity
              style={styles['video-player-container']}
              onPress={() => {
                Linking.openURL(selectedVideoUrl).catch(() => {
                  console.error('Failed to open video:', selectedVideoUrl);
                });
              }}>
              <Text style={styles['video-play-icon']}>▶</Text>
              <Text style={styles['video-open-text']}>눌러서 재생</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: '#E4ECFF',
    gap: 10,
    position: 'relative',
  },
  containerSelected: {
    backgroundColor: '#F0F4FF',
    borderColor: '#588DFF',
    borderWidth: 2,
  },
  checkboxContainer: {
    position: 'absolute',
    left: 10,
    top: 10,
    zIndex: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#588DFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxEmpty: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#588DFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 0,
  },
  titleWithCheckbox: {
    marginLeft: 28,
  },
  'section-row': {
    gap: 6,
  },
  'section-label': {
    fontSize: 10,
    fontWeight: '700',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  'content-text': {
    fontSize: 11,
    color: '#333333',
    fontFamily: 'PretendardVariable',
    lineHeight: 18,
  },
  'empty-content-text': {
    fontSize: 11,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
    lineHeight: 18,
  },
  'section-divider': {
    height: 1,
    backgroundColor: '#E4ECFF',
  },
  'images-preview': {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingBottom: 12,
  },
  'image-thumbnail': {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#EEF3FF',
  },
  'image-thumbnail-pressed': {
    opacity: 0.7,
  },
  'image-more': {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  'image-more-pressed': {
    opacity: 0.7,
  },
  'image-more-text': {
    fontSize: 10,
    fontWeight: '600',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },
  'videos-preview': {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingBottom: 12,
  },
  'video-thumbnail': {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  'video-icon': {
    fontSize: 20,
  },
  'video-more': {
    fontSize: 9,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
    paddingHorizontal: 0,
  },
  'video-thumbnail-placeholder': {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  'video-thumbnail-pressed': {
    opacity: 0.7,
  },
  'video-player-container': {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  'video-play-icon': {
    fontSize: 48,
    color: '#FFFFFF',
  },
  'video-open-text': {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'PretendardVariable',
  },
  'link-header': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  'link-count': {
    fontSize: 9,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
    lineHeight: 16,
  },
  'links-container': {
    gap: 8,
  },
  'link-card': {
    flexDirection: 'row',
    backgroundColor: '#F7FAFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E4ECFF',
    overflow: 'hidden',
    height: 68,
    alignItems: 'flex-start',
  },
  'link-image': {
    width: 68,
    height: 68,
  },
  'link-image-placeholder': {
    width: 68,
    height: 68,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  'link-info': {
    flex: 1,
    padding: 8,
    gap: 2,
  },
  'link-domain': {
    fontSize: 10,
    fontWeight: '700',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.2,
  },
  'link-title': {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    lineHeight: 16,
  },
  'link-desc': {
    fontSize: 10,
    color: '#6B7E9A',
    fontFamily: 'PretendardVariable',
    lineHeight: 15,
  },
  'files-preview': {
    gap: 8,
    paddingVertical: 0,
  },
  'file-item': {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8F9FB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8EEF8',
    gap: 10,
  },
  'file-icon-container': {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#EEF3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  'file-name': {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },
  'file-more': {
    fontSize: 9,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
    paddingHorizontal: 0,
    paddingTop: 6,
  },
  'date-info': {
    position: 'absolute',
    bottom: 8,
    right: 12,
  },
  'date-text': {
    fontSize: 10,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
  },
});

export default NoteCard;

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Linking, StyleSheet, Modal, FlatList, Dimensions, Pressable, ActivityIndicator, useWindowDimensions, ScrollView } from 'react-native';
import { Note, OgData } from '../../types';
import { LinkIcon } from '../common/Icons';
import { fetchOgData } from '../../services/ogService';
import LoadingImage from '../common/LoadingImage';

interface NoteCardProps {
  note: Note;
  onPress?: () => void;
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

const NoteCard = ({ note, onPress }: NoteCardProps) => {
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
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
        <Text style={styles.title} numberOfLines={2}>{note.title}</Text>

        {!!note.content && (
          <View style={[styles['section-row'], { marginTop: 16, ...((!hasImages && !hasVideos && !hasFiles && !hasLinks) && { marginBottom: 16 }) }]}>
            <Text style={styles['section-label']}>내용</Text>
            <Text style={styles['content-text']}>{note.content}</Text>
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
                      <Text style={styles['file-icon']}>📄</Text>
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
                        {ogData?.imageUrl ? (
                          <LoadingImage
                            source={{ uri: ogData.imageUrl }}
                            style={styles['link-image']}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles['link-image-placeholder']}>
                            <LinkIcon color="#AABBCC" size={20} />
                          </View>
                        )}
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
      </TouchableOpacity>

      {/* 이미지 뷰어 모달 */}
      <Modal
        visible={imageViewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}>
        <View style={imageViewerStyles.container}>
          <View style={imageViewerStyles.header}>
            <TouchableOpacity
              style={imageViewerStyles.closeButton}
              onPress={() => setImageViewerVisible(false)}>
              <Text style={imageViewerStyles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={imageViewerStyles.fileName} numberOfLines={1}>
              {imageViewerImages[imageViewerIndex]?.split('/').pop() || `이미지 ${imageViewerIndex + 1}`}
            </Text>
          </View>

          <FlatList
            data={imageViewerImages}
            keyExtractor={(_, idx) => `image-${idx}`}
            renderItem={({ item }) => (
              <View style={imageViewerStyles.slide}>
                <Image
                  source={{ uri: item }}
                  style={imageViewerStyles.image}
                  resizeMode="contain"
                />
              </View>
            )}
            horizontal
            pagingEnabled
            scrollEventThrottle={16}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / Dimensions.get('window').width
              );
              setImageViewerIndex(index);
            }}
            scrollIndicatorInsets={{ right: 1 }}
            showsHorizontalScrollIndicator={false}
          />

          <View style={imageViewerStyles.indicatorContainer}>
            {imageViewerImages.length > 1 && (
              <>
                {imageViewerImages.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      imageViewerStyles.indicator,
                      idx === imageViewerIndex && imageViewerStyles.indicatorActive,
                    ]}
                  />
                ))}
              </>
            )}
            <Text style={imageViewerStyles.imageCounter}>
              {imageViewerIndex + 1} / {imageViewerImages.length}
            </Text>
          </View>
        </View>
      </Modal>

      {/* 동영상 뷰어 모달 */}
      <Modal
        visible={videoViewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setVideoViewerVisible(false)}>
        <View style={imageViewerStyles.container}>
          <View style={imageViewerStyles.header}>
            <TouchableOpacity
              style={imageViewerStyles.closeButton}
              onPress={() => setVideoViewerVisible(false)}>
              <Text style={imageViewerStyles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={imageViewerStyles.fileName} numberOfLines={1}>
              동영상
            </Text>
          </View>

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
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F0F4FF',
    borderRadius: 6,
    gap: 8,
  },
  'file-icon': {
    fontSize: 14,
  },
  'file-name': {
    flex: 1,
    fontSize: 10,
    color: '#4A5568',
    fontFamily: 'PretendardVariable',
  },
  'file-more': {
    fontSize: 9,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
    paddingHorizontal: 0,
    paddingTop: 6,
  },
});

const imageViewerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    zIndex: 10,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'PretendardVariable',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  slide: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorActive: {
    backgroundColor: '#FFFFFF',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  imageCounter: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 12,
    fontFamily: 'PretendardVariable',
  },
});

export default NoteCard;

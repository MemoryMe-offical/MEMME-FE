import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Linking, StyleSheet, Modal, FlatList, Dimensions, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Note, OgData } from '../../types';
import { LinkIcon } from '../common/Icons';
import { fetchOgData } from '../../services/ogService';

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
      <Image
        source={{ uri: imageUrl }}
        style={styles['image-thumbnail']}
        resizeMode="cover"
      />
    </Pressable>
  );
};

const NoteCard = ({ note, onPress }: NoteCardProps) => {
  const [ogDataCache, setOgDataCache] = useState<Record<string, OgData>>({});
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerImages, setImageViewerImages] = useState<string[]>([]);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const [videoViewerVisible, setVideoViewerVisible] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  const openImageViewer = (images: string[]) => {
    setImageViewerImages(images);
    setImageViewerIndex(0);
    setImageViewerVisible(true);
  };

  // OG 데이터 로드
  useEffect(() => {
    const loadOgData = async () => {
      if (!note.url || note.ogData || ogDataCache[note.url]) return;

      try {
        const ogData = await fetchOgData(note.url);
        setOgDataCache(prev => ({
          ...prev,
          [note.url!]: ogData,
        }));
      } catch (error) {
        console.error('Failed to load OG data for note:', note.url, error);
      }
    };

    loadOgData();
  }, [note.url, note.ogData, ogDataCache]);

  const hasImages = (note.imageUris?.length ?? 0) > 0;
  const hasVideos = (note.videoUris?.length ?? 0) > 0;
  const hasLinks = (note.urls?.length ?? 0) > 0 || !!note.url;
  const hasFiles = (note.files?.length ?? 0) > 0;

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
        <Text style={styles.title} numberOfLines={2}>{note.title}</Text>

        {!!note.content && (
          <View style={styles['section-row']}>
            <Text style={styles['section-label']}>내용</Text>
            <Text style={styles['content-text']} numberOfLines={3}>{note.content}</Text>
          </View>
        )}

        {hasImages && (
          <>
            <View style={styles['section-divider']} />
            <View style={styles['section-row']}>
              <Text style={styles['section-label']}>이미지</Text>
              <View style={styles['images-preview']}>
                <>
                  {note.imageUris!.slice(0, 2).map((imageUrl) => (
                    <ImageThumbnail
                      key={imageUrl}
                      imageUrl={imageUrl}
                      onPress={() => {
                        openImageViewer(note.imageUris!);
                      }}
                    />
                  ))}
                </>
                {(note.imageUris!.length ?? 0) > 2 && (
                  <Pressable
                    onPress={() => {
                      openImageViewer(note.imageUris!);
                    }}
                    style={({ pressed }) => [
                      styles['image-more'],
                      pressed && styles['image-more-pressed'],
                    ]}>
                    <Text style={styles['image-more-text']}>
                      +{note.imageUris!.length - 2}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          </>
        )}

        {hasVideos && (
          <>
            <View style={styles['section-divider']} />
            <View style={styles['section-row']}>
              <Text style={styles['section-label']}>동영상</Text>
              <View style={styles['videos-preview']}>
                <>
                  {note.videos!.slice(0, 2).map((video) => (
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
                        <Image
                          source={{ uri: video.thumbnailUrl }}
                          style={styles['video-thumbnail']}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles['video-thumbnail-placeholder']}>
                          <Text style={styles['video-icon']}>🎬</Text>
                        </View>
                      )}
                    </Pressable>
                  ))}
                </>
                {(note.videos!.length ?? 0) > 2 && (
                  <Text style={styles['video-more']}>
                    +{note.videos!.length - 2}개
                  </Text>
                )}
              </View>
            </View>
          </>
        )}

        {hasFiles && (
          <>
            <View style={styles['section-divider']} />
            <View style={styles['section-row']}>
              <Text style={styles['section-label']}>파일</Text>
              <View style={styles['files-preview']}>
                <>
                  {note.files!.slice(0, 2).map((file) => (
                    <TouchableOpacity
                      key={file.uid}
                      style={styles['file-item']}
                      onPress={() => {
                        Linking.openURL(file.url).catch(() => {
                          console.error('Failed to open file:', file.url);
                        });
                      }}
                      activeOpacity={0.7}>
                      <Text style={styles['file-name']} numberOfLines={1}>
                        {file.name || 'file'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </>
                {(note.files!.length ?? 0) > 2 && (
                  <Text style={styles['file-more']}>
                    +{note.files!.length - 2}개
                  </Text>
                )}
              </View>
            </View>
          </>
        )}

        {hasLinks && (() => {
          const urlsToShow = note.urls && note.urls.length > 0 ? note.urls : (note.url ? [note.url] : []);
          const ogDatasToShow = note.ogDatas && note.ogDatas.length > 0 ? note.ogDatas : (note.ogData ? [note.ogData] : []);

          return (
            <>
              <View style={styles['section-divider']} />
              <View style={styles['section-row']}>
                <View style={styles['link-header']}>
                  <Text style={styles['section-label']}>링크</Text>
                  {urlsToShow.length > 2 && (
                    <Text style={styles['link-count']}>+{urlsToShow.length - 1}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles['link-card']}
                  onPress={() => {
                    Linking.openURL(urlsToShow[0]).catch(() => {
                      console.error('Failed to open URL:', urlsToShow[0]);
                    });
                  }}
                  activeOpacity={0.7}>
                  {ogDatasToShow[0]?.imageUrl ? (
                    <Image
                      source={{ uri: ogDatasToShow[0].imageUrl }}
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
                      {ogDatasToShow[0]?.siteName || (urlsToShow[0].match(/^(?:https?:\/\/)?([^/?#]+)/)?.[1] || urlsToShow[0])}
                    </Text>
                    <Text style={styles['link-title']} numberOfLines={2}>
                      {ogDatasToShow[0]?.title || '링크'}
                    </Text>
                    {!!ogDatasToShow[0]?.description && (
                      <Text style={styles['link-desc']} numberOfLines={1}>
                        {ogDatasToShow[0].description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </>
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
          <TouchableOpacity
            style={imageViewerStyles.closeButton}
            onPress={() => setImageViewerVisible(false)}>
            <Text style={imageViewerStyles.closeText}>✕</Text>
          </TouchableOpacity>

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

          {imageViewerImages.length > 1 && (
            <View style={imageViewerStyles.indicatorContainer}>
              {imageViewerImages.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    imageViewerStyles.indicator,
                    idx === imageViewerIndex && imageViewerStyles.indicatorActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      </Modal>

      {/* 동영상 뷰어 모달 */}
      <Modal
        visible={videoViewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setVideoViewerVisible(false)}>
        <View style={imageViewerStyles.container}>
          <TouchableOpacity
            style={imageViewerStyles.closeButton}
            onPress={() => setVideoViewerVisible(false)}>
            <Text style={imageViewerStyles.closeText}>✕</Text>
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
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4ECFF',
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    lineHeight: 24,
  },
  'section-row': {
    gap: 8,
  },
  'section-label': {
    fontSize: 12,
    fontWeight: '700',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  'content-text': {
    fontSize: 13,
    color: '#333333',
    fontFamily: 'PretendardVariable',
    lineHeight: 20,
  },
  'section-divider': {
    height: 1,
    backgroundColor: '#E4ECFF',
  },
  'images-preview': {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  'image-thumbnail': {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#EEF3FF',
  },
  'image-thumbnail-pressed': {
    opacity: 0.7,
  },
  'image-more': {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  'image-more-pressed': {
    opacity: 0.7,
  },
  'image-more-text': {
    fontSize: 12,
    fontWeight: '600',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },
  'videos-preview': {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  'video-thumbnail': {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  'video-icon': {
    fontSize: 20,
  },
  'video-more': {
    fontSize: 11,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
    paddingHorizontal: 0,
  },
  'video-thumbnail-placeholder': {
    width: 56,
    height: 56,
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
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'PretendardVariable',
  },
  'link-header': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  'link-count': {
    fontSize: 11,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
  },
  'link-card': {
    flexDirection: 'row',
    backgroundColor: '#F7FAFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E4ECFF',
    overflow: 'hidden',
    alignItems: 'flex-start',
  },
  'link-image': {
    width: 52,
    height: 52,
  },
  'link-image-placeholder': {
    width: 52,
    height: 52,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  'link-info': {
    flex: 1,
    padding: 6,
    gap: 1,
  },
  'link-domain': {
    fontSize: 9,
    fontWeight: '600',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },
  'link-title': {
    fontSize: 10,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    lineHeight: 16,
  },
  'link-desc': {
    fontSize: 9,
    color: '#6B7E9A',
    fontFamily: 'PretendardVariable',
    lineHeight: 14,
  },
  'files-preview': {
    gap: 8,
    paddingVertical: 0,
  },
  'file-item': {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F0F4FF',
    borderRadius: 6,
  },
  'file-name': {
    flex: 1,
    fontSize: 12,
    color: '#4A5568',
    fontFamily: 'PretendardVariable',
  },
  'file-more': {
    fontSize: 11,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
    paddingHorizontal: 0,
    paddingTop: 8,
  },
});

const imageViewerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  closeText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '600',
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
});

export default NoteCard;

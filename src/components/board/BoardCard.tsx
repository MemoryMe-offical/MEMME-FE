import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Linking, Modal, FlatList, Dimensions, StyleSheet, Pressable } from 'react-native';
import { Board, OgData } from '../../types';
import { boardCardStyles as styles } from '../../styles/BoardCard.styles';
import { ChevronDownIcon, ChevronUpIcon, MoreIcon, LinkIcon } from '../common/Icons';
import { fetchOgData } from '../../services/ogService';

const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const isAM = hours < 12;
  const displayHours = hours % 12 || 12;
  return `${isAM ? '오전' : '오후'} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
};

const CardImageThumbnail = ({ imageUrl, onPress }: { imageUrl: string; onPress: () => void }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles['card-image-thumbnail'],
        pressed && styles['card-image-thumbnail-pressed'],
      ]}>
      <Image
        source={{ uri: imageUrl }}
        style={styles['card-image-thumbnail']}
        resizeMode="cover"
      />
    </Pressable>
  );
};

interface BoardCardProps {
  item: Board;
  onContextMenu: (board: Board) => void;
  onDetailPress: (board: Board, noteId?: string) => void;
  onPress?: (board: Board) => void;
}

const BoardCard = ({ item, onContextMenu, onDetailPress }: BoardCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasNotes = Array.isArray(item.notes) && item.notes.length > 0;
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(
    hasNotes ? item.notes![0].id : null,
  );
  const [ogDataCache, setOgDataCache] = useState<Record<string, OgData>>({});
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerImages, setImageViewerImages] = useState<string[]>([]);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const [videoViewerVisible, setVideoViewerVisible] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const toggleNote = (noteId: string) => {
    setExpandedNoteId(prev => (prev === noteId ? null : noteId));
  };

  const openImageViewer = (images: string[]) => {
    setImageViewerImages(images);
    setImageViewerIndex(0);
    setImageViewerVisible(true);
  };

  // OG 데이터 로드
  useEffect(() => {
    const loadOgData = async () => {
      if (!hasNotes) return;

      for (const note of item.notes!) {
        const urlsToCheck = note.urls && note.urls.length > 0 ? note.urls : (note.url ? [note.url] : []);

        for (const url of urlsToCheck) {
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
      }
    };

    loadOgData();
  }, [item.id, hasNotes, item.notes, ogDataCache]);

  return (
    <View style={styles['card-row']}>
      <Text style={styles['card-time']}>{formatTime(item.createdAt)}</Text>
      <View
        onLongPress={() => onContextMenu(item)}
        style={styles['card-wrapper']}>

        {/* 헤더 */}
        <View style={styles['card-header']}>
          <TouchableOpacity
            style={styles['card-header-title-touch']}
            onPress={() => onDetailPress(item)}
            activeOpacity={0.7}>
            <Text style={styles['card-header-title']} numberOfLines={1}>
              {item.title}
            </Text>
          </TouchableOpacity>
          <View style={styles['card-header-actions']}>
            <TouchableOpacity onPress={() => onContextMenu(item)} hitSlop={8}>
              <MoreIcon color="#FFFFFF" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsExpanded(prev => !prev)} hitSlop={8}>
              {isExpanded
                ? <ChevronUpIcon color="#FFFFFF" size={20} />
                : <ChevronDownIcon color="#FFFFFF" size={20} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* 태그 칩 */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles['card-tags-row']}>
            {item.tags.map(tag => (
              <View key={tag} style={styles['card-tag-chip']}>
                <Text style={styles['card-tag-text']}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 접힌 상태 */}
        {!isExpanded && hasNotes && (
          <View style={styles['card-collapsed-subtitle-row']}>
            <Text style={styles['card-collapsed-subtitle-text']} numberOfLines={1}>
              {expandedNoteId
                ? item.notes!.find(n => n.id === expandedNoteId)?.title ?? item.notes![0].title
                : item.notes![0].title}
            </Text>
          </View>
        )}

        {/* 펼쳐진 상태 */}
        {isExpanded && (
          <View style={styles['card-inner-card']}>
            {hasNotes
              ? (
                <View>
                  {item.notes!.slice(0, 3).map((note, idx) => {
                    const isNoteExpanded = expandedNoteId === note.id;
                    return (
                      <View key={note.id} style={styles['note-card-wrapper']}>
                        <TouchableOpacity
                          style={styles['sub-accordion-header']}
                          onPress={() => toggleNote(note.id)}
                          activeOpacity={0.7}>
                          <Text style={styles['sub-accordion-title']} numberOfLines={1}>
                            {note.title}
                          </Text>
                          {isNoteExpanded
                            ? <ChevronUpIcon color="#555555" size={16} />
                            : <ChevronDownIcon color="#555555" size={16} />}
                        </TouchableOpacity>

                        {isNoteExpanded && (
                          <TouchableOpacity
                            onPress={() => onDetailPress(item, note.id)}
                            activeOpacity={0.7}>
                            {!!note.content && (
                              <View style={styles['card-section-row']}>
                                <Text style={styles['card-section-label']}>내용</Text>
                                <Text style={styles['card-content-text']} numberOfLines={3}>
                                  {note.content}
                                </Text>
                              </View>
                            )}
                            {((note.imageUris?.length ?? 0) > 0 || (note.videos?.length ?? 0) > 0 || note.url || (note.files?.length ?? 0) > 0) && (
                              <>
                                <View style={styles['card-attachments-container']}>
                                  {(note.imageUris?.length ?? 0) > 0 && (
                                    <>
                                      <View style={styles['card-section-row']}>
                                        <Text style={styles['card-section-label']}>이미지</Text>
                                        <View style={styles['card-images-preview']}>
                                          {note.imageUris!.slice(0, 2).map((imageUrl, idx) => (
                                            <CardImageThumbnail
                                              key={`${note.id}-img-${idx}`}
                                              imageUrl={imageUrl}
                                              onPress={() => {
                                                openImageViewer(note.imageUris!);
                                              }}
                                            />
                                          ))}
                                          {(note.imageUris!.length ?? 0) > 2 && (
                                            <Pressable
                                              onPress={() => {
                                                openImageViewer(note.imageUris!);
                                              }}
                                              style={({ pressed }) => [
                                                styles['card-image-more'],
                                                pressed && styles['card-image-more-pressed'],
                                              ]}>
                                              <Text style={styles['card-image-more-text']}>
                                                +{note.imageUris!.length - 2}
                                              </Text>
                                            </Pressable>
                                          )}
                                        </View>
                                      </View>
                                    </>
                                  )}
                                  {((note.videos?.length ?? 0) > 0 || (note.videoUris?.length ?? 0) > 0) && (
                                    <>
                                      <View style={styles['card-section-row']}>
                                        <Text style={styles['card-section-label']}>동영상</Text>
                                        <View style={styles['card-videos-preview']}>
                                          {(note.videos || note.videoUris || [])!.slice(0, 2).map((video, idx) => {
                                            const videoUrl = typeof video === 'string' ? video : video.url;
                                            const thumbnailUrl = typeof video === 'string' ? undefined : video.thumbnailUrl;
                                            return (
                                              <Pressable
                                                key={`${note.id}-video-${idx}`}
                                                onPress={() => {
                                                  setSelectedVideoUrl(videoUrl);
                                                  setVideoViewerVisible(true);
                                                }}
                                                style={({ pressed }) => [
                                                  styles['card-video-thumbnail'],
                                                  pressed && styles['card-video-thumbnail-pressed'],
                                                ]}>
                                                {thumbnailUrl ? (
                                                  <Image
                                                    source={{ uri: thumbnailUrl }}
                                                    style={styles['card-video-thumbnail']}
                                                    resizeMode="cover"
                                                  />
                                                ) : (
                                                  <View style={styles['card-video-thumbnail-placeholder']}>
                                                    <Text style={styles['card-video-icon']}>▶</Text>
                                                  </View>
                                                )}
                                              </Pressable>
                                            );
                                          })}
                                          {((note.videos?.length ?? 0) + (note.videoUris?.length ?? 0)) > 2 && (
                                            <Text style={styles['card-video-more']}>
                                              +{((note.videos?.length ?? 0) + (note.videoUris?.length ?? 0)) - 2}
                                            </Text>
                                          )}
                                        </View>
                                      </View>
                                    </>
                                  )}
                                  {(note.files?.length ?? 0) > 0 && (
                                    <>
                                      <View style={styles['card-section-row']}>
                                        <Text style={styles['card-section-label']}>파일</Text>
                                        <View style={styles['card-files-preview']}>
                                          {note.files!.slice(0, 2).map((file, idx) => (
                                            <TouchableOpacity
                                              key={`${note.id}-file-${idx}`}
                                              style={styles['card-file-item']}
                                              onPress={() => {
                                                Linking.openURL(file.url).catch(() => {
                                                  console.error('Failed to open file:', file.url);
                                                });
                                              }}
                                              activeOpacity={0.7}>
                                              <Text style={styles['card-file-name']} numberOfLines={1}>
                                                {file.name || 'file'}
                                              </Text>
                                            </TouchableOpacity>
                                          ))}
                                          {(note.files!.length ?? 0) > 2 && (
                                            <Text style={styles['card-file-more']}>
                                              +{note.files!.length - 2}
                                            </Text>
                                          )}
                                        </View>
                                      </View>
                                    </>
                                  )}
                                  {(() => {
                                    const urlsToShow = note.urls && note.urls.length > 0 ? note.urls : (note.url ? [note.url] : []);
                                    const maxLinksToShow = 2;
                                    const linksToDisplay = urlsToShow.slice(0, maxLinksToShow);

                                    const getOgDataForUrl = (url: string, urlIndex: number) => {
                                      return ogDataCache[url] || note.ogDatas?.[urlIndex] ||
                                             (urlIndex === 0 ? note.ogData : undefined);
                                    };

                                    return urlsToShow.length > 0 ? (
                                      <>
                                        <View style={styles['card-section-row']}>
                                          <View style={styles['card-link-header']}>
                                            <Text style={styles['card-section-label']}>링크</Text>
                                            {urlsToShow.length > maxLinksToShow && (
                                              <Text style={styles['card-link-count']}>+{urlsToShow.length - maxLinksToShow}</Text>
                                            )}
                                          </View>
                                          <View style={styles['card-links-container']}>
                                            {linksToDisplay.map((url, displayIndex) => {
                                              const ogData = getOgDataForUrl(url, displayIndex);
                                              const displayDomain = url.match(/^(?:https?:\/\/)?([^/?#]+)/)?.[1] || url;

                                              return (
                                                <TouchableOpacity
                                                  key={url}
                                                  style={styles['card-link-card']}
                                                  onPress={() => {
                                                    Linking.openURL(url).catch(() => {
                                                      console.error('Failed to open URL:', url);
                                                    });
                                                  }}
                                                  activeOpacity={0.7}>
                                                  {ogData?.imageUrl ? (
                                                    <Image
                                                      source={{ uri: ogData.imageUrl }}
                                                      style={styles['card-link-image']}
                                                      resizeMode="cover"
                                                    />
                                                  ) : (
                                                    <View style={styles['card-link-image-placeholder']}>
                                                      <LinkIcon color="#AABBCC" size={20} />
                                                    </View>
                                                  )}
                                                  <View style={styles['card-link-info']}>
                                                    <Text style={styles['card-link-domain']} numberOfLines={1}>
                                                      {ogData?.siteName || displayDomain}
                                                    </Text>
                                                    <Text style={styles['card-link-title']} numberOfLines={2}>
                                                      {ogData?.title || '링크'}
                                                    </Text>
                                                    {!!ogData?.description && (
                                                      <Text style={styles['card-link-desc']} numberOfLines={1}>
                                                        {ogData.description}
                                                      </Text>
                                                    )}
                                                  </View>
                                                </TouchableOpacity>
                                              );
                                            })}
                                          </View>
                                        </View>
                                      </>
                                    ) : null;
                                  })()}
                                </View>
                              </>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                  {item.notes!.length > 3 && (
                    <TouchableOpacity
                      style={styles['more-notes-button']}
                      onPress={() => onDetailPress(item)}
                      activeOpacity={0.7}>
                      <Text style={styles['more-notes-text']}>
                        +{item.notes!.length - 3}개 더보기
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )
              : (
                <View style={styles['card-empty-notes']}>
                  <Text style={styles['card-empty-notes-text']}>노트 없음</Text>
                </View>
              )}
          </View>
        )}
      </View>

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
            ref={flatListRef}
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
    </View>
  );
};

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

export default BoardCard;

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Linking, Modal, FlatList, Dimensions, StyleSheet } from 'react-native';
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

interface BoardCardProps {
  item: Board;
  onContextMenu: (board: Board) => void;
  onDetailPress: (board: Board, noteId?: string) => void;
  onPress?: (board: Board) => void;
}

const BoardCard = ({ item, onContextMenu, onDetailPress, onPress }: BoardCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasNotes = Array.isArray(item.notes) && item.notes.length > 0;
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(
    hasNotes ? item.notes![0].id : null,
  );
  const [ogDataCache, setOgDataCache] = useState<Record<string, OgData>>({});
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerImages, setImageViewerImages] = useState<string[]>([]);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
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

      const notesNeedingOgData = item.notes!.filter(
        note => note.url && !note.ogData && !ogDataCache[note.url]
      );

      if (notesNeedingOgData.length === 0) return;

      for (const note of notesNeedingOgData) {
        try {
          const ogData = await fetchOgData(note.url!);
          setOgDataCache(prev => ({
            ...prev,
            [note.url!]: ogData,
          }));
        } catch (error) {
          console.error('Failed to load OG data for note:', note.url, error);
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
                    const isLast = idx === Math.min(item.notes!.length - 1, 2);
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
                            {((note.imageUris?.length ?? 0) > 0 || note.url || (note.files?.length ?? 0) > 0) && (
                              <>
                                <View style={styles['card-attachments-container']}>
                                  {(note.imageUris?.length ?? 0) > 0 && (
                                    <>
                                      <View style={styles['card-section-divider']} />
                                      <View style={styles['card-section-row']}>
                                        <Text style={styles['card-section-label']}>이미지</Text>
                                        <TouchableOpacity
                                          onPress={() => openImageViewer(note.imageUris!)}
                                          activeOpacity={0.7}>
                                          <View style={styles['card-images-preview']}>
                                            {note.imageUris!.slice(0, 2).map((uri, idx) => (
                                              <Image
                                                key={`${note.id}-img-${idx}`}
                                                source={{ uri }}
                                                style={styles['card-image-thumbnail']}
                                                resizeMode="cover"
                                              />
                                            ))}
                                            {(note.imageUris!.length ?? 0) > 2 && (
                                              <View style={styles['card-image-more']}>
                                                <Text style={styles['card-image-more-text']}>
                                                  +{note.imageUris!.length - 2}
                                                </Text>
                                              </View>
                                            )}
                                          </View>
                                        </TouchableOpacity>
                                      </View>
                                    </>
                                  )}
                                  {(note.files?.length ?? 0) > 0 && (
                                    <>
                                      <View style={styles['card-section-divider']} />
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
                                              +{note.files!.length - 2}개
                                            </Text>
                                          )}
                                        </View>
                                      </View>
                                    </>
                                  )}
                                  {note.url && (() => {
                                    const ogData = note.ogData ?? ogDataCache[note.url];
                                    const displayDomain = note.url.match(/^(?:https?:\/\/)?([^/?#]+)/)?.[1] || note.url;

                                    return (
                                      <>
                                        <View style={styles['card-section-divider']} />
                                        <View style={styles['card-section-row']}>
                                          <Text style={styles['card-section-label']}>링크</Text>
                                          <TouchableOpacity
                                            style={styles['card-link-card']}
                                            onPress={() => {
                                              Linking.openURL(note.url!).catch(() => {
                                                console.error('Failed to open URL:', note.url);
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
                                        </View>
                                      </>
                                    );
                                  })()}
                                  {(() => {
                                    const hasExtraImages = (note.imageUris?.length ?? 0) > 2;
                                    const hasExtraFiles = (note.files?.length ?? 0) > 2;
                                    if (hasExtraImages || hasExtraFiles) {
                                      return (
                                        <View style={styles['card-more-content-badge']}>
                                          <Text style={styles['card-more-content-text']}>
                                            {hasExtraImages && hasExtraFiles
                                              ? '더 많은 이미지와 파일이 있습니다'
                                              : hasExtraImages
                                                ? '더 많은 이미지가 있습니다'
                                                : '더 많은 파일이 있습니다'}
                                          </Text>
                                        </View>
                                      );
                                    }
                                    return null;
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
          <TouchableOpacity
            style={imageViewerStyles.closeButton}
            onPress={() => setImageViewerVisible(false)}>
            <Text style={imageViewerStyles.closeText}>✕</Text>
          </TouchableOpacity>

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

export default BoardCard;

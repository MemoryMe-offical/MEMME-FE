import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Linking,
  Modal,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Board, Note, FileAttachment, Memo } from '../types';
import { ArrowLeftIcon } from '../components/common/Icons';
import { fetchOgData } from '../services/ogService';
import ImageViewerModal from '../components/common/ImageViewerModal';
import LoadingImage from '../components/common/LoadingImage';
import InAppBrowser from 'react-native-inappbrowser-reborn';

type Props = NativeStackScreenProps<RootStackParamList, 'MediaGallery'>;

const SCREEN_WIDTH = Dimensions.get('window').width;
const THUMBNAIL_SIZE = (SCREEN_WIDTH - 48) / 3;

interface MediaItem {
  id: string;
  uri: string;
  title?: string;
  createdAt: string;
  type: 'image' | 'video' | 'file' | 'link';
  note?: Note;
  board?: Board;
  file?: FileAttachment;
  ogData?: any;
  timelineItem?: any;
}

const GalleryImageThumbnail = ({ imageUrl, width, height }: { imageUrl: string; width: number; height: number }) => {
  return (
    <LoadingImage
      source={{ uri: imageUrl }}
      style={[styles.thumbnail, { width, height, backgroundColor: '#EEF3FF' }]}
      onError={() => console.log('Failed to render gallery image')}
    />
  );
};

const MediaGalleryScreen = ({ route, navigation }: Props) => {
  const { items: allItems, galleryType } = route.params;
  const insets = useSafeAreaInsets();
  const [cachedOgData, setCachedOgData] = useState<Record<string, any>>({});
  const [imageViewerState, setImageViewerState] = useState({
    visible: false,
    uris: [] as string[],
    index: 0,
  });
  const [videoViewerState, setVideoViewerState] = useState({
    visible: false,
    url: '',
  });

  const mediaItems = useMemo(() => {
    const items: MediaItem[] = [];

    // 북마크 처리
    if (galleryType === 'bookmarks') {
      allItems
        .filter((item: any) => item.bookmarked)
        .forEach((item: any) => {
          items.push({
            id: item.id,
            uri: '',
            title: item.type === 'board' ? item.title : item.text,
            type: item.type === 'board' ? 'link' : 'image',
            createdAt: item.createdAt,
            board: item.type === 'board' ? item : undefined,
            timelineItem: item,
          });
        });
    } else {
      // 다른 미디어 처리
      const boards = allItems.filter((item: any) => item.type === 'board') as Board[];
      const memos = allItems.filter((item: any) => item.type === 'memo') as any[];

      // 보드의 노트에서 미디어 처리
      boards.forEach(board => {
        (board.notes ?? []).forEach(note => {
          if (galleryType === 'images' && note.imageUris) {
            note.imageUris.forEach((uri, idx) => {
              items.push({
                id: `img-${board.id}-${note.id}-${idx}`,
                uri,
                type: 'image',
                createdAt: board.updatedAt || board.createdAt,
                note,
                board,
              });
            });
          } else if (galleryType === 'videos' && (note.videos || note.videoUris)) {
            const videoList = note.videos || note.videoUris || [];
            videoList.forEach((video, idx) => {
              const videoUrl = typeof video === 'string' ? video : video.url;
              const videoThumb = typeof video === 'string' ? undefined : video.thumbnailUrl;
              items.push({
                id: `video-${board.id}-${note.id}-${idx}`,
                uri: videoUrl,
                title: `${idx + 1}`,
                type: 'video',
                createdAt: board.updatedAt || board.createdAt,
                note,
                board,
                file: typeof video === 'string' ? undefined : video,
              });
            });
          } else if (galleryType === 'files' && note.files) {
            note.files.forEach((file, idx) => {
              items.push({
                id: `file-${board.id}-${note.id}-${idx}`,
                uri: file.url,
                title: file.name,
                type: 'file',
                createdAt: board.updatedAt || board.createdAt,
                note,
                board,
                file,
              });
            });
          } else if (galleryType === 'links') {
            // 배열 형식의 URLs 처리
            if (note.urls && note.urls.length > 0) {
              note.urls.forEach((url, idx) => {
                const ogData = note.ogDatas?.[idx];
                const cachedOg = cachedOgData[`link-${board.id}-${note.id}-${idx}`];
                items.push({
                  id: `link-${board.id}-${note.id}-${idx}`,
                  uri: url,
                  title: cachedOg?.title || ogData?.title || url,
                  type: 'link',
                  createdAt: board.updatedAt || board.createdAt,
                  note: { ...note, url } as Note,
                  board,
                  ogData: cachedOg || ogData,
                });
              });
            } else if (note.url) {
              // 레거시 단수 형식 호환
              const cachedOg = cachedOgData[`link-${board.id}-${note.id}`];
              items.push({
                id: `link-${board.id}-${note.id}`,
                uri: note.url,
                title: cachedOg?.title || note.ogData?.title || note.url,
                type: 'link',
                createdAt: board.updatedAt || board.createdAt,
                note,
                board,
                ogData: cachedOg || note.ogData,
              });
            }
          }
        });
      });

      // 메모에서 미디어 처리
      memos.forEach((memo: any) => {
        if (galleryType === 'images' && memo.imageUris) {
          memo.imageUris.forEach((uri: string, idx: number) => {
            items.push({
              id: `memo-img-${memo.id}-${idx}`,
              uri,
              type: 'image',
              createdAt: memo.updatedAt || memo.createdAt,
              timelineItem: memo,
            });
          });
        } else if (galleryType === 'videos' && (memo.videos || memo.videoUris)) {
          const videoList = memo.videos || memo.videoUris || [];
          videoList.forEach((video: any, idx: number) => {
            const videoUrl = typeof video === 'string' ? video : video.url;
            items.push({
              id: `memo-video-${memo.id}-${idx}`,
              uri: videoUrl,
              title: `${idx + 1}`,
              type: 'video',
              createdAt: memo.updatedAt || memo.createdAt,
              file: typeof video === 'string' ? undefined : video,
              timelineItem: memo,
            });
          });
        } else if (galleryType === 'files' && memo.files) {
          memo.files.forEach((file: any, idx: number) => {
            items.push({
              id: `memo-file-${memo.id}-${idx}`,
              uri: file.url,
              title: file.name,
              type: 'file',
              createdAt: memo.updatedAt || memo.createdAt,
              file,
              timelineItem: memo,
            });
          });
        } else if (galleryType === 'links') {
          // 배열 형식의 URLs 처리
          if (memo.urls && memo.urls.length > 0) {
            memo.urls.forEach((url: string, idx: number) => {
              const ogData = memo.ogDatas?.[idx];
              const cachedOg = cachedOgData[`memo-link-${memo.id}-${idx}`];
              items.push({
                id: `memo-link-${memo.id}-${idx}`,
                uri: url,
                title: cachedOg?.title || ogData?.title || url,
                type: 'link',
                createdAt: memo.updatedAt || memo.createdAt,
                ogData: cachedOg || ogData,
                timelineItem: memo,
              });
            });
          } else if (memo.url) {
            // 레거시 단수 형식 호환
            const cachedOg = cachedOgData[`memo-link-${memo.id}`];
            items.push({
              id: `memo-link-${memo.id}`,
              uri: memo.url,
              title: cachedOg?.title || memo.ogData?.title || memo.url,
              type: 'link',
              createdAt: memo.updatedAt || memo.createdAt,
              ogData: cachedOg || memo.ogData,
              timelineItem: memo,
            });
          }
        }
      });
    }

    // 최신순 정렬
    return items.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [allItems, galleryType, cachedOgData]);

  const getTitle = () => {
    switch (galleryType) {
      case 'images':
        return '사진';
      case 'videos':
        return '동영상';
      case 'files':
        return '파일';
      case 'links':
        return '링크';
      case 'bookmarks':
        return '북마크';
      default:
        return '';
    }
  };

  useEffect(() => {
    if (galleryType !== 'links') return;

    const loadOgData = async () => {
      const boards = allItems.filter((item: any) => item.type === 'board') as Board[];
      const memos = allItems.filter((item: any) => item.type === 'memo') as any[];
      const newCachedOgData = { ...cachedOgData };

      // 보드의 노트에서 링크의 OG 데이터 로드
      for (const board of boards) {
        for (const note of (board.notes ?? [])) {
          // 배열 형식의 URLs 처리
          if (note.urls && note.urls.length > 0) {
            for (let idx = 0; idx < note.urls.length; idx++) {
              const url = note.urls[idx];
              const linkId = `link-${board.id}-${note.id}-${idx}`;
              if (newCachedOgData[linkId] || note.ogDatas?.[idx]) continue;

              try {
                const ogData = await fetchOgData(url);
                if (ogData) {
                  newCachedOgData[linkId] = ogData;
                }
              } catch (error) {
                console.error(`Failed to fetch OG data for ${url}:`, error);
              }
            }
          } else if (note.url) {
            // 레거시 단수 형식 호환
            const linkId = `link-${board.id}-${note.id}`;
            if (newCachedOgData[linkId] || note.ogData) continue;

            try {
              const ogData = await fetchOgData(note.url);
              if (ogData) {
                newCachedOgData[linkId] = ogData;
              }
            } catch (error) {
              console.error(`Failed to fetch OG data for ${note.url}:`, error);
            }
          }
        }
      }

      // 메모에서 링크의 OG 데이터 로드
      for (const memo of memos) {
        // 배열 형식의 URLs 처리
        if (memo.urls && memo.urls.length > 0) {
          for (let idx = 0; idx < memo.urls.length; idx++) {
            const url = memo.urls[idx];
            const linkId = `memo-link-${memo.id}-${idx}`;
            if (newCachedOgData[linkId] || memo.ogDatas?.[idx]) continue;

            try {
              const ogData = await fetchOgData(url);
              if (ogData) {
                newCachedOgData[linkId] = ogData;
              }
            } catch (error) {
              console.error(`Failed to fetch OG data for ${url}:`, error);
            }
          }
        } else if (memo.url) {
          // 레거시 단수 형식 호환
          const linkId = `memo-link-${memo.id}`;
          if (newCachedOgData[linkId] || memo.ogData) continue;

          try {
            const ogData = await fetchOgData(memo.url);
            if (ogData) {
              newCachedOgData[linkId] = ogData;
            }
          } catch (error) {
            console.error(`Failed to fetch OG data for ${memo.url}:`, error);
          }
        }
      }

      setCachedOgData(newCachedOgData);
    };

    loadOgData();
  }, [galleryType, allItems]);

  const renderBookmarkItem = ({ item }: { item: MediaItem }) => (
    <TouchableOpacity
      style={[styles.bookmarkItem, { width: THUMBNAIL_SIZE }]}
      onPress={() => {
        if (item.board) {
          navigation.navigate('BoardDetail', { board: item.board });
        } else if (item.timelineItem) {
          navigation.setParams({ scrollToItemId: item.timelineItem.id });
          navigation.goBack();
        }
      }}
    >
      <View style={styles.bookmarkItemContent}>
        <Text style={styles.bookmarkItemEmoji}>⭐</Text>
        <Text style={styles.bookmarkItemTitle} numberOfLines={2}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderImageItem = ({ item, index }: { item: MediaItem; index?: number }) => {
    const images = mediaItems.filter(m => m.type === 'image');
    const currentIdx = images.findIndex(m => m.id === item.id);

    return (
      <TouchableOpacity
        onPress={() => {
          setImageViewerState({
            visible: true,
            uris: images.map(m => m.uri),
            index: currentIdx,
          });
        }}
      >
        <GalleryImageThumbnail imageUrl={item.uri} width={THUMBNAIL_SIZE} height={THUMBNAIL_SIZE} />
      </TouchableOpacity>
    );
  };

  const renderVideoItem = ({ item }: { item: MediaItem }) => (
    <TouchableOpacity
      onPress={() => setVideoViewerState({ visible: true, url: item.uri })}
    >
      <View style={[styles.thumbnail, { width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE }]}>
        {(item.file as any)?.thumbnailUrl ? (
          <>
            <Image
              source={{ uri: (item.file as any).thumbnailUrl }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.videoOverlay}>
              <Text style={styles.videoPlayIcon}>▶</Text>
            </View>
          </>
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.videoPlaceholder]}>
            <Text style={styles.videoPlayIcon}>▶</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFileItem = ({ item }: { item: MediaItem }) => {
    const handleOpenFile = () => {
      try {
        if (item.file?.url) {
          let fileUrl = item.file.url;
          if (!fileUrl.startsWith('http')) {
            fileUrl = `https://memme.o-r.kr${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
          }
          Linking.openURL(fileUrl);
        }
      } catch (error) {
        console.error('Failed to open file:', error);
      }
    };

    return (
      <TouchableOpacity onPress={handleOpenFile}>
        <View style={[styles.fileItem, { width: THUMBNAIL_SIZE }]}>
          <Text style={styles.fileIcon}>📄</Text>
          <Text style={styles.fileName} numberOfLines={2}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderLinkItem = ({ item }: { item: MediaItem }) => {
    const linkUrl = item.uri || '';
    const linkTitle = item.ogData?.title || item.title || linkUrl;

    const handleOpenLink = async () => {
      try {
        if (await InAppBrowser.isAvailable()) {
          await InAppBrowser.open(linkUrl, {
            modalPresentationStyle: 'pageSheet',
          });
        } else {
          Linking.openURL(linkUrl);
        }
      } catch (error) {
        Linking.openURL(linkUrl);
      }
    };

    return (
      <TouchableOpacity
        style={[styles.linkItem, { width: THUMBNAIL_SIZE }]}
        onPress={handleOpenLink}
      >
        {item.ogData?.imageUrl ? (
          <Image
            source={{ uri: item.ogData.imageUrl }}
            style={styles.linkImage}
          />
        ) : (
          <View style={styles.linkImagePlaceholder} />
        )}
        <View style={styles.linkContent}>
          <Text style={styles.linkTitle} numberOfLines={2}>{linkTitle}</Text>
          {linkUrl && (
            <Text style={styles.linkUrl} numberOfLines={1}>{linkUrl}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: MediaItem }) => {
    if (galleryType === 'images') return renderImageItem({ item });
    if (galleryType === 'videos') return renderVideoItem({ item });
    if (galleryType === 'files') return renderFileItem({ item });
    if (galleryType === 'links') return renderLinkItem({ item });
    if (galleryType === 'bookmarks') return renderBookmarkItem({ item });
    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={[styles.headerSafeTop, { height: insets.top }]} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={8}>
          <ArrowLeftIcon color="#1A1A1A" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTitle()}</Text>
        <View style={styles.headerCount}>
          <Text style={styles.countText}>{mediaItems.length}</Text>
        </View>
      </View>

      {mediaItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>저장된 {getTitle()}이 없습니다</Text>
          <Text style={styles.emptyStateDesc}>
            {getTitle()}을 추가하면 이곳에 표시됩니다
          </Text>
        </View>
      ) : (
        <FlatList
          data={mediaItems}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContent}
          scrollIndicatorInsets={{ right: 1 }}
        />
      )}

      <ImageViewerModal
        visible={imageViewerState.visible}
        imageUris={imageViewerState.uris}
        initialIndex={imageViewerState.index}
        onClose={() => setImageViewerState(prev => ({ ...prev, visible: false }))}
      />

      {/* 동영상 뷰어 모달 */}
      <Modal
        visible={videoViewerState.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVideoViewerState({ visible: false, url: '' })}
      >
        <View style={styles.videoViewerContainer}>
          <View style={styles.videoViewerHeader}>
            <TouchableOpacity
              style={styles.videoViewerClose}
              onPress={() => setVideoViewerState({ visible: false, url: '' })}
            >
              <Text style={styles.videoViewerCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.videoViewerFileName} numberOfLines={1}>
              {videoViewerState.url?.split('/').pop() || '동영상'}
            </Text>
          </View>

          {videoViewerState.url && (
            <TouchableOpacity
              style={styles.videoPlayerContainer}
              onPress={() => {
                Linking.openURL(videoViewerState.url).catch(() => {
                  console.error('Failed to open video:', videoViewerState.url);
                });
              }}
            >
              <Text style={styles.videoPlayerIcon}>▶</Text>
              <Text style={styles.videoPlayerText}>눌러서 재생</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF' },
  headerSafeTop: { backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEF8',
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },
  headerCount: {
    backgroundColor: '#E8EEFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },
  row: {
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  gridContent: {
    paddingVertical: 16,
    paddingBottom: 32,
  },
  thumbnail: {
    borderRadius: 12,
    backgroundColor: '#F0F5FF',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
  },
  videoPlayIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
  },
  fileItem: {
    backgroundColor: '#F7FAFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E4ECFF',
    height: THUMBNAIL_SIZE,
    justifyContent: 'center',
  },
  fileIcon: {
    fontSize: 28,
  },
  fileName: {
    fontSize: 11,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    textAlign: 'center',
    lineHeight: 15,
  },
  linkItem: {
    flexDirection: 'column',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4ECFF',
  },
  linkImage: {
    width: '100%',
    height: THUMBNAIL_SIZE * 0.6,
    backgroundColor: '#F0F5FF',
  },
  linkImagePlaceholder: {
    width: '100%',
    height: THUMBNAIL_SIZE * 0.6,
    backgroundColor: '#F0F5FF',
  },
  linkContent: {
    flex: 1,
    padding: 8,
    gap: 3,
  },
  linkTitle: {
    fontSize: 11,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    lineHeight: 15,
    fontWeight: '500',
  },
  linkUrl: {
    fontSize: 9,
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    lineHeight: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7E9A',
    fontFamily: 'PretendardVariable',
  },
  emptyStateDesc: {
    fontSize: 13,
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    textAlign: 'center',
  },
  bookmarkItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4ECFF',
    padding: 12,
    height: THUMBNAIL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkItemContent: {
    alignItems: 'center',
    gap: 8,
  },
  bookmarkItemEmoji: {
    fontSize: 28,
  },
  bookmarkItemTitle: {
    fontSize: 11,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    textAlign: 'center',
    lineHeight: 15,
  },
  videoPlaceholder: {
    backgroundColor: '#EEF3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoViewerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoViewerHeader: {
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
  videoViewerClose: {
    padding: 8,
  },
  videoViewerCloseText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  videoViewerFileName: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'PretendardVariable',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  videoPlayerContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  videoPlayerIcon: {
    fontSize: 48,
    color: '#FFFFFF',
  },
  videoPlayerText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'PretendardVariable',
  },
});

export default MediaGalleryScreen;

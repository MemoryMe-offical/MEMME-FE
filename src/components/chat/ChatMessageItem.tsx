// 채팅 아이템 컴포넌트

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Linking, ActivityIndicator, FlatList } from 'react-native';
import { Memo } from '../../types';
import { chatMessageItemStyles as styles, CHAT_MESSAGE_MAX_WIDTH, CHAT_LINK_CARD_MAX_WIDTH } from '../../styles/ChatMessageItem.styles';
import { fetchOgData } from '../../services/ogService';
import { FileIcon } from '../common/Icons';

// 파일 크기 포맷팅
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const isAM = hours < 12;
  const displayHours = hours % 12 || 12;
  return `${isAM ? '오전' : '오후'} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
};

interface ChatMessageItemProps {
  item: Memo;
  expanded?: boolean;
  showTime?: boolean;
  onToggleExpand?: (item: Memo) => void;
  onLongPress: (item: Memo) => void;
  onOpenLinkModal?: (url: string, ogData?: any) => void;
  onImagePress?: (imageUri: string, allImageUris: string[]) => void;
}

const ChatMessageItem = ({ item, expanded = false, showTime = true, onToggleExpand, onLongPress, onOpenLinkModal, onImagePress }: ChatMessageItemProps) => {
  const maxChars = 500;
  const text = item.text || '';
  const isLong = text.length > maxChars;
  const displayText = expanded ? text : text.substring(0, maxChars);

  const [detectedOgData, setDetectedOgData] = useState<any>(null);
  const [isLoadingOg, setIsLoadingOg] = useState(false);
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const detectUrlFromText = (text: string): string | null => {
    const urlRegex = /https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}(?:[^\s]*)?/g;
    const matches = text.match(urlRegex);
    if (matches && matches.length > 0) {
      let url = matches[0];
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      return url;
    }
    return null;
  };

  // 메모에 이미 링크 정보가 있으면 사용, 없으면 텍스트에서 감지
  const hasStoredLink = item.urls && item.urls.length > 0;
  const firstLink = hasStoredLink ? item.urls?.[0] : detectUrlFromText(text);
  const firstOgData = hasStoredLink && item.ogDatas && item.ogDatas.length > 0 ? item.ogDatas[0] : detectedOgData;

  // 텍스트에서 감지한 링크의 OG 데이터 조회
  useEffect(() => {
    if (hasStoredLink || !firstLink) return; // 이미 저장된 링크가 있거나 링크가 없으면 스킵

    setIsLoadingOg(true);
    fetchOgData(firstLink)
      .then(data => setDetectedOgData(data || null))
      .catch(error => {
        console.error('Failed to fetch OG data:', error);
        setDetectedOgData(null);
      })
      .finally(() => setIsLoadingOg(false));
  }, [firstLink, hasStoredLink]);

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(() => {
      console.error('Failed to open URL:', url);
    });
  };

  const handleImageLoadStart = (uri: string) => {
    setLoadingImages(prev => new Set([...prev, uri]));
  };

  const handleImageLoadEnd = (uri: string) => {
    setLoadingImages(prev => {
      const next = new Set(prev);
      next.delete(uri);
      return next;
    });
  };

  const renderImageWithLoader = (uri: string, imageStyle: any) => {
    const isLoading = loadingImages.has(uri);
    return (
      <View style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Image
          source={{ uri }}
          style={imageStyle}
          resizeMode="cover"
          onLoadStart={() => handleImageLoadStart(uri)}
          onLoadEnd={() => handleImageLoadEnd(uri)}
        />
        {isLoading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}>
            <ActivityIndicator size="large" color="#588DFF" />
          </View>
        )}
      </View>
    );
  };

  // 이미지 그리드 렌더링 (1열 전체, 2열, 3열, 4장+ 스크롤 2열 그리드)
  const renderImageGrid = () => {
    if (!item.imageUris || item.imageUris.length === 0) return null;

    const imageCount = item.imageUris.length;
    const imageSize = (CHAT_MESSAGE_MAX_WIDTH - 4) / 2;

    if (imageCount === 1) {
      // 1장: 전체 너비
      return (
        <TouchableOpacity
          onPress={() => onImagePress?.(item.imageUris![0], item.imageUris!)}
          onLongPress={() => onLongPress(item)}
          delayLongPress={400}
          style={[styles['media-container'], { width: CHAT_MESSAGE_MAX_WIDTH }]}>
          <View style={{ width: '100%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden' }}>
            {renderImageWithLoader(item.imageUris![0], { width: '100%', height: '100%' })}
          </View>
        </TouchableOpacity>
      );
    }

    if (imageCount === 2) {
      // 2장: 나란히 2열
      return (
        <TouchableOpacity
          onLongPress={() => onLongPress(item)}
          delayLongPress={400}
          style={[styles['media-container']]}>
          <View style={styles['image-row']}>
            {item.imageUris!.slice(0, 2).map((uri, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => onImagePress?.(uri, item.imageUris!)}
                style={[styles['image-cell'], { width: imageSize, height: imageSize }]}>
                {renderImageWithLoader(uri, styles['image-thumbnail'])}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      );
    }

    if (imageCount === 3) {
      // 3장: 상단 2열 + 하단 1열
      return (
        <TouchableOpacity
          onLongPress={() => onLongPress(item)}
          delayLongPress={400}
          style={[styles['media-container']]}>
          <View style={styles['image-grid']}>
            {/* 첫 2장 */}
            <View style={styles['image-row']}>
              {item.imageUris!.slice(0, 2).map((uri, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => onImagePress?.(uri, item.imageUris!)}
                  style={[styles['image-cell'], { width: imageSize, height: imageSize }]}>
                  {renderImageWithLoader(uri, styles['image-thumbnail'])}
                </TouchableOpacity>
              ))}
            </View>
            {/* 마지막 1장 (전체 너비) */}
            <TouchableOpacity
              onPress={() => onImagePress?.(item.imageUris![2], item.imageUris!)}
              style={{ width: '100%', aspectRatio: 2 / 1, borderRadius: 12, overflow: 'hidden' }}>
              {renderImageWithLoader(item.imageUris![2], { width: '100%', height: '100%' })}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    }

    // 4장 이상: 스크롤 가능한 2열 그리드 (카카오톡 스타일)
    const rowCount = Math.ceil(imageCount / 2);
    const gridHeight = rowCount * imageSize + (rowCount - 1) * 4 + 16;
    const maxGridHeight = Math.min(gridHeight, 800); // 최대 800px까지만 스크롤 가능하게 제한

    return (
      <View style={[styles['media-container'], { marginBottom: 8 }]}>
        <FlatList
          data={item.imageUris}
          numColumns={2}
          keyExtractor={(_, idx) => idx.toString()}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
          style={{
            width: CHAT_MESSAGE_MAX_WIDTH,
            maxHeight: maxGridHeight,
          }}
          columnWrapperStyle={{ gap: 4 }}
          contentContainerStyle={{ paddingBottom: 4 }}
          renderItem={({ item: imageUri }) => (
            <TouchableOpacity
              onPress={() => onImagePress?.(imageUri, item.imageUris!)}
              onLongPress={() => onLongPress(item)}
              delayLongPress={400}
              style={[styles['image-cell'], { width: imageSize, height: imageSize }]}>
              {renderImageWithLoader(imageUri, styles['image-thumbnail'])}
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  // 동영상 렌더링
  const renderVideo = () => {
    if (!item.videos || item.videos.length === 0) return null;
    const video = item.videos[0];

    return (
      <TouchableOpacity
        onLongPress={() => onLongPress(item)}
        delayLongPress={400}
        style={styles['video-container']}
        onPress={() => {
          Linking.openURL(video.url).catch(() => {
            console.error('Failed to open video:', video.url);
          });
        }}>
        {video.thumbnailUrl ? (
          renderImageWithLoader(video.thumbnailUrl, styles['video-thumbnail'])
        ) : (
          <View style={[styles['video-thumbnail'], { backgroundColor: '#1A1A1A' }]} />
        )}
        <View style={styles['video-play-icon']}>
          <View style={styles['video-play-button']}>
            <Text style={{ fontSize: 24 }}>▶</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // 파일 렌더링
  const renderFile = () => {
    if (!item.files || item.files.length === 0) return null;
    const file = item.files[0];

    return (
      <TouchableOpacity
        onLongPress={() => onLongPress(item)}
        delayLongPress={400}
        style={styles['file-container']}
        onPress={() => {
          Linking.openURL(file.url).catch(() => {
            console.error('Failed to open file:', file.url);
          });
        }}>
        <View style={styles['file-icon-container']}>
          <FileIcon color="#588DFF" size={20} />
        </View>
        <View style={styles['file-info']}>
          <Text style={styles['file-name']} numberOfLines={1}>
            {file.name}
          </Text>
          <Text style={styles['file-size']}>
            {formatFileSize(file.size)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // 미디어가 있는지 확인
  const hasMedia = (item.imageUris?.length ?? 0) > 0 || (item.videos?.length ?? 0) > 0 || (item.files?.length ?? 0) > 0;
  const hasText = text.trim().length > 0;

  return (
    <View style={styles['container']}>
      {/* 메시지 + 시간 행 */}
      <View style={styles['message-row']}>
        {/* 시간 - 텍스트가 있고 showTime이 true일 때만 표시 */}
        {hasText && showTime && (
          <Text style={styles['chatMessageItem-time']}>
            {formatTime(item.createdAt)}
          </Text>
        )}

        {/* 텍스트 메시지 (있으면 표시) */}
        <View style={styles['message-bubble-wrapper']}>
          {hasText && (
            <TouchableOpacity
              style={styles['chatMessageItem-bubble']}
              onPress={() => {
                if (isLong && onToggleExpand) {
                  onToggleExpand(item);
                } else {
                  onLongPress(item);
                }
              }}
              onLongPress={() => onLongPress(item)}
              delayLongPress={400}
              activeOpacity={0.85}>
              <Text
                style={styles['chatMessageItem-bubble-text']}>
                {displayText}
                {!expanded && isLong && '...'}
              </Text>
              {/* 전문 보기 힌트 */}
              {!expanded && isLong && (
                <Text style={styles['expand-hint-text']}>
                  - 본문을 눌러 전문 보기 -
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 링크 관련 아이템들 */}
      <View style={styles['links-container']}>
          {/* OG 데이터 로딩 중 */}
          {firstLink && isLoadingOg && !firstOgData && (
            <View style={[styles['og-loading'], { marginTop: text.trim().length > 0 ? 8 : 0, marginRight: 8 }]}>
              <ActivityIndicator size="small" color="#588DFF" />
              <Text style={styles['og-loading-text']}>
                링크 정보 불러오는 중...
              </Text>
            </View>
          )}

          {/* 링크 카드 (있으면 표시) */}
          {firstLink && firstOgData && (
            <TouchableOpacity
              onPress={() => handleLinkPress(firstLink)}
              onLongPress={() => onLongPress(item)}
              delayLongPress={400}
              style={[styles['link-card'], { marginTop: text.trim().length > 0 ? 8 : 0, marginRight: 8 }]}>
              {/* 썸네일 */}
              {firstOgData.imageUrl && (
                <View style={{ width: '100%', height: 120, overflow: 'hidden' }}>
                  {renderImageWithLoader(firstOgData.imageUrl, styles['link-card-image'])}
                </View>
              )}

              {/* 내용 */}
              <View style={styles['link-card-content']}>
                {firstOgData.title && (
                  <Text style={styles['link-card-title']} numberOfLines={2}>
                    {firstOgData.title}
                  </Text>
                )}
                {firstOgData.description && (
                  <Text style={styles['link-card-description']} numberOfLines={2}>
                    {firstOgData.description}
                  </Text>
                )}
                <Text style={styles['link-card-domain']} numberOfLines={1}>
                  {firstOgData.siteName || firstLink}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* 텍스트도 없고 링크 정보도 불완전한 경우 (OgData 없이 링크만 있는 경우) */}
          {firstLink && !firstOgData && (
            <TouchableOpacity
              onPress={() => handleLinkPress(firstLink)}
              onLongPress={() => onLongPress(item)}
              delayLongPress={400}
              style={[styles['link-only-card'], { marginTop: text.trim().length > 0 ? 8 : 0, marginRight: 8 }]}>
              <Text style={styles['link-only-text']} numberOfLines={1}>
                🔗 {firstLink}
              </Text>
            </TouchableOpacity>
          )}
      </View>

      {/* 링크 추가 버튼 (별도 행) */}
      {firstLink && onOpenLinkModal && (
        <View style={styles['button-wrapper']}>
          <TouchableOpacity
            onPress={() => onOpenLinkModal(firstLink, firstOgData)}
            style={styles['add-link-button']}>
            <Text style={styles['add-link-button-text']}>
              ↳ 링크를 노트에 추가하기
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 미디어만 있을 때 (텍스트 없음) - 시간 + 미디어 행 */}
      {!hasText && hasMedia && (
        <View style={styles['media-row']}>
          {/* 시간 - showTime이 true일 때만 표시 */}
          {showTime && (
            <Text style={styles['chatMessageItem-time']}>
              {formatTime(item.createdAt)}
            </Text>
          )}

          {/* 미디어 - 컨테이너 없이 직접 렌더링 */}
          {renderImageGrid()}
          {renderVideo()}
          {renderFile()}
        </View>
      )}

      {/* 텍스트가 있을 때만 미디어 표시 (시간은 텍스트와 함께) */}
      {hasText && (
        <>
          {renderImageGrid()}
          {renderVideo()}
          {renderFile()}
        </>
      )}
    </View>
  );
};

export default ChatMessageItem;

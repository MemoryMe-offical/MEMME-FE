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
  onToggleExpand?: (item: Memo) => void;
  onLongPress: (item: Memo) => void;
  onOpenLinkModal?: (url: string, ogData?: any) => void;
}

const ChatMessageItem = ({ item, expanded = false, onToggleExpand, onLongPress, onOpenLinkModal }: ChatMessageItemProps) => {
  const maxChars = 500;
  const isLong = item.text.length > maxChars;
  const displayText = expanded ? item.text : item.text.substring(0, maxChars);

  const [detectedOgData, setDetectedOgData] = useState<any>(null);
  const [isLoadingOg, setIsLoadingOg] = useState(false);

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
  const firstLink = hasStoredLink ? item.urls?.[0] : detectUrlFromText(item.text);
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

  // 이미지 그리드 렌더링 (1열 전체, 2열, 3열, 4열+ 2x2)
  const renderImageGrid = () => {
    if (!item.imageUris || item.imageUris.length === 0) return null;

    const imageCount = item.imageUris.length;
    const imageSize = (CHAT_MESSAGE_MAX_WIDTH - 4) / 2;

    if (imageCount === 1) {
      // 1장: 전체 너비
      return (
        <TouchableOpacity
          onLongPress={() => onLongPress(item)}
          delayLongPress={400}
          style={[styles['media-container'], { width: CHAT_MESSAGE_MAX_WIDTH }]}>
          <View style={{ width: '100%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden' }}>
            <Image
              source={{ uri: item.imageUris[0] }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
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
            {item.imageUris.slice(0, 2).map((uri, idx) => (
              <View key={idx} style={[styles['image-cell'], { width: imageSize, height: imageSize }]}>
                <Image
                  source={{ uri }}
                  style={styles['image-thumbnail']}
                  resizeMode="cover"
                />
              </View>
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
              {item.imageUris.slice(0, 2).map((uri, idx) => (
                <View key={idx} style={[styles['image-cell'], { width: imageSize, height: imageSize }]}>
                  <Image
                    source={{ uri }}
                    style={styles['image-thumbnail']}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </View>
            {/* 마지막 1장 (전체 너비) */}
            <View style={{ width: '100%', aspectRatio: 2 / 1, borderRadius: 12, overflow: 'hidden' }}>
              <Image
                source={{ uri: item.imageUris[2] }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    // 4장 이상: 2x2 그리드
    const displayCount = Math.min(4, imageCount);
    const showMore = imageCount > 4;

    return (
      <TouchableOpacity
        onLongPress={() => onLongPress(item)}
        delayLongPress={400}
        style={[styles['media-container']]}>
        <View style={styles['image-grid']}>
          {/* 첫 번째 줄 */}
          <View style={styles['image-row']}>
            {item.imageUris.slice(0, 2).map((uri, idx) => (
              <View key={idx} style={[styles['image-cell'], { width: imageSize, height: imageSize }]}>
                <Image
                  source={{ uri }}
                  style={styles['image-thumbnail']}
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>
          {/* 두 번째 줄 */}
          <View style={styles['image-row']}>
            {item.imageUris.slice(2, 4).map((uri, idx) => (
              <View key={idx + 2} style={[styles['image-cell'], { width: imageSize, height: imageSize }]}>
                <Image
                  source={{ uri }}
                  style={styles['image-thumbnail']}
                  resizeMode="cover"
                />
                {showMore && idx === 1 && (
                  <View style={styles['image-overlay']}>
                    <Text style={styles['image-overlay-text']}>
                      +{imageCount - 4}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
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
          <Image
            source={{ uri: video.thumbnailUrl }}
            style={styles['video-thumbnail']}
            resizeMode="cover"
          />
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

  return (
    <View style={styles['container']}>
      {/* 메시지 + 시간 행 */}
      <View style={styles['message-row']}>
        {/* 시간 */}
        <Text style={styles['chatMessageItem-time']}>
          {formatTime(item.createdAt)}
        </Text>

        {/* 텍스트 메시지 (있으면 표시) */}
        <View style={styles['message-bubble-wrapper']}>
          {item.text.trim().length > 0 && (
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
            <View style={[styles['og-loading'], { marginTop: item.text.trim().length > 0 ? 8 : 0, marginRight: 8 }]}>
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
              style={[styles['link-card'], { marginTop: item.text.trim().length > 0 ? 8 : 0, marginRight: 8 }]}>
              {/* 썸네일 */}
              {firstOgData.imageUrl && (
                <Image
                  source={{ uri: firstOgData.imageUrl }}
                  style={styles['link-card-image']}
                  resizeMode="cover"
                />
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
              style={[styles['link-only-card'], { marginTop: item.text.trim().length > 0 ? 8 : 0, marginRight: 8 }]}>
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

      {/* 이미지 그리드 */}
      {renderImageGrid()}

      {/* 동영상 */}
      {renderVideo()}

      {/* 파일 */}
      {renderFile()}
    </View>
  );
};

export default ChatMessageItem;

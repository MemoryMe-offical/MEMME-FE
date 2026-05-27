// 채팅 아이템 컴포넌트

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Linking, ActivityIndicator } from 'react-native';
import { Memo } from '../../types';
import { chatMessageItemStyles as styles, CHAT_MESSAGE_MAX_WIDTH } from '../../styles/ChatMessageItem.styles';
import { fetchOgData } from '../../services/ogService';

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

  return (
    <View style={styles['chatMessageItem-row']}>
      <Text style={styles['chatMessageItem-time']}>
        {formatTime(item.createdAt)}
      </Text>
      <View style={{ width: '85%' }}>
        <View style={{ flexShrink: 1, maxWidth: CHAT_MESSAGE_MAX_WIDTH }}>
          {/* 텍스트 메시지 (있으면 표시) */}
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
                <Text
                  style={{
                    fontSize: 10,
                    color: '#FFFFFF',
                    fontFamily: 'PretendardVariable',
                    marginTop: 6,
                    fontStyle: 'italic',
                    opacity: 0.8,
                    textAlign: 'center',
                  }}>
                  - 본문을 눌러 전문 보기 -
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* 링크 관련 아이템들 */}
        <View style={{ gap: 8, alignSelf: 'flex-end' }}>
          {/* OG 데이터 로딩 중 */}
          {firstLink && isLoadingOg && !firstOgData && (
            <View style={{
              marginTop: item.text.trim().length > 0 ? 8 : 0,
              marginRight: 8,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor: '#F8F9FB',
              borderWidth: 1,
              borderColor: '#E8EEF8',
              alignItems: 'center',
            }}>
              <ActivityIndicator size="small" color="#588DFF" />
              <Text style={{ fontSize: 11, color: '#AABBCC', marginTop: 6, fontFamily: 'PretendardVariable' }}>
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
              style={{
                maxWidth: CHAT_MESSAGE_MAX_WIDTH,
                marginTop: item.text.trim().length > 0 ? 8 : 0,
                marginRight: 8,
                borderRadius: 8,
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#E8EEF8',
              }}>
              {/* 썸네일 */}
              {firstOgData.imageUrl && (
                <Image
                  source={{ uri: firstOgData.imageUrl }}
                  style={{ width: '100%', aspectRatio: 16 / 9 }}
                  resizeMode="cover"
                />
              )}

              {/* 내용 */}
              <View style={{ padding: 12 }}>
                {firstOgData.title && (
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: '#1A1A1A',
                      marginBottom: 4,
                      fontFamily: 'PretendardVariable',
                    }}
                    numberOfLines={2}>
                    {firstOgData.title}
                  </Text>
                )}
                {firstOgData.description && (
                  <Text
                    style={{
                      fontSize: 11,
                      color: '#666666',
                      marginBottom: 6,
                      fontFamily: 'PretendardVariable',
                    }}
                    numberOfLines={2}>
                    {firstOgData.description}
                  </Text>
                )}
                <Text
                  style={{
                    fontSize: 10,
                    color: '#9DAFC8',
                    fontFamily: 'PretendardVariable',
                  }}
                  numberOfLines={1}>
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
              style={{
                marginTop: item.text.trim().length > 0 ? 8 : 0,
                marginRight: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: '#F8F9FB',
                borderWidth: 1,
                borderColor: '#E8EEF8',
              }}>
              <Text
                style={{
                  fontSize: 11,
                  color: '#588DFF',
                  fontFamily: 'PretendardVariable',
                }}
                numberOfLines={1}>
                🔗 {firstLink}
              </Text>
            </TouchableOpacity>
          )}

          {/* 링크 추가 버튼 */}
          {firstLink && onOpenLinkModal && (
            <TouchableOpacity
              onPress={() => onOpenLinkModal(firstLink, firstOgData)}
              style={{
                marginTop: 8,
                marginRight: 8,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: '#588DFF',
                alignItems: 'center',
                alignSelf: 'flex-start',
              }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: '#FFFFFF',
                  fontFamily: 'PretendardVariable',
                }}>
                링크를 노트에 추가하기
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default ChatMessageItem;

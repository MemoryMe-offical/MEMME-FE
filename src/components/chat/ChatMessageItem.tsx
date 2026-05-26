// 채팅 아이템 컴포넌트

import React from 'react';
import { View, Text, TouchableOpacity, Image, Linking } from 'react-native';
import { Memo } from '../../types';
import { chatMessageItemStyles as styles } from '../../styles/ChatMessageItem.styles';

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
}

const ChatMessageItem = ({ item, expanded = false, onToggleExpand, onLongPress }: ChatMessageItemProps) => {
  const isLong = item.text.length > 50;
  const displayText = expanded ? item.text : item.text.substring(0, 50);

  // 링크만 있는지 확인 (텍스트가 없거나 링크 정보만 있는 경우)
  const hasLink = item.urls && item.urls.length > 0;
  const isLinkOnly = hasLink && item.text.trim().length === 0;
  const firstLink = hasLink ? item.urls[0] : null;
  const firstOgData = hasLink && item.ogDatas && item.ogDatas.length > 0 ? item.ogDatas[0] : null;

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
      <View style={{ flex: 1 }}>
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
              style={styles['chatMessageItem-bubble-text']}
              numberOfLines={expanded ? 0 : 3}>
              {displayText}
              {!expanded && isLong && '...'}
            </Text>
          </TouchableOpacity>
        )}

        {/* 링크 카드 (있으면 표시) */}
        {hasLink && firstOgData && (
          <TouchableOpacity
            onPress={() => handleLinkPress(firstLink)}
            onLongPress={() => onLongPress(item)}
            delayLongPress={400}
            style={{
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
                style={{ width: '100%', height: 140 }}
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
        {hasLink && !firstOgData && (
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
      </View>
    </View>
  );
};

export default ChatMessageItem;

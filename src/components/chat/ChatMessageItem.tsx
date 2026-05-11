// 채팅 아이템 컴포넌트

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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

  return (
    <View style={styles['chatMessageItem-row']}>
      <Text style={styles['chatMessageItem-time']}>
        {formatTime(item.createdAt)}
      </Text>
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
    </View>
  );
};

export default ChatMessageItem;

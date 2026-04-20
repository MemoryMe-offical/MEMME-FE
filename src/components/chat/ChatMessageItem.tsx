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
  onLongPress: (item: Memo) => void;
}

const ChatMessageItem = ({ item, onLongPress }: ChatMessageItemProps) => (
  <View style={styles['chatMessageItem-row']}>
    <Text style={styles['chatMessageItem-time']}>
      {formatTime(item.createdAt)}
    </Text>
    <TouchableOpacity
      style={styles['chatMessageItem-bubble']}
      onLongPress={() => onLongPress(item)}
      delayLongPress={400}
      activeOpacity={0.85}>
      <Text style={styles['chatMessageItem-bubble-text']}>{item.text}</Text>
    </TouchableOpacity>
  </View>
);

export default ChatMessageItem;

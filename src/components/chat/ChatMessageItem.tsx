// 채팅 아이템 컴포넌트

import React from 'react';
import { View, Text } from 'react-native';
import { ChatMessage } from '../../types/chatBoard.type';
import { chatMessageItemStyles as styles } from '../../styles/ChatMessageItem.styles';

const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const isAM = hours < 12;
  const displayHours = hours % 12 || 12;
  return `${isAM ? '오전' : '오후'} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
};

const ChatMessageItem = ({ item }: { item: ChatMessage }) => (
  <View style={styles['chatMessageItem-row']}>
    <Text style={styles['chatMessageItem-time']}>
      {formatTime(item.createdAt)}
    </Text>
    <View style={styles['chatMessageItem-bubble']}>
      <Text style={styles['chatMessageItem-bubble-text']}>{item.text}</Text>
    </View>
  </View>
);

export default ChatMessageItem;

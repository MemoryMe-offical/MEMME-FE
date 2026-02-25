// 게시물 아이템 컴포넌트

import React from 'react';
import { View, Text } from 'react-native';
import { BoardPost } from '../../types/chatBoard.type';
import { boardPostItemStyles as styles } from '../../styles/BoardPostItem.styles';

const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const isAM = hours < 12;
  const displayHours = hours % 12 || 12;
  return `${isAM ? '오전' : '오후'} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
};

const BoardPostItem = ({ item }: { item: BoardPost }) => (
  <View style={styles['boardPostItem-row']}>
    <Text style={styles['boardPostItem-time']}>
      {formatTime(item.createdAt)}
    </Text>
    <View style={styles['boardPostItem-bubble']}>
      <Text style={styles['boardPostItem-bubble-title']}>{item.title}</Text>
      {item.content ? (
        <Text style={styles['boardPostItem-bubble-content']} numberOfLines={2}>
          {item.content}
        </Text>
      ) : null}
    </View>
  </View>
);

export default BoardPostItem;

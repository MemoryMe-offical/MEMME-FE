// 게시물 아이템 컴포넌트

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Board } from '../../types';
import { boardPostItemStyles as styles } from '../../styles/BoardPostItem.styles';

const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const isAM = hours < 12;
  const displayHours = hours % 12 || 12;
  return `${isAM ? '오전' : '오후'} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
};

interface BoardPostItemProps {
  item: Board;
  onPress: (board: Board) => void;
  onLongPress: (board: Board) => void;
}

const BoardPostItem = ({ item, onPress, onLongPress }: BoardPostItemProps) => (
  <View style={styles['boardPostItem-row']}>
    <Text style={styles['boardPostItem-time']}>
      {formatTime(item.createdAt)}
    </Text>
    <TouchableOpacity
      style={styles['boardPostItem-bubble']}
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress(item)}
      delayLongPress={400}
      activeOpacity={0.75}>
      <Text style={styles['boardPostItem-bubble-title']}>{item.title}</Text>
      {item.description ? (
        <Text style={styles['boardPostItem-bubble-content']} numberOfLines={4}>
          {item.description}
        </Text>
      ) : null}
    </TouchableOpacity>
  </View>
);

export default BoardPostItem;

// 게시물 아이템 컴포넌트

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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

interface BoardPostItemProps {
  item: BoardPost;
  onPress: (post: BoardPost) => void;
  onLongPress: (post: BoardPost) => void;
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
      {item.content ? (
        <Text style={styles['boardPostItem-bubble-content']} numberOfLines={2}>
          {item.content}
        </Text>
      ) : null}
    </TouchableOpacity>
  </View>
);

export default BoardPostItem;

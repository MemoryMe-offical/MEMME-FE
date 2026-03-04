// 롱프레스 컨텍스트 메뉴 컴포넌트

import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { contextMenuStyles as styles } from '../../styles/ContextMenu.styles';
import { BookmarkFilledIcon, BookmarkIcon, CopyIcon, ConvertIcon, TrashIcon } from './Icons';

interface ContextMenuProps {
  visible: boolean;
  itemType: 'chat' | 'post';
  isBookmarked: boolean;
  onCopy: () => void;
  onBookmark: () => void;
  onConvert: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const ContextMenu = ({
  visible,
  itemType,
  isBookmarked,
  onCopy,
  onBookmark,
  onConvert,
  onDelete,
  onClose,
}: ContextMenuProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  const handleAction = (action: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      action();
    });
  };

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const copyLabel = itemType === 'chat' ? '내용 복사' : '제목 복사';
  const convertLabel = itemType === 'chat' ? '게시물로 변환' : '채팅으로 변환';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}>
      <Animated.View
        style={[styles['contextMenu-backdrop'], { opacity: fadeAnim }]}>
        {/* 백드롭 탭 시 닫기 */}
        <TouchableOpacity
          style={{ position: 'absolute', inset: 0 } as any}
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* 메뉴 카드 */}
        <Animated.View
          style={[
            styles['contextMenu-card'],
            { transform: [{ scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] },
          ]}>
          {/* 복사 */}
          <TouchableOpacity
            style={styles['contextMenu-item']}
            onPress={() => handleAction(onCopy)}
            activeOpacity={0.6}>
            <CopyIcon color="#1A1A1A" size={18} />
            <Text style={styles['contextMenu-item-text']}>{copyLabel}</Text>
          </TouchableOpacity>

          <View style={styles['contextMenu-separator']} />

          {/* 북마크 */}
          <TouchableOpacity
            style={styles['contextMenu-item']}
            onPress={() => handleAction(onBookmark)}
            activeOpacity={0.6}>
            {isBookmarked
              ? <BookmarkFilledIcon color="#FF9500" size={18} />
              : <BookmarkIcon color="#AABBCC" size={18} />}
            <Text style={styles['contextMenu-item-text']}>
              {isBookmarked ? '북마크 해제' : '북마크'}
            </Text>
          </TouchableOpacity>

          <View style={styles['contextMenu-separator']} />

          {/* 변환 */}
          <TouchableOpacity
            style={styles['contextMenu-item']}
            onPress={() => handleAction(onConvert)}
            activeOpacity={0.6}>
            <ConvertIcon color="#588DFF" size={18} />
            <Text style={styles['contextMenu-item-text--convert']}>{convertLabel}</Text>
          </TouchableOpacity>

          <View style={styles['contextMenu-separator']} />

          {/* 삭제 */}
          <TouchableOpacity
            style={styles['contextMenu-item']}
            onPress={() => handleAction(onDelete)}
            activeOpacity={0.6}>
            <TrashIcon color="#FF3B30" size={18} />
            <Text style={styles['contextMenu-item-text--danger']}>삭제</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default ContextMenu;

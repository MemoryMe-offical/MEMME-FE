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
  itemType: 'memo' | 'board';
  isBookmarked: boolean;
  showCopyButton?: boolean;
  copyLabel?: string;
  onCopy?: () => void;
  onBookmark: () => void;
  onConvert: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const ContextMenu = ({
  visible,
  itemType,
  isBookmarked,
  showCopyButton = false,
  copyLabel = '내용 복사',
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

  const convertLabel = itemType === 'memo' ? '보드로 변환' : '메모로 변환';

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
          {/* 복사 - 메모의 텍스트/이미지만 */}
          {showCopyButton && onCopy && (
            <View>
              <TouchableOpacity
                style={styles['contextMenu-item']}
                onPress={() => handleAction(onCopy)}
                activeOpacity={0.6}>
                <Text style={styles['contextMenu-item-text']}>{copyLabel}</Text>
                <CopyIcon color="#3A3A3A" size={20} />
              </TouchableOpacity>

              <View style={styles['contextMenu-separator']} />
            </View>
          )}

          {/* 북마크 */}
          <TouchableOpacity
            style={styles['contextMenu-item']}
            onPress={() => handleAction(onBookmark)}
            activeOpacity={0.6}>
            <Text style={styles['contextMenu-item-text']}>
              {isBookmarked ? '북마크 해제' : '북마크'}
            </Text>
            {isBookmarked
              ? <BookmarkFilledIcon color="#FF9500" size={20} />
              : <BookmarkIcon color="#3A3A3A" size={20} />}
          </TouchableOpacity>

          <View style={styles['contextMenu-separator']} />

          {/* 변환 */}
          <TouchableOpacity
            style={styles['contextMenu-item']}
            onPress={() => handleAction(onConvert)}
            activeOpacity={0.6}>
            <Text style={styles['contextMenu-item-text']}>{convertLabel}</Text>
            <ConvertIcon color="#3A3A3A" size={20} />
          </TouchableOpacity>

          <View style={styles['contextMenu-separator']} />

          {/* 삭제 */}
          <TouchableOpacity
            style={styles['contextMenu-item']}
            onPress={() => handleAction(onDelete)}
            activeOpacity={0.6}>
            <Text style={styles['contextMenu-item-text--danger']}>삭제</Text>
            <TrashIcon color="#FF3B30" size={20} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default ContextMenu;

// 게시물 상세 보기 바텀시트 컴포넌트

import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { BoardPost } from '../../types/chatBoard.type';
import { boardPostBottomSheetStyles as styles } from '../../styles/BoardPostBottomSheet.styles';

const SHEET_HEIGHT = Dimensions.get('window').height * 0.55;

const formatFullTime = (isoString: string): string => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const isAM = hours < 12;
  const displayHours = hours % 12 || 12;
  return `${year}년 ${month}월 ${day}일 ${isAM ? '오전' : '오후'} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
};

interface Props {
  post: BoardPost | null;
  onClose: () => void;
  onEdit: () => void;
}

const BoardPostBottomSheet = ({ post, onClose, onEdit }: Props) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const visible = post !== null;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(0);
      Animated.spring(slideAnim, {
        toValue: SHEET_HEIGHT,
        bounciness: 4,
        useNativeDriver: false,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: false,
    }).start(() => onClose());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}>
      {/* 백드롭 */}
      <TouchableOpacity
        style={styles['sheet-backdrop']}
        activeOpacity={1}
        onPress={handleClose}
      />

      {/* 시트 본체 */}
      <Animated.View style={[styles['sheet-container'], { height: slideAnim }]}>
        {/* 드래그 핸들 */}
        <View style={styles['sheet-handle-wrap']}>
          <View style={styles['sheet-handle-bar']} />
        </View>

        {/* 헤더 */}
        <View style={styles['sheet-header']}>
          <Text style={styles['sheet-header-label']}>게시물</Text>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles['sheet-header-closeButton']}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* 본문 */}
        <ScrollView
          style={styles['sheet-body']}
          showsVerticalScrollIndicator={false}>
          <Text style={styles['sheet-body-title']}>{post?.title}</Text>
          <Text style={styles['sheet-body-time']}>
            {post ? formatFullTime(post.createdAt) : ''}
          </Text>
          {post?.content ? (
            <Text style={styles['sheet-body-content']}>{post.content}</Text>
          ) : null}
        </ScrollView>

        {/* 하단 액션 */}
        <View style={styles['sheet-footer']}>
          <TouchableOpacity
            style={styles['sheet-footer-editButton']}
            onPress={onEdit}
            activeOpacity={0.75}>
            <Text style={styles['sheet-footer-editButton-text']}>
              ✏️ 수정
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default BoardPostBottomSheet;

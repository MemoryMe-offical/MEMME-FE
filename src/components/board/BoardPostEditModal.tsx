// 게시물 수정 모달 컴포넌트

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { Board } from '../../types';
import { boardPostEditModalStyles as styles } from '../../styles/BoardPostEditModal.styles';
import { CameraIcon, CalendarIcon, ClockIcon } from '../common/Icons';

interface Props {
  post: Board | null;
  onClose: () => void;
  onSave: (updated: Board) => void;
}

const BoardPostEditModal = ({ post, onClose, onSave }: Props) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.description ?? '');
    }
  }, [post]);

  const handleSave = () => {
    if (!post || !title.trim()) {
      return;
    }
    onSave({ ...post, title: title.trim(), description: content.trim() || undefined });
  };

  const isSaveEnabled = title.trim().length > 0;

  return (
    <Modal
      visible={post !== null}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles['editModal-container']} behavior="padding">
        {/* 헤더 */}
        <View style={styles['editModal-header']}>
          <TouchableOpacity onPress={onClose} style={styles['editModal-header-cancelButton']}>
            <Text style={styles['editModal-header-cancelText']}>취소</Text>
          </TouchableOpacity>

          <Text style={styles['editModal-header-title']}>게시물 수정</Text>

          <TouchableOpacity
            onPress={handleSave}
            style={styles['editModal-header-saveButton']}
            disabled={!isSaveEnabled}
            activeOpacity={0.6}>
            <Text
              style={[
                styles['editModal-header-saveText'],
                !isSaveEnabled && styles['editModal-header-saveText--disabled'],
              ]}>
              저장
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles['editModal-body']} keyboardShouldPersistTaps="handled">
          {/* 제목 입력 */}
          <TextInput
            style={styles['editModal-titleInput']}
            value={title}
            onChangeText={setTitle}
            placeholder="제목"
            placeholderTextColor="#AABBCC"
            maxLength={100}
          />

          <View style={styles['editModal-divider']} />

          {/* 내용 입력 */}
          <TextInput
            style={styles['editModal-contentInput']}
            value={content}
            onChangeText={setContent}
            placeholder="내용을 입력하세요"
            placeholderTextColor="#AABBCC"
            multiline
            textAlignVertical="top"
          />

          {/* 미디어 섹션 */}
          <View style={styles['editModal-section-divider']} />
          <Text style={styles['editModal-section-label']}>미디어</Text>
          <TouchableOpacity style={styles['editModal-placeholder-row']} disabled>
            <CameraIcon color="#3A3A3A" size={18} />
            <Text style={styles['editModal-placeholder-text']}>사진 / 영상 / 파일</Text>
            <Text style={styles['editModal-placeholder-badge']}>준비 중</Text>
          </TouchableOpacity>

          {/* 일정 섹션 */}
          <View style={styles['editModal-section-divider']} />
          <Text style={styles['editModal-section-label']}>일정</Text>
          <TouchableOpacity style={styles['editModal-placeholder-row']} disabled>
            <CalendarIcon color="#3A3A3A" size={18} />
            <Text style={styles['editModal-placeholder-text']}>시작 날짜 및 시간</Text>
            <Text style={styles['editModal-placeholder-badge']}>준비 중</Text>
          </TouchableOpacity>
          <View style={styles['editModal-placeholder-separator']} />
          <TouchableOpacity style={styles['editModal-placeholder-row']} disabled>
            <ClockIcon color="#3A3A3A" size={18} />
            <Text style={styles['editModal-placeholder-text']}>마감 날짜 및 시간</Text>
            <Text style={styles['editModal-placeholder-badge']}>준비 중</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default BoardPostEditModal;

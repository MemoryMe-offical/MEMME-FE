import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Board, Note } from '../types';
import {
  ArrowLeftIcon,
  EditIcon,
  PlusCircleIcon,
} from '../components/common/Icons';
import TagInput from '../components/common/TagInput';
import NoteCard from '../components/note/NoteCard';
import * as boardService from '../services/boardService';

type Props = NativeStackScreenProps<RootStackParamList, 'BoardDetail'>;

const formatFullTime = (iso: string) => {
  const d = new Date(iso);
  const h = d.getHours();
  const isAM = h < 12;
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${isAM ? '오전' : '오후'} ${(h % 12) || 12}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const BoardDetailScreen = ({ route, navigation }: Props) => {
  const { board: initialBoard, onSave, startEditing } = route.params;
  const insets = useSafeAreaInsets();

  const [board, setBoard] = useState<Board>(initialBoard);
  const [isEditing, setIsEditing] = useState(startEditing ?? false);
  const [isSaving, setIsSaving] = useState(false);

  // 편집 임시 상태
  const [editTitle, setEditTitle] = useState(initialBoard.title);
  const [editDescription, setEditDescription] = useState(initialBoard.description ?? '');
  const [editTags, setEditTags] = useState<string[]>(initialBoard.tags ?? []);

  const enterEdit = () => {
    setEditTitle(board.title);
    setEditDescription(board.description ?? '');
    setEditTags(board.tags ?? []);
    setIsEditing(true);
  };

  const isDirty = () =>
    editTitle.trim() !== board.title ||
    editDescription.trim() !== (board.description ?? '') ||
    JSON.stringify(editTags) !== JSON.stringify(board.tags ?? []);

  const cancelEdit = () => {
    if (isDirty()) {
      Alert.alert('편집 취소', '수정사항이 사라집니다. 나가시겠습니까?', [
        { text: '계속 편집', style: 'cancel' },
        { text: '나가기', style: 'destructive', onPress: () => setIsEditing(false) },
      ]);
    } else {
      setIsEditing(false);
    }
  };

  const handleSave = async () => {
    if (!editTitle.trim()) return;

    setIsSaving(true);
    try {
      const updated = await boardService.updateBoard(board.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        tags: editTags.length > 0 ? editTags : undefined,
      });
      setBoard(updated);
      setIsEditing(false);
      onSave?.(updated);
    } catch (error) {
      console.error('Failed to save board:', error);
      Alert.alert('오류', '보드 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };


  const handleAddNote = () => {
    navigation.navigate('NoteDetail', {
      note: null,
      boardId: board.id,
      boardTitle: board.title,
      isNew: true,
    });
  };

  const handleNotePress = (note: Note) => {
    navigation.navigate('NoteDetail', {
      note,
      boardId: board.id,
      boardTitle: board.title,
    });
  };

  useFocusEffect(
    useCallback(() => {
      const refreshBoard = async () => {
        try {
          const updatedBoard = await boardService.fetchBoard(board.id);
          setBoard(updatedBoard);
        } catch (error) {
          console.error('Failed to refresh board:', error);
        }
      };

      refreshBoard();
    }, [board.id])
  );

  // ── 편집 모드 ──
  if (isEditing) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={[styles.headerSafeTop, { height: insets.top }]} />

        <View style={styles.header}>
          <TouchableOpacity onPress={cancelEdit} style={styles.headerSideBtn}>
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.headerCenterTitle}>보드 수정</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.headerSideBtn, styles.headerSideBtnRight]}
            disabled={!editTitle.trim() || isSaving}
            activeOpacity={0.6}>
            {isSaving ? (
              <ActivityIndicator size="small" color="#588DFF" />
            ) : (
              <Text style={[styles.saveText, !editTitle.trim() && styles.saveTextDisabled]}>저장</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.editBodyContent}
          keyboardShouldPersistTaps="handled">

          {/* 제목 */}
          <TextInput
            style={styles.editTitleInput}
            value={editTitle}
            onChangeText={setEditTitle}
            placeholder="보드 제목"
            placeholderTextColor="#AABBCC"
            maxLength={100}
          />
          <View style={styles.divider} />

          {/* 설명 */}
          <TextInput
            style={styles.editContentInput}
            value={editDescription}
            onChangeText={setEditDescription}
            placeholder="보드 설명 (선택)"
            placeholderTextColor="#AABBCC"
            multiline
            textAlignVertical="top"
          />
          <View style={styles.sectionDivider} />

          {/* 태그 */}
          <Text style={styles.sectionLabel}>태그</Text>
          <TagInput
            tags={editTags}
            onChange={setEditTags}
            placeholder="태그 추가 (최대 10개)"
          />

          <View style={{ height: 48 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── 뷰 모드 ──
  const hasNotes = (board.notes?.length ?? 0) > 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={[styles.headerSafeTop, { height: insets.top }]} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <ArrowLeftIcon color="#1A1A1A" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{board.title}</Text>
        <TouchableOpacity onPress={enterEdit} hitSlop={8}>
          <EditIcon color="#588DFF" size={20} />
        </TouchableOpacity>
      </View>

      {/* 날짜 정보 바 */}
      <View style={styles.dateBadgeRow}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeLabel}>작성</Text>
          <Text style={styles.dateBadgeValue}>{formatFullTime(board.createdAt)}</Text>
        </View>
        {board.updatedAt && (
          <>
            <View style={styles.dateBadgeDot} />
            <View style={styles.dateBadge}>
              <Text style={styles.dateBadgeLabel}>수정</Text>
              <Text style={styles.dateBadgeValue}>{formatFullTime(board.updatedAt)}</Text>
            </View>
          </>
        )}
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {/* 설명 */}
        {!!board.description && (
          <Text style={styles.descriptionText}>{board.description}</Text>
        )}

        {/* 태그 */}
        {board.tags && board.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {board.tags.map(tag => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 노트 목록 or 빈 상태 */}
        <View style={styles.notesSection}>
          <View style={styles.notesSectionHeader}>
            <Text style={styles.notesSectionTitle}>노트</Text>
            <TouchableOpacity onPress={handleAddNote} hitSlop={8}>
              <PlusCircleIcon color="#588DFF" size={20} />
            </TouchableOpacity>
          </View>

          {hasNotes
            ? (board.notes!.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onPress={() => handleNotePress(note)}
                />
              )))
            : (
              <TouchableOpacity style={styles.emptyState} onPress={handleAddNote} activeOpacity={0.7}>
                <Text style={styles.emptyStateTitle}>아직 노트가 없어요.</Text>
                <Text style={styles.emptyStateDesc}>+ 노트 추가 버튼을 눌러보세요.</Text>
              </TouchableOpacity>
            )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF' },
  headerSafeTop: { backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEF8',
    gap: 12,
  },
  headerSideBtn: { minWidth: 52 },
  headerSideBtnRight: { alignItems: 'flex-end' },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },
  headerCenterTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    textAlign: 'center',
  },
  cancelText: { fontSize: 13, color: '#9DAFC8', fontFamily: 'PretendardVariable' },
  saveText: { fontSize: 13, fontWeight: '600', color: '#588DFF', fontFamily: 'PretendardVariable' },
  saveTextDisabled: { color: '#C0CDD8' },
  dateBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F7FAFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E4ECFF',
  },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateBadgeLabel: { fontSize: 11, fontWeight: '600', color: '#8FA8D0', fontFamily: 'PretendardVariable' },
  dateBadgeValue: { fontSize: 11, color: '#6B7E9A', fontFamily: 'PretendardVariable' },
  dateBadgeDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#C0CDD8' },
  body: { flex: 1 },
  bodyContent: { padding: 20, paddingBottom: 48 },
  editBodyContent: { paddingHorizontal: 20, paddingBottom: 48 },
  descriptionText: {
    fontSize: 13,
    color: '#4A5568',
    fontFamily: 'PretendardVariable',
    lineHeight: 22,
    marginBottom: 12,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  tagChip: { backgroundColor: '#E8EEFF', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 11, color: '#588DFF', fontFamily: 'PretendardVariable', fontWeight: '500' },
  notesSection: { gap: 6 },
  notesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  notesSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E4ECFF',
    borderStyle: 'dashed',
    gap: 6,
  },
  emptyStateTitle: { fontSize: 14, fontWeight: '600', color: '#6B7E9A', fontFamily: 'PretendardVariable' },
  emptyStateDesc: { fontSize: 11, color: '#9DAFC8', fontFamily: 'PretendardVariable' },
  divider: { height: 1, backgroundColor: '#E8EEF8', marginVertical: 2 },
  sectionDivider: { height: 1, backgroundColor: '#E8EEF8', marginVertical: 12 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  editTitleInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    paddingVertical: 10,
  },
  editContentInput: {
    fontSize: 13,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    minHeight: 80,
    lineHeight: 22,
    paddingVertical: 6,
  },
  editTagInput: {
    fontSize: 12,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    borderWidth: 1,
    borderColor: '#E4ECFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FAFCFF',
  },
  tagHint: {
    fontSize: 10,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
    marginTop: 4,
  },
});

export default BoardDetailScreen;

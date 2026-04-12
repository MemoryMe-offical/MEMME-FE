import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
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

  const handleSave = () => {
    if (!editTitle.trim()) return;
    const updated: Board = {
      ...board,
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      tags: editTags.length > 0 ? editTags : undefined,
      updatedAt: new Date().toISOString(),
      // notes는 변경하지 않음 (NoteDetailScreen에서 개별 관리)
    };
    setBoard(updated);
    setIsEditing(false);
    onSave?.(updated);
  };

  // 노트 저장 콜백 (NoteDetailScreen에서 돌아올 때)
  const handleNoteSave = (note: Note) => {
    const existingNotes = board.notes ?? [];
    const idx = existingNotes.findIndex(n => n.id === note.id);
    const updated: Board = {
      ...board,
      notes: idx >= 0
        ? existingNotes.map(n => n.id === note.id ? note : n)
        : [...existingNotes, note],
      updatedAt: new Date().toISOString(),
    };
    setBoard(updated);
    onSave?.(updated);
  };

  // 노트 삭제 콜백
  const handleNoteDelete = (noteId: string) => {
    const updated: Board = {
      ...board,
      notes: (board.notes ?? []).filter(n => n.id !== noteId),
      updatedAt: new Date().toISOString(),
    };
    setBoard(updated);
    onSave?.(updated);
  };

  const handleAddNote = () => {
    navigation.navigate('NoteDetail', {
      note: null,
      boardId: board.id,
      boardTitle: board.title,
      isNew: true,
      onSave: handleNoteSave,
    });
  };

  const handleNotePress = (note: Note) => {
    navigation.navigate('NoteDetail', {
      note,
      boardId: board.id,
      boardTitle: board.title,
      onSave: handleNoteSave,
      onDelete: handleNoteDelete,
    });
  };

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
            disabled={!editTitle.trim()}
            activeOpacity={0.6}>
            <Text style={[styles.saveText, !editTitle.trim() && styles.saveTextDisabled]}>저장</Text>
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
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },
  headerCenterTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    textAlign: 'center',
  },
  cancelText: { fontSize: 15, color: '#9DAFC8', fontFamily: 'PretendardVariable' },
  saveText: { fontSize: 15, fontWeight: '600', color: '#588DFF', fontFamily: 'PretendardVariable' },
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
    fontSize: 15,
    color: '#4A5568',
    fontFamily: 'PretendardVariable',
    lineHeight: 24,
    marginBottom: 16,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tagChip: { backgroundColor: '#E8EEFF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  tagText: { fontSize: 13, color: '#588DFF', fontFamily: 'PretendardVariable', fontWeight: '500' },
  notesSection: { gap: 8 },
  notesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notesSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E4ECFF',
    borderStyle: 'dashed',
    gap: 8,
  },
  emptyStateTitle: { fontSize: 16, fontWeight: '600', color: '#6B7E9A', fontFamily: 'PretendardVariable' },
  emptyStateDesc: { fontSize: 13, color: '#9DAFC8', fontFamily: 'PretendardVariable' },
  divider: { height: 1, backgroundColor: '#E8EEF8', marginVertical: 4 },
  sectionDivider: { height: 1, backgroundColor: '#E8EEF8', marginVertical: 16 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  editTitleInput: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    paddingVertical: 12,
  },
  editContentInput: {
    fontSize: 15,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    minHeight: 80,
    lineHeight: 24,
    paddingVertical: 8,
  },
  editTagInput: {
    fontSize: 14,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    borderWidth: 1,
    borderColor: '#E4ECFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FAFCFF',
  },
  tagHint: {
    fontSize: 12,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
    marginTop: 6,
  },
});

export default BoardDetailScreen;

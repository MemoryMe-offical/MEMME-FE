import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as noteService from '../../services/noteService';
import * as boardService from '../../services/boardService';
import { Board } from '../../types';
import BoardPickerBottomSheet from '../common/BoardPickerBottomSheet';
import { useAlert } from '../../context/AlertContext';

interface NoteActionBarProps {
  selectedCount: number;
  currentBoardId: string;
  onDeleteSuccess: () => void;
  onMoveSuccess: () => void;
  onCancel: () => void;
  selectedNoteIds: string[];
}

const NoteActionBar = ({
  selectedCount,
  currentBoardId,
  onDeleteSuccess,
  onMoveSuccess,
  onCancel,
  selectedNoteIds,
}: NoteActionBarProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showBoardPicker, setShowBoardPicker] = useState(false);
  const { showAlert, showConfirm } = useAlert();

  const handleDeleteNotes = () => {
    showConfirm({
      title: '노트 삭제',
      message: `${selectedCount}개 노트를 삭제하시겠습니까?`,
      confirmText: '삭제',
      cancelText: '취소',
      destructive: true,
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await Promise.all(
            selectedNoteIds.map(noteId =>
              noteService.deleteNote(currentBoardId, noteId)
            )
          );
          onDeleteSuccess();
        } catch (error) {
          // console.error('Failed to delete notes:', error);
          showAlert({ title: '오류', message: '노트 삭제에 실패했습니다.', type: 'error' });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleMoveNotes = async (targetBoard: Board) => {
    if (targetBoard.id === currentBoardId) {
      showAlert({ title: '안내', message: '같은 보드입니다.' });
      return;
    }

    setIsLoading(true);
    try {
      await noteService.moveNotes(currentBoardId, selectedNoteIds, targetBoard.id);
      onMoveSuccess();
      setShowBoardPicker(false);
    } catch (error) {
      // console.error('Failed to move notes:', error);
      showAlert({ title: '오류', message: '노트 이동에 실패했습니다.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onCancel}
          disabled={isLoading}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>

        <Text style={styles.countText}>{selectedCount}개 선택</Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.moveBtn]}
            onPress={() => setShowBoardPicker(true)}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#588DFF" />
            ) : (
              <Text style={styles.moveBtnText}>이동</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={handleDeleteNotes}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#FF4444" />
            ) : (
              <Text style={styles.deleteBtnText}>삭제</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <BoardPickerBottomSheet
        visible={showBoardPicker}
        title="이동할 보드 선택"
        onClose={() => setShowBoardPicker(false)}
        onSelect={handleMoveNotes}
        excludeBoardId={currentBoardId}
        isLoading={isLoading}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8EEF8',
    gap: 12,
  },
  cancelBtn: {
    minWidth: 44,
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 13,
    color: '#9DAFC8',
    fontWeight: '600',
    fontFamily: 'PretendardVariable',
  },
  countText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
  },
  moveBtn: {
    backgroundColor: '#E8EEFF',
  },
  moveBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },
  deleteBtn: {
    backgroundColor: '#FFE8E8',
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF4444',
    fontFamily: 'PretendardVariable',
  },
});

export default NoteActionBar;

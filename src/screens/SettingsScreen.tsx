import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/RootNavigator';
import { ArrowLeftIcon } from '../components/common/Icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const SettingsScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const [boardExpandMode, setBoardExpandMode] = useState<'all' | 'none'>('all');
  const [noteExpandMode, setNoteExpandMode] = useState<'none' | 'first' | 'all'>('none');

  // 설정 로드
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem('expandInitialSettings');
        if (saved) {
          const settings = JSON.parse(saved);
          setBoardExpandMode(settings.boardExpandMode || 'all');
          setNoteExpandMode(settings.noteExpandMode || 'none');
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  // 설정 저장
  const saveSettings = async (boardMode: 'all' | 'none', noteMode: 'none' | 'first' | 'all') => {
    try {
      await AsyncStorage.setItem(
        'expandInitialSettings',
        JSON.stringify({ boardExpandMode: boardMode, noteExpandMode: noteMode })
      );
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const updateBoardMode = (mode: 'all' | 'none') => {
    setBoardExpandMode(mode);
    saveSettings(mode, noteExpandMode);
  };

  const updateNoteMode = (mode: 'none' | 'first' | 'all') => {
    setNoteExpandMode(mode);
    saveSettings(boardExpandMode, mode);
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          try {
            // AsyncStorage에서 인증 정보 삭제
            await AsyncStorage.multiRemove([
              'accessToken',
              'refreshToken',
              'userId',
              'AUTO_LOGIN',
            ]);
            // 로그인 화면으로 이동
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            console.error('Failed to logout:', error);
            Alert.alert('오류', '로그아웃에 실패했습니다.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={[styles.headerSafeTop, { height: insets.top }]} />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={8}
        >
          <ArrowLeftIcon color="#1A1A1A" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
      >
        {/* 표시 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>표시 설정</Text>

          {/* 보드 설정 */}
          <Text style={styles.optionGroupTitle}>보드</Text>
          <TouchableOpacity
            style={[styles.optionItem, boardExpandMode === 'all' && styles.optionItemSelected]}
            onPress={() => updateBoardMode('all')}>
            <View style={[styles.radioButton, boardExpandMode === 'all' && styles.radioButtonSelected]} />
            <Text style={styles.optionText}>모든 보드 펼치기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionItem, boardExpandMode === 'none' && styles.optionItemSelected]}
            onPress={() => updateBoardMode('none')}>
            <View style={[styles.radioButton, boardExpandMode === 'none' && styles.radioButtonSelected]} />
            <Text style={styles.optionText}>모든 보드 접기</Text>
          </TouchableOpacity>

          {/* 노트 설정 */}
          <Text style={[styles.optionGroupTitle, { marginTop: 20 }]}>노트</Text>
          <TouchableOpacity
            style={[styles.optionItem, noteExpandMode === 'none' && styles.optionItemSelected]}
            onPress={() => updateNoteMode('none')}>
            <View style={[styles.radioButton, noteExpandMode === 'none' && styles.radioButtonSelected]} />
            <Text style={styles.optionText}>모든 노트 접기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionItem, noteExpandMode === 'first' && styles.optionItemSelected]}
            onPress={() => updateNoteMode('first')}>
            <View style={[styles.radioButton, noteExpandMode === 'first' && styles.radioButtonSelected]} />
            <Text style={styles.optionText}>보드당 첫 번째 노트만 펼치기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionItem, noteExpandMode === 'all' && styles.optionItemSelected]}
            onPress={() => updateNoteMode('all')}>
            <View style={[styles.radioButton, noteExpandMode === 'all' && styles.radioButtonSelected]} />
            <Text style={styles.optionText}>모든 노트 펼치기</Text>
          </TouchableOpacity>
        </View>

        {/* 계정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
          >
            <Text style={[styles.menuItemText, styles.logoutText]}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        {/* 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>정보</Text>

          <TouchableOpacity style={styles.menuItem} disabled>
            <Text style={styles.menuItemText}>앱 버전</Text>
            <Text style={styles.menuItemValue}>1.0.0</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FF',
  },
  headerSafeTop: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEF8',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E4ECFF',
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 15,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    fontWeight: '500',
  },
  logoutText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  menuItemValue: {
    fontSize: 14,
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
  },
  optionGroupTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    marginBottom: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E4ECFF',
  },
  optionItemSelected: {
    borderColor: '#588DFF',
    backgroundColor: '#F8FAFF',
  },
  radioButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#C0CDD8',
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: '#588DFF',
    backgroundColor: '#588DFF',
  },
  optionText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    fontWeight: '500',
    flex: 1,
  },
});

export default SettingsScreen;

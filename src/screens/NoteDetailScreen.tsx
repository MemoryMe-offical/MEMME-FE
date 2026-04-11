// TODO(P2): NoteDetailScreen 전체 구현 예정 (#15)
// 현재는 타입 안전을 위한 stub입니다.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from '../components/common/Icons';

type Props = NativeStackScreenProps<RootStackParamList, 'NoteDetail'>;

const NoteDetailScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={[styles.headerSafeTop, { height: insets.top }]} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <ArrowLeftIcon color="#1A1A1A" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>노트</Text>
        <View style={{ width: 22 }} />
      </View>
      <View style={styles.body}>
        <Text style={styles.placeholder}>노트 화면 준비 중입니다.</Text>
      </View>
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
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    textAlign: 'center',
  },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholder: { fontSize: 15, color: '#9DAFC8', fontFamily: 'PretendardVariable' },
});

export default NoteDetailScreen;

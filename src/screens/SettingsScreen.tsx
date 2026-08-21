import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/RootNavigator';
import { ArrowLeftIcon, ChevronRightIcon } from '../components/common/Icons';
import { useAlert } from '../context/AlertContext';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import DeviceInfo from 'react-native-device-info';
import {
  clearAutoLoginData,
  fetchWithAutoLogoutHandler,
} from '../utils/tokenUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const API_BASE_URL = 'https://memme.o-r.kr/v1';

const SettingsScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { showAlert, showConfirm } = useAlert();
  const appVersion = DeviceInfo.getVersion();

  const openUrl = async (url: string) => {
    try {
      if (await InAppBrowser.isAvailable()) {
        await InAppBrowser.open(url, { modalPresentationStyle: 'pageSheet' });
      } else {
        Linking.openURL(url);
      }
    } catch {
      Linking.openURL(url);
    }
  };

  const handleLogout = () => {
    showConfirm({
      title: '로그아웃',
      message: '로그아웃하시겠습니까?',
      confirmText: '로그아웃',
      cancelText: '취소',
      destructive: true,
      onConfirm: async () => {
        try {
          await clearAutoLoginData();
          // 로그인 화면으로 이동
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        } catch {
          // console.error('Failed to logout:', error);
          showAlert({
            title: '오류',
            message: '로그아웃에 실패했습니다.',
            type: 'error',
          });
        }
      },
    });
  };

  const handleWithdrawal = () => {
    showConfirm({
      title: '회원 탈퇴',
      message:
        '회원 탈퇴 시 계정과 모든 데이터가 삭제되며 복구할 수 없습니다. 정말 탈퇴하시겠습니까?',
      confirmText: '탈퇴하기',
      cancelText: '취소',
      destructive: true,
      onConfirm: async () => {
        try {
          const response = await fetchWithAutoLogoutHandler(
            `${API_BASE_URL}/withdrawal`,
            { method: 'DELETE' },
          );

          if (!response.ok) {
            let message = '회원 탈퇴에 실패했습니다.';
            try {
              const data = await response.json();
              message = data?.message || data?.error || message;
            } catch {
              // 서버가 JSON을 내려주지 않는 경우 기본 메시지를 사용한다.
            }
            throw new Error(message);
          }

          await clearAutoLoginData();

          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : '회원 탈퇴에 실패했습니다.';
          showAlert({
            title: '회원 탈퇴 실패',
            message,
            type: 'error',
          });
        }
      },
    });
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

        {/* 계정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정</Text>

          {/* 되돌릴 수 없는 회원 탈퇴보다 로그아웃을 먼저 두어, 로그아웃하려다
              탈퇴를 잘못 누르는 사고를 줄인다. */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
          >
            <Text style={[styles.menuItemText, styles.logoutText]}>로그아웃</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleWithdrawal}
          >
            <Text style={[styles.menuItemText, styles.deleteText]}>회원 탈퇴</Text>
          </TouchableOpacity>
        </View>

        {/* 서비스 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>서비스</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openUrl('https://memme-landing.kro.kr/')}
          >
            <Text style={styles.menuItemText}>Memme 소개</Text>
            <ChevronRightIcon color="#C0CDD8" size={16} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openUrl('https://memme-landing.kro.kr/privacy')}
          >
            <Text style={styles.menuItemText}>개인정보 처리방침</Text>
            <ChevronRightIcon color="#C0CDD8" size={16} />
          </TouchableOpacity>
        </View>

        {/* 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>정보</Text>

          <TouchableOpacity style={styles.menuItem} disabled>
            <Text style={styles.menuItemText}>앱 버전</Text>
            <Text style={styles.menuItemValue}>{appVersion}</Text>
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
  deleteText: {
    color: '#FF3B30',
    fontWeight: '500',
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

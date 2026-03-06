import React, { useState } from 'react';
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
import { encryptMessage, decryptMessage } from '../utils/encryption';
import { createMasterKey, getMasterKey, deleteMasterKey } from '../utils/keychain';
import { 
  pingServer, 
  sendEncryptedMessage, 
  getEncryptedMessages, 
  clearAllMessages 
} from '../utils/api';

const EncryptionTestScreen = () => {
  const [userId, setUserId] = useState('test-user-123');
  const [message, setMessage] = useState('');
  const [encrypted, setEncrypted] = useState('');
  const [decrypted, setDecrypted] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [serverMessages, setServerMessages] = useState<any[]>([]);

  const addLog = (log: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${log}`, ...prev]);
  };

  // 1. 키 생성 테스트
  const handleCreateKey = async () => {
    try {
      addLog('🔑 키 생성 시작...');
      const key = await createMasterKey(userId);
      addLog(`✅ 키 생성 완료: ${key.substring(0, 20)}...`);
      Alert.alert('성공', '키 생성 완료!');
    } catch (error: any) {
      addLog(`❌ 키 생성 실패: ${error.message}`);
      Alert.alert('실패', error.message);
    }
  };

  // 2. 키 조회 테스트
  const handleGetKey = async () => {
    try {
      addLog('🔍 키 조회 시작...');
      const key = await getMasterKey(userId);
      if (key) {
        addLog(`✅ 키 존재: ${key.substring(0, 20)}...`);
        Alert.alert('성공', '키 존재함');
      } else {
        addLog('⚠️ 키 없음');
        Alert.alert('알림', '키가 없습니다. 생성 버튼을 눌러주세요.');
      }
    } catch (error: any) {
      addLog(`❌ 키 조회 실패: ${error.message}`);
    }
  };

  // 3. 암호화 테스트
  const handleEncrypt = async () => {
    if (!message.trim()) {
      Alert.alert('알림', '메시지를 입력하세요.');
      return;
    }

    try {
      addLog(`🔐 암호화 시작: "${message}"`);
      const result = await encryptMessage(message, userId);
      setEncrypted(result);
      addLog('✅ 암호화 완료');
      Alert.alert('성공', '암호화 완료!');
    } catch (error: any) {
      addLog(`❌ 암호화 실패: ${error.message}`);
      Alert.alert('실패', error.message);
    }
  };

  // 4. 복호화 테스트
  const handleDecrypt = async () => {
    if (!encrypted) {
      Alert.alert('알림', '먼저 암호화를 해주세요.');
      return;
    }

    try {
      addLog('🔓 복호화 시작...');
      const result = await decryptMessage(encrypted, userId);
      setDecrypted(result);
      addLog(`✅ 복호화 완료: "${result}"`);
      Alert.alert('성공', `복호화 결과: ${result}`);
    } catch (error: any) {
      addLog(`❌ 복호화 실패: ${error.message}`);
      Alert.alert('실패', error.message);
    }
  };

  // 5. 키 삭제 테스트
  const handleDeleteKey = async () => {
    try {
      addLog('🗑️ 키 삭제 시작...');
      await deleteMasterKey(userId);
      addLog('✅ 키 삭제 완료');
      setEncrypted('');
      setDecrypted('');
      Alert.alert('성공', '키 삭제 완료!');
    } catch (error: any) {
      addLog(`❌ 키 삭제 실패: ${error.message}`);
    }
  };

  // 6. 서버 연결 테스트 (NEW!)
  const handlePingServer = async () => {
    try {
      setLoading(true);
      addLog('🔍 서버 연결 테스트...');
      const success = await pingServer();
      
      if (success) {
        addLog('✅ 서버 연결 성공!');
        Alert.alert('성공', '서버와 연결되었습니다!');
      } else {
        addLog('❌ 서버 연결 실패');
        Alert.alert('실패', '서버 연결 실패. 서버가 실행 중인지 확인하세요.');
      }
    } catch (error: any) {
      addLog(`❌ 서버 오류: ${error.message}`);
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 7. 서버로 암호화된 메시지 전송 (NEW!)
  const handleSendToServer = async () => {
    if (!encrypted) {
      Alert.alert('알림', '먼저 메시지를 암호화하세요.');
      return;
    }

    try {
      setLoading(true);
      addLog('📤 서버로 암호화된 메시지 전송...');
      
      const response = await sendEncryptedMessage(userId, encrypted);
      
      addLog(`✅ 서버 전송 완료! ID: ${response.id}`);
      Alert.alert('성공', `메시지가 서버에 저장되었습니다!\nID: ${response.id}`);
    } catch (error: any) {
      addLog(`❌ 서버 전송 실패: ${error.message}`);
      Alert.alert('실패', '서버 전송 실패. 서버가 실행 중인지 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  // 8. 서버에서 메시지 조회 (NEW!)
  const handleGetFromServer = async () => {
    try {
      setLoading(true);
      addLog('📥 서버에서 메시지 조회...');
      
      const response = await getEncryptedMessages(userId);
      
      addLog(`✅ 서버 조회 완료: ${response.messages.length}개 메시지`);
      setServerMessages(response.messages);
      
      Alert.alert('성공', `${response.messages.length}개의 메시지를 가져왔습니다.`);
    } catch (error: any) {
      addLog(`❌ 서버 조회 실패: ${error.message}`);
      Alert.alert('실패', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 9. 전체 E2EE 플로우 테스트 (NEW!)
  const handleFullE2EETest = async () => {
    try {
      setLoading(true);
      addLog('🧪 === 전체 E2EE 플로우 테스트 시작 ===');
      
      // Step 1: 서버 연결 확인
      addLog('Step 1: 서버 연결 확인');
      const serverOk = await pingServer();
      if (!serverOk) throw new Error('서버 연결 실패');
      addLog('✅ 서버 연결 성공');

      // Step 2: 키 생성
      addLog('Step 2: 암호화 키 생성');
      await createMasterKey(userId);
      addLog('✅ 키 생성 성공');

      // Step 3: 메시지 암호화
      addLog('Step 3: 메시지 암호화');
      const testMessage = '안녕하세요! E2EE 전체 플로우 테스트입니다.';
      const enc = await encryptMessage(testMessage, userId);
      setEncrypted(enc);
      addLog('✅ 암호화 성공');

      // Step 4: 서버로 전송
      addLog('Step 4: 서버로 전송');
      const sendResponse = await sendEncryptedMessage(userId, enc);
      addLog(`✅ 서버 전송 성공 (ID: ${sendResponse.id})`);

      // Step 5: 서버에서 조회
      addLog('Step 5: 서버에서 조회');
      const getResponse = await getEncryptedMessages(userId);
      addLog(`✅ 서버 조회 성공 (${getResponse.messages.length}개)`);

      // Step 6: 복호화
      addLog('Step 6: 복호화');
      const latestMessage = getResponse.messages[0];
      const dec = await decryptMessage(latestMessage.encryptedContent, userId);
      setDecrypted(dec);
      addLog(`✅ 복호화 성공: "${dec}"`);

      // Step 7: 검증
      if (testMessage === dec) {
        addLog('✅ 검증 성공: 원본과 복호화 결과 일치!');
        Alert.alert('🎉 전체 테스트 성공!', 
          '모든 E2EE 플로우를 성공적으로 완료했습니다!\n\n' +
          '1. 암호화 ✅\n' +
          '2. 서버 전송 ✅\n' +
          '3. 서버 조회 ✅\n' +
          '4. 복호화 ✅\n' +
          '5. 검증 ✅'
        );
      } else {
        addLog('❌ 검증 실패');
        Alert.alert('실패', '복호화 결과가 원본과 다릅니다.');
      }
    } catch (error: any) {
      addLog(`❌ 전체 테스트 실패: ${error.message}`);
      Alert.alert('실패', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 10. 서버 데이터 초기화 (NEW!)
  const handleClearServer = async () => {
    Alert.alert(
      '확인',
      '서버의 모든 메시지를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              addLog('🗑️ 서버 데이터 삭제...');
              await clearAllMessages();
              setServerMessages([]);
              addLog('✅ 서버 데이터 삭제 완료');
              Alert.alert('성공', '서버의 모든 메시지가 삭제되었습니다.');
            } catch (error: any) {
              addLog(`❌ 삭제 실패: ${error.message}`);
              Alert.alert('실패', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#588DFF" />
          <Text style={styles.loadingText}>처리 중...</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔐 E2EE 암호화 테스트</Text>
        <Text style={styles.headerSubtitle}>스프링 서버 연동</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>User ID:</Text>
        <TextInput
          style={styles.input}
          value={userId}
          onChangeText={setUserId}
        />
      </View>

      {/* 1. 키 관리 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1️⃣ 키 관리 (로컬)</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={handleCreateKey}>
            <Text style={styles.buttonText}>키 생성</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={handleGetKey}>
            <Text style={styles.buttonText}>키 조회</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={handleDeleteKey}>
            <Text style={styles.buttonText}>키 삭제</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. 암호화/복호화 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2️⃣ 암호화/복호화 (로컬)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={message}
          onChangeText={setMessage}
          placeholder="테스트 메시지 입력"
          multiline
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={handleEncrypt}>
            <Text style={styles.buttonText}>🔐 암호화</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={handleDecrypt}>
            <Text style={styles.buttonText}>🔓 복호화</Text>
          </TouchableOpacity>
        </View>

        {encrypted && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>암호화 결과:</Text>
            <Text style={styles.resultText} numberOfLines={2}>{encrypted}</Text>
          </View>
        )}

        {decrypted && (
          <View style={[styles.resultBox, styles.resultBoxSuccess]}>
            <Text style={styles.resultLabel}>복호화 결과:</Text>
            <Text style={styles.resultText}>{decrypted}</Text>
          </View>
        )}
      </View>

      {/* 3. 서버 연동 (NEW!) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3️⃣ 서버 연동</Text>
        <TouchableOpacity 
          style={[styles.button, styles.buttonInfo]} 
          onPress={handlePingServer}
          disabled={loading}>
          <Text style={styles.buttonText}>🔍 서버 연결 테스트</Text>
        </TouchableOpacity>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSendToServer}
            disabled={loading}>
            <Text style={styles.buttonText}>📤 서버 전송</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.buttonSecondary]} 
            onPress={handleGetFromServer}
            disabled={loading}>
            <Text style={styles.buttonText}>📥 서버 조회</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.button, styles.buttonDanger]} 
          onPress={handleClearServer}
          disabled={loading}>
          <Text style={styles.buttonText}>🗑️ 서버 데이터 삭제</Text>
        </TouchableOpacity>

        {serverMessages.length > 0 && (
          <View style={styles.serverMessagesBox}>
            <Text style={styles.resultLabel}>
              서버 메시지 ({serverMessages.length}개):
            </Text>
            {serverMessages.slice(0, 3).map((msg, index) => (
              <Text key={index} style={styles.serverMessageText} numberOfLines={1}>
                #{msg.id}: {msg.encryptedContent.substring(0, 40)}...
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* 4. 전체 테스트 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4️⃣ 전체 E2EE 플로우 테스트</Text>
        <TouchableOpacity 
          style={[styles.button, styles.buttonSuccess]} 
          onPress={handleFullE2EETest}
          disabled={loading}>
          <Text style={styles.buttonText}>🧪 전체 테스트 실행</Text>
        </TouchableOpacity>
      </View>

      {/* 로그 */}
      <View style={styles.section}>
        <View style={styles.logHeader}>
          <Text style={styles.sectionTitle}>📝 로그</Text>
          <TouchableOpacity onPress={() => setLogs([])}>
            <Text style={styles.clearButton}>지우기</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.logBox}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>{log}</Text>
          ))}
          {logs.length === 0 && (
            <Text style={styles.logEmpty}>로그가 없습니다.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    backgroundColor: '#588DFF',
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#588DFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#6c757d',
  },
  buttonDanger: {
    backgroundColor: '#dc3545',
  },
  buttonSuccess: {
    backgroundColor: '#28a745',
  },
  buttonInfo: {
    backgroundColor: '#17a2b8',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  resultBox: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  resultBoxSuccess: {
    backgroundColor: '#d4edda',
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 13,
    color: '#333',
  },
  serverMessagesBox: {
    backgroundColor: '#e7f3ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  serverMessageText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearButton: {
    color: '#dc3545',
    fontSize: 14,
  },
  logBox: {
    backgroundColor: '#1e1e1e',
    padding: 10,
    borderRadius: 8,
    maxHeight: 200,
  },
  logText: {
    color: '#00ff00',
    fontSize: 11,
    marginBottom: 2,
  },
  logEmpty: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    padding: 20,
  },
});

export default EncryptionTestScreen;
import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const splashStyles = StyleSheet.create({
  // 스플래시 - 메인 컨테이너
  'splash-container': {
    flex: 1,
    backgroundColor: '#588DFF',
  },

  // 스플래시 - 로고 섹션 (상단 왼쪽)
  'splash-logoSection': {
    paddingTop: 80,
    paddingLeft: 30,
    paddingRight: 30,
  },

  'splash-logoSection-iconBox-image': {
    marginTop: 100,
    width: '20%',   
    height: '20%',
    marginBottom: 10,
},
  // 스플래시 - 로고 섹션 - 타이틀
  'splash-logoSection-title': {
    fontSize: 37,
    fontFamily: 'Paprika',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    fontStyle: 'italic',
  },

  // 스플래시 - 로고 섹션 - 서브타이틀
  'splash-logoSection-subtitle': {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.95,
    fontFamily: 'PretendardVariable',
  },

  // 스플래시 - 캐릭터 컨테이너 (하단)
  'splash-characterContainer': {
    position: 'absolute',
    bottom: -SCREEN_HEIGHT * 0.35,  // 하단 밖으로
    left: SCREEN_WIDTH * 0.1,    // 왼쪽 밖으로
    overflow: 'visible',            // 넘치는 부분 보이게
  },

  // 스플래시 - 캐릭터 컨테이너 - 이미지
  'splash-characterContainer-image': {
    width: SCREEN_WIDTH * 1.3,      // 이미지 크기 140%
    height: SCREEN_HEIGHT * 0.9,    // 이미지 높이 90%
    resizeMode: 'contain',
  },
});
import { StyleSheet } from 'react-native';

export const appAlertModalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backdropTouchable: {
    position: 'absolute',
    inset: 0,
  },

  card: {
    width: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    marginBottom: 12,
  },

  message: {
    fontSize: 15,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    lineHeight: 22,
    marginBottom: 24,
  },

  buttonRowContainer: {
    flexDirection: 'row',
    gap: 12,
  },

  singleButtonContainer: {
    flexDirection: 'row',
  },

  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  confirmButton: {
    flex: 1,
  },

  singleButton: {
    flex: 1,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2EAFF',
  },

  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'PretendardVariable',
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
  },
});

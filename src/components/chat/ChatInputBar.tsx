import React from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { PlusIcon, SendIcon } from '../common/Icons';
import { chatInputBarStyles } from '../../styles/ChatInputBar.styles';

interface ChatInputBarProps {
  inputText: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  bottomInset: number;
}

const ChatInputBar: React.FC<ChatInputBarProps> = ({
  inputText,
  onChangeText,
  onSend,
  bottomInset,
}) => {
  const paddingBottom = Math.max(bottomInset, 8);

  return (
    <View
      style={[
        chatInputBarStyles.container,
        { paddingBottom },
      ]}
    >
      <TouchableOpacity style={chatInputBarStyles.plusButton}>
        <PlusIcon color="#000000" size={22} />
      </TouchableOpacity>

      <TextInput
        style={chatInputBarStyles.input}
        value={inputText}
        onChangeText={onChangeText}
        placeholder="나를 기억하고 기록하는 공간"
        placeholderTextColor="#AABBCC"
        multiline
      />

      <TouchableOpacity
        style={chatInputBarStyles.sendButton}
        onPress={onSend}
      >
        <SendIcon color="#FFFFFF" size={17} />
      </TouchableOpacity>
    </View>
  );
};

export default ChatInputBar;

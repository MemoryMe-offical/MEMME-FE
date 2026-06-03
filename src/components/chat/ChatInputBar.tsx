import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { PlusIcon, SendIcon } from '../common/Icons';
import { chatInputBarStyles } from '../../styles/ChatInputBar.styles';

interface ChatInputBarProps {
  inputText: string;
  onChangeText: (text: string) => void;
  onSend: () => Promise<void> | void;
  onPlusPress?: () => void;
  bottomInset: number;
}

const ChatInputBar: React.FC<ChatInputBarProps> = ({
  inputText,
  onChangeText,
  onSend,
  onPlusPress,
  bottomInset,
}) => {
  const [isSending, setIsSending] = useState(false);
  const paddingBottom = Math.max(bottomInset, 8);

  const handleSend = async () => {
    if (isSending || !inputText.trim()) return;

    setIsSending(true);
    try {
      await onSend();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View
      style={[
        chatInputBarStyles.container,
        { paddingBottom },
      ]}
    >
      <TouchableOpacity style={chatInputBarStyles.plusButton} onPress={onPlusPress}>
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
        onPress={handleSend}
        disabled={isSending || !inputText.trim()}
      >
        <SendIcon color="#FFFFFF" size={17} style={chatInputBarStyles.sendIcon} />
      </TouchableOpacity>
    </View>
  );
};

export default ChatInputBar;

// 채팅 아이템 컴포넌트

import React from "react"
import { Text } from "react-native"
import { ChatMessage } from "../../types/chatBoard.type"

const ChatMessageItem = ({ item }: { item: ChatMessage }) => (
    <Text>채팅: {item.text}</Text>
)

export default ChatMessageItem;
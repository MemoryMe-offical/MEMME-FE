import React, { useEffect, useState } from 'react';
import { View, Alert, Text, Button, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { ChatBoardItem, ChatMessage, BoardPost, MessageType } from '../types/chatBoard.type';
import ChatMessageItem from '../components/chat/ChatMessageItem'
import BoardPostItem from '../components/board/BoardPostItem';

// 예시 아이템
const initItems: ChatBoardItem[] = [
    {
        id: '1',
        userId: '24',
        type: 'chat',
        bookMark: false,
        text: '오늘 할 일을 정리해보자.',
        createdAt: new Date().toISOString(),
    },
    {
        id: '2',
        userId: '22',
        bookMark: false,
        type: 'post',
        title: '📌 오늘의 TODO',
        content: '- 타입 정의하기\n- 메인 화면 UI 잡기',
        createdAt: new Date().toISOString(),
    },
    {
        id: '3',
        userId: '24',
        type: 'chat',
        bookMark: false,
        text: '리액트 네이티브 공부하기',
        createdAt: new Date().toISOString(),
    },
]

const MainScreen = () => {
    const [items, setItems] = useState<ChatBoardItem[]>(initItems);
    const [messageType, setMessageType] = useState<MessageType>('chat');
    const [inputText, setInputText] = useState('');

    return (
        <View style={styles.container}>
            <FlatList<ChatBoardItem> // 이 리스트는 ChatBoardItem 배열을 렌더링하는 컴포넌트 명시
                data={items} // 리스트에 보일 데이터 배열
                keyExtractor={item => item.id} // items 중 하나의 아이템의 고유 key를 뽑는 함수(item의 id를 key로 쓰겠다.)
                renderItem={({ item }) => {
                    if (item.type == 'chat') {
                        return <ChatMessageItem item={item} />;
                    }
                    return <BoardPostItem item={item} />;
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default MainScreen;
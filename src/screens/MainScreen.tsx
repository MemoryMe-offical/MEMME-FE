import React, { useEffect, useState } from 'react';
import { View, Alert, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { ChatBoardItem, ChatMessage, BoardPost, MessageType } from '../types/chatBoard.type';

const MainScreen = () => {
    const [count, setCount] = useState<number>(0);

    const handleCount = () => {
        setCount(count + 1);
    }

    useEffect(() => {
        if (count >= 10) {
            Alert.alert("ㅎㅇ");
        }
    }, [count]);

    return (
        <View style={styles.container}>
            <Text>맴매 맞을 횟수: {count}</Text>
            <TouchableOpacity onPress={handleCount} style={styles.button}>
                <Text>+</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    button: {
        marginTop: 10,
        width: 30,
        height: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        backgroundColor: 'lightblue'
    }
})

export default MainScreen;
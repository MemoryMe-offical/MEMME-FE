import React, {useState} from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';

const HomeScreen = () => {
    const [count, setCount] = useState(0);

    const handleCount = () => {
        setCount(count + 1);
    }

    return (
        <View style={styles.container}>
            <Text>맴매 맞을 횟수: {count}</Text>
            <Button title="+" onPress={handleCount} />
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

export default HomeScreen;
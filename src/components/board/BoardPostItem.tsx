// 게시물 아이템 컴포넌트

import React from "react";
import { Text } from "react-native";
import { BoardPost } from "../../types/chatBoard.type";

const BoardPostItem = ({ item }: { item: BoardPost }) => (
    <Text>게시물 제목: {item.title}, 내용: {item.content}</Text>
)

export default BoardPostItem;
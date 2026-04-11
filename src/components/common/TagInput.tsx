import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  suggestions?: string[]; // TODO(P3): GET /api/tags 결과로 교체
  placeholder?: string;
}

const TagInput = ({ tags, onChange, maxTags = 10, suggestions = [], placeholder }: TagInputProps) => {
  const [inputText, setInputText] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const isMaxReached = tags.length >= maxTags;

  const filteredSuggestions = inputText.trim().length > 0
    ? suggestions.filter(
        s => s.toLowerCase().includes(inputText.toLowerCase()) && !tags.includes(s)
      )
    : [];

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || tags.includes(trimmed) || isMaxReached) return;
    onChange([...tags, trimmed]);
    setInputText('');
    setDropdownVisible(false);
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag));
  };

  const handleSubmitEditing = () => {
    addTag(inputText);
  };

  const handleChangeText = (text: string) => {
    // 쉼표 입력 시 즉시 태그 추가
    if (text.endsWith(',')) {
      addTag(text.slice(0, -1));
      return;
    }
    setInputText(text);
    setDropdownVisible(filteredSuggestions.length > 0 || text.trim().length > 0);
  };

  return (
    <View style={styles.container}>
      {/* 태그 칩 + 입력창 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        keyboardShouldPersistTaps="handled">
        {tags.map(tag => (
          <View key={tag} style={styles.chip}>
            <Text style={styles.chipText}>#{tag}</Text>
            <TouchableOpacity onPress={() => removeTag(tag)} hitSlop={6} style={styles.chipRemove}>
              <Text style={styles.chipRemoveText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}

        {!isMaxReached && (
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={inputText}
            onChangeText={handleChangeText}
            onSubmitEditing={handleSubmitEditing}
            onBlur={() => {
              if (inputText.trim()) addTag(inputText);
              setDropdownVisible(false);
            }}
            placeholder={tags.length === 0 ? (placeholder ?? '태그 추가') : ''}
            placeholderTextColor="#AABBCC"
            returnKeyType="done"
            blurOnSubmit={false}
          />
        )}
      </ScrollView>

      {/* suggestions 드롭다운 */}
      {dropdownVisible && filteredSuggestions.length > 0 && (
        <View style={styles.dropdown}>
          {filteredSuggestions.slice(0, 5).map(s => (
            <TouchableOpacity
              key={s}
              style={styles.dropdownItem}
              onPress={() => addTag(s)}>
              <Text style={styles.dropdownItemText}>#{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {isMaxReached && (
        <Text style={styles.maxHint}>최대 {maxTags}개까지 추가할 수 있습니다.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 2,
    minHeight: 40,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EEFF',
    borderRadius: 12,
    paddingVertical: 4,
    paddingLeft: 10,
    paddingRight: 6,
    gap: 4,
  },
  chipText: {
    fontSize: 13,
    color: '#588DFF',
    fontWeight: '500',
  },
  chipRemove: {
    padding: 2,
  },
  chipRemoveText: {
    fontSize: 14,
    color: '#588DFF',
    lineHeight: 16,
  },
  input: {
    minWidth: 80,
    fontSize: 14,
    color: '#1A1A1A',
    padding: 0,
    height: 32,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E8F8',
    zIndex: 100,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4FF',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#3A3A3A',
  },
  maxHint: {
    fontSize: 12,
    color: '#AABBCC',
    marginTop: 4,
  },
});

export default TagInput;

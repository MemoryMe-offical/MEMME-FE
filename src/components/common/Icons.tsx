import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';

interface IconProps {
  color?: string;
  size?: number;
  style?: StyleProp<TextStyle>;
}

export const CloseIcon = ({ color = '#1A1A1A', size = 16, style }: IconProps) => (
  <MCI name="close" color={color} size={size} style={style} />
);

export const HamburgerIcon = ({ color = '#1A1A1A', size = 20, style }: IconProps) => (
  <MCI name="menu" color={color} size={size} style={style} />
);

export const SearchIcon = ({ color = '#1A1A1A', size = 20, style }: IconProps) => (
  <MCI name="magnify" color={color} size={size} style={style} />
);

export const SendIcon = ({ color = '#FFFFFF', size = 18, style,  }: IconProps) => (
  <MCI name="send" color={color} size={size} style={[{ transform: [{ rotate: '-30deg' }] }, style]} />
);

export const PlusIcon = ({ color = '#888', size = 22, style }: IconProps) => (
  <MCI name="plus" color={color} size={size} style={style} />
);

export const SettingsIcon = ({ color = '#1A1A1A', size = 20, style }: IconProps) => (
  <MCI name="cog" color={color} size={size} style={style} />
);

export const EditIcon = ({ color = '#1A1A1A', size = 16, style }: IconProps) => (
  <MCI name="pencil" color={color} size={size} style={style} />
);

export const CopyIcon = ({ color = '#1A1A1A', size = 20, style }: IconProps) => (
  <MCI name="content-copy" color={color} size={size} style={style} />
);

export const TrashIcon = ({ color = '#FF3B30', size = 18, style }: IconProps) => (
  <MCI name="trash-can-outline" color={color} size={size} style={style} />
);

export const ConvertIcon = ({ color = '#588DFF', size = 18, style }: IconProps) => (
  <MCI name="swap-horizontal" color={color} size={size} style={style} />
);

export const CameraIcon = ({ color = '#1A1A1A', size = 18, style }: IconProps) => (
  <MCI name="camera-outline" color={color} size={size} style={style} />
);

export const CalendarIcon = ({ color = '#1A1A1A', size = 18, style }: IconProps) => (
  <MCI name="calendar-outline" color={color} size={size} style={style} />
);

export const ClockIcon = ({ color = '#1A1A1A', size = 18, style }: IconProps) => (
  <MCI name="clock-outline" color={color} size={size} style={style} />
);

export const BookmarkIcon = ({ color = '#AABBCC', size = 18, style }: IconProps) => (
  <MCI name="bookmark-outline" color={color} size={size} style={style} />
);

export const BookmarkFilledIcon = ({ color = '#FF9500', size = 18, style }: IconProps) => (
  <MCI name="bookmark" color={color} size={size} style={style} />
);

export const MoreIcon = ({ color = '#1A1A1A', size = 20, style }: IconProps) => (
  <MCI name="dots-horizontal" color={color} size={size} style={style} />
);

export const ChevronDownIcon = ({ color = '#1A1A1A', size = 18, style }: IconProps) => (
  <MCI name="chevron-down" color={color} size={size} style={style} />
);

export const ChevronUpIcon = ({ color = '#1A1A1A', size = 18, style }: IconProps) => (
  <MCI name="chevron-up" color={color} size={size} style={style} />
);

export const ChevronRightIcon = ({ color = '#1A1A1A', size = 18, style }: IconProps) => (
  <MCI name="chevron-right" color={color} size={size} style={style} />
);

export const ArrowLeftIcon = ({ color = '#1A1A1A', size = 22, style }: IconProps) => (
  <MCI name="arrow-left" color={color} size={size} style={style} />
);

export const LinkIcon = ({ color = '#1A1A1A', size = 18, style }: IconProps) => (
  <MCI name="link-variant" color={color} size={size} style={style} />
);

export const PlusCircleIcon = ({ color = '#588DFF', size = 20, style }: IconProps) => (
  <MCI name="plus-circle-outline" color={color} size={size} style={style} />
);

export const ImageIcon = ({ color = '#1A1A1A', size = 18, style }: IconProps) => (
  <MCI name="image-plus" color={color} size={size} style={style} />
);

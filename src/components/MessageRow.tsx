import { Image, Pressable, View } from 'react-native';
import { Message } from '../types';
import { Icon, Txt, useTheme } from './UI';
import { fonts } from '../theme';
import { shortDate } from '../lib';
export const artwork = [
  require('../../assets/pastor0.jpg'),
  require('../../assets/pastor1.jpg'),
  require('../../assets/pastor2.jpg'),
  require('../../assets/pastor3.png'),
];
export function MessageRow({ message, onPress }: { message: Message; onPress: () => void }) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Listen to ${message.title} by ${message.pastor}`}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: c.line,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Image
        source={artwork[message.image]}
        accessibilityIgnoresInvertColors
        style={{ width: 63, height: 70, borderRadius: 12 }}
      />
      <View style={{ flex: 1, gap: 4 }}>
        <Txt numberOfLines={2} style={{ fontFamily: fonts.bold, fontSize: 13, lineHeight: 20 }}>
          {message.title}
        </Txt>
        <Txt style={{ fontSize: 11, color: c.muted, lineHeight: 17 }}>{message.pastor}</Txt>
        <Txt style={{ fontSize: 10, color: c.muted, lineHeight: 17 }}>
          {shortDate(message.date)} · {message.service}
        </Txt>
      </View>
      <View
        style={{
          width: 33,
          height: 33,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: c.surface,
        }}
      >
        <Icon name="play" size={14} />
      </View>
    </Pressable>
  );
}

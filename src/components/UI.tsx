import React, { createContext, useContext } from 'react';
import { Text, TextProps, Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Palette, dark, fonts } from '../theme';
export const ThemeContext = createContext<Palette>(dark);
export const useTheme = () => useContext(ThemeContext);
export function Txt({ style, ...props }: TextProps) {
  const c = useTheme();
  return (
    <Text
      {...props}
      style={[{ color: c.text, fontFamily: fonts.regular, fontSize: 14, lineHeight: 22 }, style]}
    />
  );
}
export function Eyebrow({ children }: { children: React.ReactNode }) {
  const c = useTheme();
  return (
    <Txt style={{ color: c.muted, fontSize: 10, letterSpacing: 1.8, fontFamily: fonts.bold }}>
      {children}
    </Txt>
  );
}
export type IconName = React.ComponentProps<typeof Ionicons>['name'];
export function Icon({
  name,
  color,
  size = 22,
}: {
  name: IconName;
  color?: string;
  size?: number;
}) {
  const c = useTheme();
  return <Ionicons name={name} color={color || c.text} size={size} />;
}
export function IconButton({
  name,
  label,
  onPress,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
}) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: c.surface,
          borderWidth: 1,
          borderColor: c.line,
          opacity: pressed ? 0.65 : 1,
        },
      ]}
    >
      <Icon name={name} size={21} />
    </Pressable>
  );
}
export function Section({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  const c = useTheme();
  return (
    <View style={styles.section}>
      <Txt style={{ fontFamily: fonts.heavy, fontSize: 19 }}>{title}</Txt>
      {action && (
        <Pressable onPress={onPress} hitSlop={12} accessibilityRole="button">
          <Txt style={{ fontSize: 12, color: c.accent }}>{action} →</Txt>
        </Pressable>
      )}
    </View>
  );
}
export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const c = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: c.card,
          borderColor: c.line,
          borderWidth: 1,
          borderRadius: 19,
          padding: 20,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export const styles = StyleSheet.create({
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 27,
    marginBottom: 16,
  },
});

import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useResponsiveLayout() {
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const availableWidth = Math.min(width - insets.left - insets.right, 1120);
  const tablet = availableWidth >= 768;
  return {
    tablet,
    gutter: tablet ? 32 : 22,
    // Keep rows readable in split-screen and with enlarged system text.
    columns: tablet && fontScale <= 1.3 ? 2 : 1,
  };
}

import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts } from '../theme';

const bars = [10, 18, 30, 15, 42, 58, 28, 74, 48, 90, 60, 36, 76, 52, 30, 64, 42, 22, 36, 17, 10];
const native = Platform.OS !== 'web';

export function LaunchScreen({
  ready,
  fontsReady,
  onFinish,
}: {
  ready: boolean;
  fontsReady: boolean;
  onFinish: () => void;
}) {
  const compact = useWindowDimensions().height < 720;
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const [elapsed, setElapsed] = useState(false);
  const [reveal] = useState(() => new Animated.Value(0));
  const [atmosphere] = useState(() => new Animated.Value(0));
  const [fade] = useState(() => new Animated.Value(1));
  const family = fontsReady ? fonts.heavy : undefined;

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setReduceMotion(value);
      })
      .catch(() => {
        if (active) setReduceMotion(true);
      });
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      active = false;
      listener.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion === null) return;
    if (reduceMotion) {
      reveal.setValue(1);
      atmosphere.setValue(0.5);
      return;
    }
    const entrance = Animated.timing(reveal, {
      toValue: 1,
      duration: 1100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: native,
    });
    const drift = Animated.loop(
      Animated.sequence([
        Animated.timing(atmosphere, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: native,
        }),
        Animated.timing(atmosphere, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: native,
        }),
      ]),
    );
    entrance.start();
    drift.start();
    const timer = setTimeout(() => setElapsed(true), 3200);
    return () => {
      clearTimeout(timer);
      entrance.stop();
      drift.stop();
    };
  }, [reduceMotion, reveal, atmosphere]);

  useEffect(() => {
    if (!ready || (!elapsed && !reduceMotion)) return;
    if (reduceMotion) {
      onFinish();
      return;
    }
    const exit = Animated.timing(fade, { toValue: 0, duration: 500, useNativeDriver: native });
    exit.start(({ finished: done }) => {
      if (done) onFinish();
    });
    return () => exit.stop();
  }, [ready, elapsed, reduceMotion, fade, onFinish]);

  return (
    <Animated.View style={[styles.screen, { opacity: fade }]}>
      <StatusBar style="light" />
      <LinearGradient colors={['#080c13', '#181418', '#2b1515']} style={StyleSheet.absoluteFill} />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.halo,
          {
            opacity: atmosphere.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.65] }),
            transform: [
              { scale: atmosphere.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.13] }) },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#d8913d35', '#bd583508', '#080c1300']}
          style={{ flex: 1, borderRadius: 250 }}
        />
      </Animated.View>
      <View
        pointerEvents="none"
        style={[styles.orbit, { width: 390, height: 390, top: '15%', right: -210 }]}
      />
      <View
        pointerEvents="none"
        style={[styles.orbit, { width: 540, height: 540, top: '8%', right: -285 }]}
      />
      <SafeAreaView style={styles.safe}>
        <View style={styles.brand}>
          <Image source={require('../../assets/church-logo.png')} style={styles.logo} />
          <View>
            <Text style={[styles.brandName, { fontFamily: family }]}>LFC JAHI</Text>
            <Text style={styles.brandSub}>MEDIA & MESSAGES</Text>
          </View>
        </View>
        <Animated.View
          style={[
            styles.body,
            {
              opacity: reveal,
              transform: [
                { translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) },
              ],
            },
          ]}
        >
          <View style={styles.kicker}>
            <View style={styles.line} />
            <Text style={styles.eyebrow}>A MOMENT IN HIS PRESENCE</Text>
          </View>
          <Text
            accessibilityRole="header"
            style={[
              styles.headline,
              { fontFamily: family, ...(compact ? { fontSize: 36, lineHeight: 43 } : {}) },
            ]}
          >
            Let the Word{'\n'}dwell in <Text style={styles.gold}>you.</Text>
          </Text>
          <Text
            style={[styles.description, { fontFamily: fontsReady ? fonts.regular : undefined }]}
          >
            Still your heart. Open your ears.{'\n'}Make room for His voice.
          </Text>
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[styles.wave, compact && { height: 58, marginVertical: 16 }]}
          >
            {bars.map((height, i) => (
              <Animated.View
                key={i}
                style={{
                  height: compact ? height * 0.6 : height,
                  width: 3,
                  borderRadius: 3,
                  backgroundColor: i % 3 === 0 ? '#f0c991' : '#b87c54',
                  opacity: 0.45 + (height / 90) * 0.55,
                  transform: [
                    {
                      scaleY: atmosphere.interpolate({
                        inputRange: [0, 1],
                        outputRange: [i % 2 ? 0.45 : 1, i % 2 ? 1 : 0.55],
                      }),
                    },
                  ],
                }}
              />
            ))}
          </View>
          <View style={styles.scripture}>
            <Text style={styles.quote}>
              “Faith cometh by hearing, and{'\n'}hearing by the word of God.”
            </Text>
            <Text style={styles.reference}>ROMANS 10:17 · KJV</Text>
          </View>
        </Animated.View>
        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enter the app"
            disabled={!ready}
            onPress={() => setElapsed(true)}
            style={({ pressed }) => [styles.enter, { opacity: ready ? (pressed ? 0.65 : 1) : 0.5 }]}
          >
            <Text style={[styles.enterText, { fontFamily: fontsReady ? fonts.medium : undefined }]}>
              {ready ? 'Enter the Word' : 'Preparing your quiet moment'}
            </Text>
            {ready && <Text style={styles.arrow}>→</Text>}
          </Pressable>
          <Text style={styles.footerNote}>LISTEN. BELIEVE. BECOME.</Text>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  screen: { position: 'absolute', inset: 0, backgroundColor: '#080c13', zIndex: 1000 },
  safe: { flex: 1, paddingHorizontal: 30, width: '100%', maxWidth: 560, alignSelf: 'center' },
  halo: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    top: '9%',
    right: -180,
  },
  orbit: { position: 'absolute', borderRadius: 400, borderWidth: 1, borderColor: '#d5a97712' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 22 },
  logo: { width: 38, height: 38, borderRadius: 19 },
  brandName: { color: '#f6efe6', fontSize: 15, letterSpacing: 1.8 },
  brandSub: { color: '#b6a799', fontSize: 8, letterSpacing: 2.5, marginTop: 5 },
  body: { flex: 1, justifyContent: 'center', paddingVertical: 22 },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 22 },
  line: { width: 23, height: 1, backgroundColor: '#d8ab74' },
  eyebrow: { color: '#d8ab74', fontSize: 9, letterSpacing: 1.7 },
  headline: { color: '#fff7ee', fontSize: 43, lineHeight: 51, letterSpacing: -1.9 },
  gold: { color: '#e9be83' },
  description: { color: '#bdb1a7', fontSize: 14, lineHeight: 24, marginTop: 20 },
  wave: { height: 90, flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 26 },
  scripture: { borderLeftWidth: 1, borderColor: '#b78b524d', paddingLeft: 16 },
  quote: { color: '#e0d3c5', fontSize: 15, lineHeight: 24, fontStyle: 'italic' },
  reference: { color: '#b69775', fontSize: 8, letterSpacing: 2, marginTop: 12 },
  footer: { paddingBottom: 18, gap: 16 },
  enter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
    borderTopWidth: 1,
    borderColor: '#ffffff22',
    paddingTop: 10,
  },
  enterText: { color: '#f0d5b2', fontSize: 13 },
  arrow: { color: '#f0d5b2', fontSize: 23 },
  footerNote: { color: '#8b7d73', fontSize: 8, letterSpacing: 2.5 },
});

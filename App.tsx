import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Pressable,
  Platform,
  ScrollView,
  ScrollViewInstance,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useFonts } from 'expo-font';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { Manrope_800ExtraBold } from '@expo-google-fonts/manrope/800ExtraBold';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { dark, light, fonts } from './src/theme';
import { Eyebrow, Icon, IconButton, IconName, ThemeContext, Txt } from './src/components/UI';
import { Home } from './src/screens/Home';
import { Library } from './src/screens/Library';
import { Prayers } from './src/screens/Prayers';
import { Player } from './src/components/Player';
import { artwork } from './src/components/MessageRow';
import { Message, PrayerGuide, Tab } from './src/types';
import { isStringArray, isTheme, usePersistentState } from './src/hooks/usePersistentState';
import { openUrl } from './src/lib';
import messageData from './src/data/messages.json';
import prayerData from './src/data/prayers.json';
import resources from './src/data/resources.json';
const messages: Message[] = messageData;
const guides: PrayerGuide[] = prayerData;
const tabs: { label: Tab; icon: IconName }[] = [
  { label: 'Home', icon: 'home-outline' },
  { label: 'Messages', icon: 'library-outline' },
  { label: 'Prayers', icon: 'sunny-outline' },
  { label: 'Saved', icon: 'heart-outline' },
  { label: 'Connect', icon: 'people-outline' },
];
export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
function AppContent() {
  const theme = usePersistentState<'dark' | 'light'>('lfc-native-theme', 'dark', isTheme);
  const saved = usePersistentState<string[]>('lfc-native-saved', [], isStringArray);
  const prayed = usePersistentState<string[]>('lfc-native-prayed', [], isStringArray);
  const [fontsLoaded, fontError] = useFonts({
    Manrope_700Bold,
    Manrope_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
  });
  const [tab, setTab] = useState<Tab>('Home');
  const [query, setQuery] = useState('');
  const [guide, setGuide] = useState<PrayerGuide | null>(null);
  const [current, setCurrent] = useState<Message | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const scroll = useRef<ScrollViewInstance>(null);
  const insets = useSafeAreaInsets();
  const player = useAudioPlayer(null, { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);
  const c = theme.value === 'dark' ? dark : light;
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch(() => {});
  }, []);
  useEffect(() => {
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      if (playerOpen) {
        setPlayerOpen(false);
        return true;
      }
      if (guide) {
        setGuide(null);
        return true;
      }
      if (tab !== 'Home') {
        setTab('Home');
        return true;
      }
      return false;
    });
    return () => back.remove();
  }, [playerOpen, guide, tab]);
  function navigate(t: Tab) {
    setTab(t);
    setQuery('');
    setGuide(null);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }
  function play(m: Message) {
    try {
      if (current?.id !== m.id) {
        player.replace({ uri: m.audioUrl });
        setCurrent(m);
      }
      player.play();
      if (Platform.OS !== 'web')
        player.setActiveForLockScreen(true, {
          title: m.title,
          artist: m.pastor,
          albumTitle: 'LFC Jahi Media',
        });
      setPlayerOpen(true);
    } catch {
      Alert.alert('Unable to play', 'Check your connection and try again.');
    }
  }
  function toggle() {
    try {
      if (status.playing) player.pause();
      else {
        if (status.didJustFinish) void player.seekTo(0);
        player.play();
      }
    } catch {
      Alert.alert('Unable to play', 'Please try opening the original message.');
    }
  }
  function save(id: string) {
    saved.setValue((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function openGuide(g: PrayerGuide | null) {
    setGuide(g);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }
  if ((!fontsLoaded && !fontError) || !theme.ready || !saved.ready || !prayed.ready)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: c.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={c.accent} />
      </View>
    );
  return (
    <ThemeContext.Provider value={c}>
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <StatusBar style={theme.value === 'dark' ? 'light' : 'dark'} />
        <SafeAreaView
          edges={['top', 'left', 'right']}
          style={{
            flex: 1,
            width: '100%',
            maxWidth: 560,
            alignSelf: 'center',
            backgroundColor: c.background,
          }}
        >
          <View
            style={{
              paddingHorizontal: 23,
              paddingTop: 12,
              paddingBottom: 17,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 11,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go to home"
              onPress={() => navigate('Home')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}
            >
              <Image
                source={require('./assets/church-logo.png')}
                style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff' }}
              />
              <View>
                <Txt style={{ fontFamily: fonts.heavy, fontSize: 18, letterSpacing: -0.6 }}>
                  LFC JAHI
                </Txt>
                <Txt style={{ fontSize: 8, letterSpacing: 2, color: c.muted, lineHeight: 17 }}>
                  MEDIA & MESSAGES
                </Txt>
              </View>
            </Pressable>
            <IconButton
              name={theme.value === 'dark' ? 'sunny-outline' : 'moon-outline'}
              label={theme.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onPress={() => theme.setValue((v) => (v === 'dark' ? 'light' : 'dark'))}
            />
          </View>
          <ScrollView
            ref={scroll}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 30 }}
          >
            {(saved.error || theme.error || prayed.error) && (
              <Txt style={{ fontSize: 11, color: c.accent, marginBottom: 10 }}>
                Device storage is unavailable. Your changes may not be kept after closing the app.
              </Txt>
            )}
            {tab === 'Home' && (
              <Home
                messages={messages}
                onPlay={play}
                onTab={navigate}
                onSearch={(q) => {
                  setQuery(q);
                  setTab('Messages');
                }}
                onShiloh={() => openUrl(resources.shiloh)}
                saved={saved.value}
                onSave={save}
              />
            )}
            {(tab === 'Messages' || tab === 'Saved') && (
              <Library
                key={tab}
                messages={
                  tab === 'Saved' ? messages.filter((m) => saved.value.includes(m.id)) : messages
                }
                onPlay={play}
                savedOnly={tab === 'Saved'}
                query={query}
                setQuery={setQuery}
              />
            )}
            {tab === 'Prayers' && (
              <Prayers
                guides={guides}
                guide={guide}
                onGuide={openGuide}
                prayed={prayed.value}
                onToggle={(key) =>
                  prayed.setValue((p) =>
                    p.includes(key) ? p.filter((x) => x !== key) : [...p, key],
                  )
                }
                onReset={(g) => prayed.setValue((p) => p.filter((x) => !x.startsWith(g.id + ':')))}
              />
            )}
            {tab === 'Connect' && (
              <>
                <View style={{ marginVertical: 20 }}>
                  <Eyebrow>FAITH. FELLOWSHIP. FAMILY.</Eyebrow>
                  <Txt
                    style={{ fontSize: 30, lineHeight: 40, fontFamily: fonts.heavy, marginTop: 10 }}
                  >
                    You belong here.
                  </Txt>
                  <Txt style={{ color: c.muted, fontSize: 13, marginTop: 10 }}>
                    Stay connected to the Word and our community.
                  </Txt>
                </View>
                {[
                  {
                    title: 'Shiloh 2025',
                    text: 'Revisit the teachings. Keep the fire burning.',
                    icon: 'book-outline' as const,
                    press: () => openUrl(resources.shiloh),
                  },
                  {
                    title: 'Stand with us in prayer',
                    text: 'Dated prayer guides and scriptures for your prayer time.',
                    icon: 'sunny-outline' as const,
                    press: () => navigate('Prayers'),
                  },
                  {
                    title: 'Find your home cell',
                    text: 'Discover a fellowship near you in Abuja.',
                    icon: 'people-outline' as const,
                    press: () => openUrl(resources.homeCells),
                  },
                ].map((x) => (
                  <Pressable
                    key={x.title}
                    accessibilityRole="button"
                    onPress={x.press}
                    style={{
                      backgroundColor: c.surface,
                      borderWidth: 1,
                      borderColor: c.line,
                      borderRadius: 20,
                      padding: 23,
                      marginBottom: 15,
                    }}
                  >
                    <Icon name={x.icon} color={c.accent} />
                    <Txt
                      style={{
                        fontSize: 21,
                        lineHeight: 29,
                        fontFamily: fonts.bold,
                        marginVertical: 15,
                      }}
                    >
                      {x.title}
                    </Txt>
                    <Txt style={{ fontSize: 13, color: c.muted }}>{x.text}</Txt>
                    <Txt style={{ color: c.accent, fontSize: 12, marginTop: 17 }}>Explore →</Txt>
                  </Pressable>
                ))}
                <Txt style={{ fontFamily: fonts.bold, marginTop: 15 }}>About LFC Jahi Media</Txt>
                <Txt style={{ color: c.muted, fontSize: 13, lineHeight: 24, marginVertical: 12 }}>
                  Faith-building audio messages to keep you connected to God’s Word, wherever you
                  are.
                </Txt>
                <Pressable accessibilityRole="link" onPress={() => openUrl(resources.website)}>
                  <Txt style={{ color: c.accent }}>Visit the website →</Txt>
                </Pressable>
              </>
            )}
          </ScrollView>
          {current && (
            <View
              style={{
                marginHorizontal: 14,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: c.line,
                borderRadius: 17,
                backgroundColor: c.surface,
                flexDirection: 'row',
                gap: 10,
                padding: 10,
                alignItems: 'center',
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open player"
                onPress={() => setPlayerOpen(true)}
                style={{ flexDirection: 'row', gap: 10, alignItems: 'center', flex: 1 }}
              >
                <Image
                  source={artwork[current.image]}
                  style={{ width: 40, height: 44, borderRadius: 8 }}
                />
                <View style={{ flex: 1 }}>
                  <Txt numberOfLines={1} style={{ fontSize: 12, fontFamily: fonts.bold }}>
                    {current.title}
                  </Txt>
                  <Txt numberOfLines={1} style={{ fontSize: 10, color: c.muted }}>
                    {current.pastor}
                  </Txt>
                </View>
              </Pressable>
              <IconButton
                name={status.playing ? 'pause' : 'play'}
                label={status.playing ? 'Pause audio' : 'Play audio'}
                onPress={toggle}
              />
            </View>
          )}
          <View
            style={{
              flexDirection: 'row',
              borderTopWidth: 1,
              borderColor: c.line,
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom, 12),
              backgroundColor: c.background,
            }}
          >
            {tabs.map((t) => (
              <Pressable
                key={t.label}
                accessibilityRole="tab"
                accessibilityState={{ selected: t.label === tab }}
                accessibilityLabel={t.label}
                onPress={() => navigate(t.label)}
                style={{ flex: 1, alignItems: 'center', gap: 5, minHeight: 45 }}
              >
                <Icon name={t.icon} size={22} color={t.label === tab ? c.accent : c.muted} />
                <Txt
                  style={{
                    fontSize: 10,
                    color: t.label === tab ? c.accent : c.muted,
                    lineHeight: 16,
                  }}
                >
                  {t.label}
                </Txt>
              </Pressable>
            ))}
          </View>
        </SafeAreaView>
        {current && (
          <Player
            visible={playerOpen}
            onClose={() => setPlayerOpen(false)}
            message={current}
            player={player}
            status={status}
            saved={saved.value.includes(current.id)}
            onSave={() => save(current.id)}
            onNext={() =>
              play(messages[(messages.findIndex((m) => m.id === current.id) + 1) % messages.length])
            }
            onToggle={toggle}
          />
        )}
      </View>
    </ThemeContext.Provider>
  );
}

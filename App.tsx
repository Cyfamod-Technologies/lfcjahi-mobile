import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Pressable,
  Platform,
  ScrollView,
  ScrollViewInstance,
  RefreshControl,
  View,
} from 'react-native';
import {
  Slot,
  router,
  usePathname,
  useLocalSearchParams,
  useGlobalSearchParams,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { LaunchScreen } from './src/components/LaunchScreen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useFonts } from 'expo-font';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { Manrope_800ExtraBold } from '@expo-google-fonts/manrope/800ExtraBold';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { dark, light, fonts } from './src/theme';
import { Icon, IconButton, IconName, ThemeContext, Txt } from './src/components/UI';
import { Home } from './src/screens/Home';
import { useResponsiveLayout } from './src/hooks/useResponsiveLayout';
import { Library } from './src/screens/Library';
import { Prayers } from './src/screens/Prayers';
import { Player } from './src/components/Player';
import { messageArtwork } from './src/components/MessageRow';
import { Message, PrayerGuide, Tab } from './src/types';
import { isStringArray, isTheme, usePersistentState } from './src/hooks/usePersistentState';
import { normalizeMessages } from './src/api';
import { useDownloads } from './src/hooks/useDownloads';
import { useRemoteCollection } from './src/hooks/useRemoteCollection';
import prayerData from './src/data/prayers.json';
void SplashScreen.preventAutoHideAsync().catch(() => {});
const guides: PrayerGuide[] = prayerData;
const tabs: { label: Tab; icon: IconName }[] = [
  { label: 'Home', icon: 'home-outline' },
  { label: 'Messages', icon: 'library-outline' },
  { label: 'Prayers', icon: 'sunny-outline' },
  { label: 'Saved', icon: 'heart-outline' },
];
const routePaths = {
  Home: '/',
  Messages: '/messages',
  Prayers: '/prayers',
  Saved: '/saved',
} as const;
const ScreenContext = createContext<React.ReactNode>(null);
const MessageLinkContext = createContext<((id: string) => void) | null>(null);
export function SharedMessageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const openMessage = useContext(MessageLinkContext);
  useEffect(() => {
    if (typeof id === 'string') openMessage?.(id);
  }, [id, openMessage]);
  return <RoutedScreen />;
}
export function RoutedScreen() {
  return useContext(ScreenContext);
}
export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
function AppContent() {
  const [launchFinished, setLaunchFinished] = useState(false);
  const finishLaunch = useCallback(() => setLaunchFinished(true), []);
  const media = useRemoteCollection('media', normalizeMessages);
  const downloads = useDownloads();
  const messages = useMemo(
    () => [
      ...media.data,
      ...downloads.records
        .filter((r) => !media.data.some((m) => m.id === r.message.id))
        .map((r) => r.message),
    ],
    [media.data, downloads.records],
  );
  const theme = usePersistentState<'dark' | 'light'>('lfc-native-theme', 'dark', isTheme);
  const saved = usePersistentState<string[]>('lfc-native-saved', [], isStringArray);
  const prayed = usePersistentState<string[]>('lfc-native-prayed', [], isStringArray);
  const [fontsLoaded, fontError] = useFonts({
    Manrope_700Bold,
    Manrope_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
  });
  const pathname = usePathname();
  const tab = pathname.startsWith('/messages/')
    ? 'Messages'
    : (Object.keys(routePaths) as Tab[]).find((t) => routePaths[t] === pathname) || 'Home';
  const { id: sharedId } = useGlobalSearchParams<{ id?: string }>();
  const handledShared = useRef<string | null>(null);
  const setTab = (t: Tab) => router.navigate(routePaths[t]);
  const feed = media;
  const [query, setQuery] = useState('');
  const [guide, setGuide] = useState<PrayerGuide | null>(null);
  const [current, setCurrent] = useState<Message | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const playbackSession = useRef(0);
  const loadedAudio = useRef<string | null>(null);
  const scroll = useRef<ScrollViewInstance>(null);
  const insets = useSafeAreaInsets();
  const { gutter } = useResponsiveLayout();
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
  function play(m: Message, openPlayer = true) {
    playbackSession.current += 1;
    try {
      const uri = downloads.source(m);
      if (current?.id !== m.id || loadedAudio.current !== uri) {
        player.replace({ uri });
        loadedAudio.current = uri;
        setCurrent(m);
      }
      player.play();
      if (Platform.OS !== 'web')
        player.setActiveForLockScreen(true, {
          title: m.title,
          artist: m.pastor,
          albumTitle: 'LFC Jahi Media',
        });
      if (openPlayer) setPlayerOpen(true);
    } catch {
      Alert.alert('Unable to play', 'Check your connection and try again.');
    }
  }
  async function toggle() {
    const session = playbackSession.current;
    try {
      if (status.playing) player.pause();
      else {
        if (status.playbackState === 'error' && current) {
          const uri = downloads.source(current);
          player.replace({ uri });
          loadedAudio.current = uri;
        } else if (status.didJustFinish) await player.seekTo(0);
        if (session !== playbackSession.current) return;
        player.play();
        if (Platform.OS !== 'web' && current)
          player.setActiveForLockScreen(true, {
            title: current.title,
            artist: current.pastor,
            albumTitle: 'LFC Jahi Media',
          });
      }
    } catch {
      Alert.alert('Unable to play', 'Check your connection and tap Play to retry.');
    }
  }
  function minimizePlayer() {
    handledShared.current = null;
    setPlayerOpen(false);
    if (sharedId) router.replace('/messages');
  }
  function stopAudio() {
    handledShared.current = null;
    playbackSession.current += 1;
    try {
      player.pause();
      player.replace(null);
      loadedAudio.current = null;
    } catch {
      Alert.alert('Unable to close audio', 'Please try again.');
      return;
    }
    try {
      player.clearLockScreenControls();
    } catch {
      /* Some browsers do not expose media controls. */
    }
    setPlayerOpen(false);
    setCurrent(null);
    if (sharedId) router.replace('/messages');
  }
  function save(id: string) {
    saved.setValue((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function openGuide(g: PrayerGuide | null) {
    setGuide(g);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }
  const ready =
    (fontsLoaded || !!fontError) && theme.ready && saved.ready && prayed.ready && downloads.ready;
  const openSharedMessage = useCallback(
    (id: string) => {
      if (!ready || !launchFinished || handledShared.current === id) return;
      const message = messages.find((m) => m.id === id);
      if (!message) {
        if (!media.loading && !media.error) {
          handledShared.current = id;
          Alert.alert('Message unavailable', 'This message may no longer be published.');
        }
        return;
      }
      try {
        player.pause();
        const uri = downloads.source(message);
        player.replace({ uri });
        loadedAudio.current = uri;
        playbackSession.current += 1;
        handledShared.current = id;
        setCurrent(message);
        setPlayerOpen(true);
      } catch {
        Alert.alert('Unable to open message', 'Please try again.');
      }
    },
    [ready, launchFinished, messages, media.loading, media.error, player, downloads.source],
  );

  return (
    <ThemeContext.Provider value={c}>
      <View
        onLayout={() => {
          void SplashScreen.hideAsync().catch(() => {});
        }}
        style={{ flex: 1, backgroundColor: c.background }}
      >
        <StatusBar style={theme.value === 'dark' ? 'light' : 'dark'} />
        <SafeAreaView
          pointerEvents={playerOpen || !launchFinished ? 'none' : 'auto'}
          accessibilityElementsHidden={playerOpen || !launchFinished}
          importantForAccessibility={launchFinished && !playerOpen ? 'auto' : 'no-hide-descendants'}
          edges={['top', 'left', 'right']}
          style={{
            flex: 1,
            width: '100%',
            maxWidth: 1120,
            alignSelf: 'center',
            backgroundColor: c.background,
          }}
        >
          <View
            style={{
              paddingHorizontal: gutter,
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
            refreshControl={
              <RefreshControl
                refreshing={feed.loading}
                onRefresh={() => void feed.refresh()}
                tintColor={c.accent}
              />
            }
            contentContainerStyle={{ paddingHorizontal: gutter, paddingBottom: 30 }}
          >
            {feed.loading && !feed.data.length && (
              <ActivityIndicator color={c.accent} style={{ marginVertical: 15 }} />
            )}
            {!!feed.error && (
              <View accessibilityRole="alert" style={{ paddingVertical: 12, gap: 8 }}>
                <Txt style={{ color: c.accent, fontSize: 12 }}>{feed.error}</Txt>
                {feed.cached && (
                  <Txt style={{ color: c.muted, fontSize: 12 }}>
                    Showing previously loaded content. Audio requires a connection.
                  </Txt>
                )}
                <Pressable accessibilityRole="button" onPress={() => void feed.refresh()}>
                  <Txt style={{ color: c.accent }}>Try again →</Txt>
                </Pressable>
              </View>
            )}
            {feed.storageError && (
              <Txt style={{ color: c.muted, fontSize: 12 }}>
                Offline caching is unavailable on this device.
              </Txt>
            )}
            {(saved.error || theme.error || prayed.error) && (
              <Txt style={{ fontSize: 11, color: c.accent, marginBottom: 10 }}>
                Device storage is unavailable. Your changes may not be kept after closing the app.
              </Txt>
            )}
            <MessageLinkContext.Provider value={openSharedMessage}>
              <ScreenContext.Provider
                value={
                  <>
                    {tab === 'Home' && (
                      <Home
                        messages={messages}
                        onPlay={(message) => play(message)}
                        onTab={navigate}
                        onSearch={(q) => {
                          setQuery(q);
                          setTab('Messages');
                        }}
                        saved={saved.value}
                        onSave={save}
                      />
                    )}
                    {(tab === 'Messages' || tab === 'Saved') && (
                      <Library
                        key={tab}
                        messages={
                          tab === 'Saved'
                            ? messages.filter(
                                (m) =>
                                  saved.value.includes(m.id) ||
                                  downloads.records.some((r) => r.message.id === m.id),
                              )
                            : messages
                        }
                        onPlay={(message) => play(message)}
                        savedOnly={tab === 'Saved'}
                        query={query}
                        setQuery={setQuery}
                      />
                    )}
                    {tab === 'Prayers' && (
                      <View style={{ width: '100%', maxWidth: 760, alignSelf: 'center' }}>
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
                          onReset={(g) =>
                            prayed.setValue((p) => p.filter((x) => !x.startsWith(g.id + ':')))
                          }
                        />
                      </View>
                    )}
                  </>
                }
              >
                <Slot />
              </ScreenContext.Provider>
            </MessageLinkContext.Provider>
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
                  source={messageArtwork(current)}
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
              <IconButton name="close" label="Stop and close audio" onPress={stopAudio} />
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
        {!launchFinished && (
          <LaunchScreen ready={ready} fontsReady={fontsLoaded} onFinish={finishLaunch} />
        )}
        {current && (
          <Player
            visible={playerOpen}
            onClose={minimizePlayer}
            onStop={stopAudio}
            onDownload={() => void downloads.download(current)}
            downloaded={downloads.source(current) !== current.audioUrl}
            downloading={!!downloads.active}
            downloadProgress={
              downloads.active?.id === current.id ? downloads.active.progress : null
            }
            message={current}
            player={player}
            status={status}
            saved={saved.value.includes(current.id)}
            onSave={() => save(current.id)}
            onNext={() =>
              messages.length &&
              play(
                messages[(messages.findIndex((m) => m.id === current.id) + 1) % messages.length],
                false,
              )
            }
            onToggle={toggle}
          />
        )}
      </View>
    </ThemeContext.Provider>
  );
}

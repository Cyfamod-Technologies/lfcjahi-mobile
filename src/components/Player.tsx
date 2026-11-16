import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { AudioPlayer, AudioStatus } from 'expo-audio';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Message } from '../types';
import { fonts } from '../theme';
import { dateLabel, shareText, time } from '../lib';
import { Icon, IconButton, Txt, useTheme } from './UI';
import { messageArtwork } from './MessageRow';
export function Player({
  visible,
  onClose,
  onStop,
  message,
  player,
  status,
  saved,
  onSave,
  onNext,
  onToggle,
  onDownload,
  downloaded,
  downloadProgress,
  downloading,
}: {
  visible: boolean;
  onClose: () => void;
  onStop: () => void;
  message: Message;
  player: AudioPlayer;
  status: AudioStatus;
  saved: boolean;
  onSave: () => void;
  onNext: () => void;
  onToggle: () => void;
  onDownload: () => void;
  downloaded: boolean;
  downloading: boolean;
  downloadProgress: number | null;
}) {
  const c = useTheme();
  const compact = useWindowDimensions().height < 720;
  const [seekPosition, setSeekPosition] = useState<number | null>(null);
  async function seek(seconds: number) {
    try {
      await player.seekTo(Math.max(0, Math.min(seconds, status.duration || 0)));
    } catch {
      Alert.alert('Unable to seek', 'Wait for the audio to load and try again.');
    } finally {
      setSeekPosition(null);
    }
  }
  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      presentationStyle="fullScreen"
      allowSwipeDismissal={false}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            minHeight: compact ? 600 : undefined,
          }}
          style={{
            width: '100%',
            maxWidth: 760,
            alignSelf: 'center',
            flex: 1,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 6,
            }}
          >
            <Txt style={{ color: c.muted, fontSize: 10, letterSpacing: 2 }}>NOW PLAYING</Txt>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <IconButton name="chevron-down" label="Minimize player" onPress={onClose} />
              <IconButton name="close" label="Stop and close audio" onPress={onStop} />
            </View>
          </View>
          <View
            style={{
              flex: 1,
              minHeight: 0,
              justifyContent: 'center',
              paddingTop: 8,
              paddingBottom: 10,
            }}
          >
            <Image
              source={messageArtwork(message)}
              resizeMode="contain"
              style={{
                flex: 1,
                minHeight: 0,
                maxHeight: compact ? 150 : 320,
                width: '100%',
                borderRadius: 18,
                backgroundColor: c.surface,
                marginBottom: 14,
              }}
            />
            <Txt
              numberOfLines={3}
              maxFontSizeMultiplier={1.3}
              style={{
                fontSize: compact ? 18 : 21,
                lineHeight: compact ? 24 : 28,
                fontFamily: fonts.heavy,
              }}
            >
              {message.title}
            </Txt>
            <Txt
              numberOfLines={1}
              style={{ fontSize: 12, lineHeight: 18, color: c.muted, marginTop: 7 }}
            >
              {message.pastor}
            </Txt>
            <Txt
              numberOfLines={1}
              style={{ fontSize: 10, lineHeight: 16, color: c.muted, marginTop: 3 }}
            >
              {dateLabel(message.date)} · {message.service}
            </Txt>
            {downloaded && (
              <Txt style={{ fontSize: 10, lineHeight: 16, color: c.green, marginTop: 3 }}>
                ✓ Downloaded · Available offline
              </Txt>
            )}
          </View>
          <View style={{ paddingBottom: 6 }}>
            <Slider
              accessibilityLabel="Audio position"
              style={{ width: '100%', height: 32 }}
              minimumValue={0}
              maximumValue={Math.max(status.duration || 0, 1)}
              value={seekPosition ?? (status.currentTime || 0)}
              disabled={!status.isLoaded || !status.duration}
              minimumTrackTintColor={c.accent}
              maximumTrackTintColor={c.line}
              thumbTintColor={c.accent}
              onSlidingStart={() => setSeekPosition(status.currentTime || 0)}
              onValueChange={setSeekPosition}
              onSlidingComplete={(v) => {
                void seek(v);
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Txt style={{ fontSize: 10, color: c.muted }}>
                {time(seekPosition ?? (status.currentTime || 0))}
              </Txt>
              <Txt style={{ fontSize: 10, color: c.muted }}>{time(status.duration || 0)}</Txt>
            </View>
            {status.playbackState === 'error' && (
              <Txt
                accessibilityRole="alert"
                style={{ color: c.accent, fontSize: 10, lineHeight: 15 }}
              >
                Unable to stream. Tap Play to retry.
              </Txt>
            )}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginVertical: compact ? 10 : 16,
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back 15 seconds"
                disabled={!status.isLoaded}
                onPress={() => {
                  void seek(status.currentTime - 15);
                }}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 64,
                  gap: 4,
                }}
              >
                <Icon name="play-back-outline" size={27} />
                <Txt style={{ fontSize: 10, color: c.muted }}>15 sec</Txt>
              </Pressable>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={status.playing ? 'Pause message' : 'Play message'}
                  onPress={onToggle}
                  style={{
                    width: compact ? 64 : 76,
                    height: compact ? 64 : 76,
                    borderRadius: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: c.accent,
                  }}
                >
                  {status.isBuffering ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Icon name={status.playing ? 'pause' : 'play'} size={30} color="#fff" />
                  )}
                </Pressable>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Forward 15 seconds"
                disabled={!status.isLoaded}
                onPress={() => {
                  void seek(status.currentTime + 15);
                }}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 64,
                  gap: 4,
                }}
              >
                <Icon name="play-forward-outline" size={27} />
                <Txt style={{ fontSize: 10, color: c.muted }}>15 sec</Txt>
              </Pressable>
            </View>
            <View
              style={{
                flexDirection: 'row',
                borderTopWidth: 1,
                borderColor: c.line,
                paddingTop: 8,
              }}
            >
              {[
                {
                  icon: saved ? ('heart' as const) : ('heart-outline' as const),
                  label: saved ? 'Saved' : 'Save',
                  press: onSave,
                  disabled: false,
                },
                {
                  icon: downloaded
                    ? ('checkmark-circle-outline' as const)
                    : ('download-outline' as const),
                  label: downloading
                    ? downloadProgress === null
                      ? 'Downloading…'
                      : `${downloadProgress}%`
                    : downloaded
                      ? 'Downloaded'
                      : 'Download',
                  press: onDownload,
                  disabled: downloading,
                },
                {
                  icon: 'share-outline' as const,
                  label: 'Share',
                  press: () => shareText(message.title, message.title + '\n' + message.url),
                  disabled: false,
                },
                {
                  icon: 'play-skip-forward-outline' as const,
                  label: 'Next',
                  press: onNext,
                  disabled: false,
                },
              ].map((action) => (
                <Pressable
                  key={action.icon}
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                  accessibilityState={{ disabled: action.disabled }}
                  disabled={action.disabled}
                  onPress={action.press}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    minHeight: 58,
                    opacity: action.disabled ? 0.6 : 1,
                  }}
                >
                  {action.disabled ? (
                    <ActivityIndicator size="small" color={c.accent} />
                  ) : (
                    <Icon name={action.icon} size={22} color={c.accent} />
                  )}
                  <Txt numberOfLines={1} style={{ fontSize: 10, lineHeight: 16 }}>
                    {action.label}
                  </Txt>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

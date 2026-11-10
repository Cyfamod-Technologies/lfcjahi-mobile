import { ActivityIndicator, Image, Modal, Pressable, ScrollView, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { AudioPlayer, AudioStatus } from 'expo-audio';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Message } from '../types';
import { fonts } from '../theme';
import { dateLabel, openUrl, shareText, time } from '../lib';
import { Icon, IconButton, Txt, useTheme } from './UI';
import { artwork } from './MessageRow';
export function Player({
  visible,
  onClose,
  message,
  player,
  status,
  saved,
  onSave,
  onNext,
  onToggle,
}: {
  visible: boolean;
  onClose: () => void;
  message: Message;
  player: AudioPlayer;
  status: AudioStatus;
  saved: boolean;
  onSave: () => void;
  onNext: () => void;
  onToggle: () => void;
}) {
  const c = useTheme();
  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
        <ScrollView
          contentContainerStyle={{ padding: 25, width: '100%', maxWidth: 520, alignSelf: 'center' }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
            }}
          >
            <Txt style={{ color: c.muted, fontSize: 11, letterSpacing: 2 }}>NOW PLAYING</Txt>
            <IconButton name="chevron-down" label="Close player" onPress={onClose} />
          </View>
          <Image
            source={artwork[message.image]}
            resizeMode="contain"
            style={{ width: '100%', height: 270, backgroundColor: '#26312b', borderRadius: 22 }}
          />
          <Txt style={{ fontSize: 25, lineHeight: 34, fontFamily: fonts.heavy, marginTop: 25 }}>
            {message.title}
          </Txt>
          <Txt style={{ fontSize: 13, color: c.muted, marginTop: 10 }}>{message.pastor}</Txt>
          <Txt style={{ fontSize: 11, color: c.muted, marginTop: 4 }}>
            {dateLabel(message.date)} · {message.service} service
          </Txt>
          <Slider
            accessibilityLabel="Audio position"
            style={{ width: '100%', height: 40, marginTop: 25 }}
            minimumValue={0}
            maximumValue={Math.max(status.duration || 0, 1)}
            value={status.currentTime || 0}
            disabled={!status.isLoaded}
            minimumTrackTintColor={c.accent}
            maximumTrackTintColor={c.line}
            thumbTintColor={c.accent}
            onSlidingComplete={(v) => {
              void player.seekTo(v).catch(() => {});
            }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt style={{ fontSize: 11, color: c.muted }}>{time(status.currentTime || 0)}</Txt>
            <Txt style={{ fontSize: 11, color: c.muted }}>{time(status.duration || 0)}</Txt>
          </View>
          {status.playbackState === 'error' && (
            <Txt accessibilityRole="alert" style={{ color: c.accent, marginTop: 12, fontSize: 12 }}>
              Unable to stream. Check your connection or open the original message below.
            </Txt>
          )}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
              marginVertical: 28,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back 15 seconds"
              onPress={() => {
                void player.seekTo(Math.max(0, status.currentTime - 15)).catch(() => {});
              }}
              style={{ padding: 15 }}
            >
              <Icon name="play-back-outline" size={27} />
              <Txt style={{ fontSize: 10, textAlign: 'center', color: c.muted }}>15 sec</Txt>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={status.playing ? 'Pause message' : 'Play message'}
              onPress={onToggle}
              style={{
                width: 76,
                height: 76,
                borderRadius: 38,
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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next message"
              onPress={onNext}
              style={{ padding: 15 }}
            >
              <Icon name="play-skip-forward-outline" size={27} />
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 28 }}>
            {(
              [
                {
                  icon: saved ? 'heart' : 'heart-outline',
                  label: saved ? 'Saved' : 'Save',
                  press: onSave,
                },
                {
                  icon: 'download-outline',
                  label: 'Audio file',
                  press: () => openUrl(message.audioUrl),
                },
                {
                  icon: 'share-outline',
                  label: 'Share',
                  press: () => shareText(message.title, message.title + '\n' + message.url),
                },
              ] as const
            ).map((x) => (
              <Pressable
                key={x.label}
                onPress={x.press}
                accessibilityRole="button"
                style={{ alignItems: 'center', gap: 8, padding: 10 }}
              >
                <Icon name={x.icon} color={c.accent} />
                <Txt style={{ fontSize: 11 }}>{x.label}</Txt>
              </Pressable>
            ))}
          </View>
          <View style={{ padding: 20, borderRadius: 16, backgroundColor: c.surface }}>
            <Txt style={{ fontSize: 13, lineHeight: 23, color: c.muted }}>
              Faith cometh by hearing and hearing. Listen and be blessed.
            </Txt>
            <Pressable
              accessibilityRole="link"
              onPress={() => openUrl(message.url)}
              style={{ marginTop: 10 }}
            >
              <Txt style={{ fontSize: 12, color: c.accent }}>Open original message →</Txt>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

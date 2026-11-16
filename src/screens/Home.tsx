import { useState } from 'react';
import { Image, Pressable, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eyebrow, Icon, Section, Txt, useTheme } from '../components/UI';
import { MessageRow } from '../components/MessageRow';
import { Message, Tab } from '../types';
import { fonts } from '../theme';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
export function Home({
  messages,
  onPlay,
  onTab,
  onSearch,
  saved,
  onSave,
}: {
  messages: Message[];
  onPlay: (m: Message) => void;
  onTab: (t: Tab) => void;
  onSearch: (q: string) => void;
  saved: string[];
  onSave: (id: string) => void;
}) {
  const c = useTheme();
  const { tablet, columns } = useResponsiveLayout();
  const [search, setSearch] = useState('');
  const latest = messages[0];
  return (
    <>
      <View style={{ marginTop: 15, marginBottom: 23 }}>
        <Eyebrow>YOUR DAILY DOSE OF THE WORD</Eyebrow>
        <Txt
          style={{
            fontFamily: fonts.heavy,
            fontSize: 30,
            lineHeight: 41,
            letterSpacing: -1,
            marginTop: 7,
          }}
        >
          Feed your spirit<Txt style={{ color: c.accent, fontSize: 30 }}>.</Txt>
        </Txt>
        <Txt style={{ color: c.muted, fontSize: 13, marginTop: 5 }}>
          Timeless truth. For your everyday life.
        </Txt>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: c.surface,
          borderRadius: 15,
          borderWidth: 1,
          borderColor: c.line,
          padding: 15,
        }}
      >
        <Icon name="search-outline" size={19} color={c.muted} />
        <TextInput
          placeholder="What would you like to listen to?"
          placeholderTextColor={c.muted}
          accessibilityLabel="Search messages"
          style={{ color: c.text, flex: 1, fontFamily: fonts.regular, fontSize: 13 }}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          onSubmitEditing={() => onSearch(search)}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search message library"
          onPress={() => onSearch(search)}
          style={{ padding: 6 }}
        >
          <Icon name="arrow-forward" size={20} color={c.accent} />
        </Pressable>
      </View>
      {latest ? (
        <View
          style={{
            minHeight: tablet ? 380 : 360,
            borderRadius: 23,
            overflow: 'hidden',
            backgroundColor: '#28332b',
            marginTop: 24,
          }}
        >
          <Image
            source={require('../../assets/david-oyedepo.jpg')}
            accessibilityLabel="Bishop David Oyedepo, overseer of Living Faith Church"
            resizeMode="cover"
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              width: '100%',
              height: tablet ? '100%' : 220,
            }}
          />
          <LinearGradient
            colors={
              tablet ? ['#18251ff5', '#18251fc9', '#18251f33'] : ['#18251f00', '#18251f', '#18251f']
            }
            locations={tablet ? [0, 0.5, 1] : [0, 0.4, 1]}
            start={{ x: 0, y: tablet ? 0.5 : 0 }}
            end={{ x: tablet ? 1 : 0, y: tablet ? 0.5 : 1 }}
            style={{ position: 'absolute', inset: 0 }}
          />
          <View
            style={{
              padding: tablet ? 32 : 23,
              paddingTop: tablet ? 32 : 210,
              paddingBottom: 70,
              maxWidth: tablet ? 540 : undefined,
            }}
          >
            <Txt
              style={{ color: '#dbe2c8', fontSize: 9, letterSpacing: 1.7, fontFamily: fonts.bold }}
            >
              ROOTED IN THE WORD
            </Txt>
            <Txt
              style={{
                color: '#fff',
                fontFamily: fonts.heavy,
                fontSize: tablet ? 36 : 27,
                lineHeight: tablet ? 45 : 35,
                letterSpacing: -1,
                marginTop: 19,
              }}
            >
              Building faith.
              {'\n'}Transforming lives.
            </Txt>
            <Txt style={{ color: '#edf1e8', fontSize: 13, lineHeight: 21, marginTop: 12 }}>
              Grow in the Word with the Living Faith Church family.
            </Txt>
            <Txt style={{ color: '#d4dbd0', fontSize: 11, marginTop: 12 }}>
              Bishop David Oyedepo
            </Txt>
            <Txt style={{ color: '#d4dbd0', fontSize: 10, marginBottom: 20 }}>
              Overseer, Living Faith Church Worldwide
            </Txt>
            <Txt style={{ color: '#fff', fontSize: 12, fontFamily: fonts.bold }}>
              Latest: {latest.title}
            </Txt>
            <Txt style={{ color: '#d4dbd0', fontSize: 11, marginBottom: 16 }}>
              {latest.pastor} · {latest.service}
            </Txt>
            <Pressable
              onPress={() => onPlay(latest)}
              accessibilityRole="button"
              style={{
                flexDirection: 'row',
                gap: 8,
                alignItems: 'center',
                alignSelf: 'flex-start',
                backgroundColor: '#edf1d8',
                paddingHorizontal: 18,
                paddingVertical: 11,
                borderRadius: 25,
              }}
            >
              <Icon name="play" size={14} color="#28342c" />
              <Txt style={{ color: '#28342c', fontSize: 12, fontFamily: fonts.bold }}>
                Listen to latest message
              </Txt>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save latest message"
            accessibilityState={{ selected: saved.includes(latest.id) }}
            onPress={() => onSave(latest.id)}
            style={{
              position: 'absolute',
              bottom: 18,
              right: 17,
              padding: 10,
              backgroundColor: '#ffffff25',
              borderRadius: 22,
            }}
          >
            <Icon
              name={saved.includes(latest.id) ? 'heart' : 'heart-outline'}
              color="#fff"
              size={19}
            />
          </Pressable>
        </View>
      ) : (
        <Txt style={{ color: c.muted, marginTop: 24 }}>
          No messages available. Pull down to refresh.
        </Txt>
      )}
      <Section title="Fresh from the pulpit" action="See all" onPress={() => onTab('Messages')} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {messages.slice(0, columns === 2 ? 4 : 3).map((m) => (
          <View key={m.id} style={{ width: columns === 2 ? '48%' : '100%', flexGrow: 0 }}>
            <MessageRow message={m} onPress={() => onPlay(m)} />
          </View>
        ))}
      </View>
      <View
        style={{
          padding: 23,
          borderRadius: 19,
          borderWidth: 1,
          borderColor: c.line,
          backgroundColor: c.surface,
          marginTop: 25,
        }}
      >
        <Eyebrow>PAUSE & REFLECT</Eyebrow>
        <Txt
          style={{
            fontFamily: undefined,
            fontStyle: 'italic',
            fontSize: 22,
            lineHeight: 33,
            marginVertical: 17,
          }}
        >
          Faith cometh by hearing, and hearing by the word of God.
        </Txt>
        <Txt style={{ fontSize: 10, color: c.muted, letterSpacing: 1.2 }}>ROMANS 10:17 · KJV</Txt>
      </View>
    </>
  );
}

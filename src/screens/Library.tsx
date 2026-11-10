import { Pressable, TextInput, View } from 'react-native';
import { useState } from 'react';
import { Eyebrow, Icon, Txt, useTheme } from '../components/UI';
import { MessageRow } from '../components/MessageRow';
import { fonts } from '../theme';
import { Message, Service } from '../types';
export function Library({
  messages,
  onPlay,
  savedOnly = false,
  query,
  setQuery,
}: {
  messages: Message[];
  onPlay: (m: Message) => void;
  savedOnly?: boolean;
  query: string;
  setQuery: (q: string) => void;
}) {
  const c = useTheme();
  const [filter, setFilter] = useState<Service>('All');
  const visible = messages.filter(
    (m) =>
      (filter === 'All' || m.service === filter) &&
      (m.title + ' ' + m.pastor).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <View style={{ marginVertical: 20 }}>
        <Eyebrow>{savedOnly ? 'KEEP THE WORD CLOSE' : 'LISTEN. REFLECT. GROW.'}</Eyebrow>
        <Txt style={{ fontSize: 29, lineHeight: 39, fontFamily: fonts.heavy, marginTop: 8 }}>
          {savedOnly ? 'Your saved messages' : 'Message library'}
        </Txt>
        <Txt style={{ fontSize: 13, color: c.muted, marginTop: 8 }}>
          {savedOnly
            ? 'Return to the messages that speak to you.'
            : 'Find a word for the season you’re in.'}
        </Txt>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          padding: 15,
          borderWidth: 1,
          borderColor: c.line,
          backgroundColor: c.surface,
          borderRadius: 15,
        }}
      >
        <Icon name="search-outline" color={c.muted} size={20} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          placeholder="Search title or pastor"
          placeholderTextColor={c.muted}
          accessibilityLabel="Search title or pastor"
          style={{ color: c.text, flex: 1, fontFamily: fonts.regular, fontSize: 14 }}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: 9, marginVertical: 20 }}>
        {(['All', 'Sunday', 'Midweek'] as Service[]).map((f) => (
          <Pressable
            key={f}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === f }}
            onPress={() => setFilter(f)}
            style={{
              paddingHorizontal: 18,
              paddingVertical: 11,
              borderRadius: 25,
              borderWidth: 1,
              borderColor: filter === f ? c.accent : c.line,
              backgroundColor: filter === f ? c.accent : c.surface,
            }}
          >
            <Txt style={{ fontSize: 12, color: filter === f ? '#fff' : c.text }}>{f}</Txt>
          </Pressable>
        ))}
      </View>
      {visible.map((m) => (
        <MessageRow key={m.id} message={m} onPress={() => onPlay(m)} />
      ))}
      {!visible.length && (
        <View style={{ padding: 36, alignItems: 'center', gap: 16 }}>
          <Icon name={savedOnly ? 'heart-outline' : 'search-outline'} color={c.muted} size={30} />
          <Txt style={{ textAlign: 'center', color: c.muted }}>
            {savedOnly && !messages.length
              ? 'Tap the heart on a message to save it here.'
              : 'No messages found. Try a different search or service.'}
          </Txt>
        </View>
      )}
    </>
  );
}

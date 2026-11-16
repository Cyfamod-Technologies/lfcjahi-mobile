import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useState } from 'react';
import { Eyebrow, Icon, Txt, useTheme } from '../components/UI';
import { MessageRow } from '../components/MessageRow';
import { fonts } from '../theme';
import { Message } from '../types';
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
  const [filter, setFilter] = useState('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [limit, setLimit] = useState(30);
  const filters = ['All', ...new Set(messages.map((m) => m.service))];
  const visible = messages.filter(
    (m) =>
      (filter === 'All' || m.service === filter) &&
      (m.title + ' ' + m.pastor + ' ' + m.service).toLowerCase().includes(query.toLowerCase()),
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
          onChangeText={(value) => {
            setQuery(value);
            setLimit(30);
          }}
          autoCapitalize="none"
          placeholder="Search title or pastor"
          placeholderTextColor={c.muted}
          accessibilityLabel="Search title or pastor"
          style={{ color: c.text, flex: 1, fontFamily: fonts.regular, fontSize: 14 }}
        />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 14 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Filter by service: ${filter === 'All' ? 'All services' : filter}`}
          accessibilityState={{ expanded: filterOpen }}
          onPress={() => setFilterOpen(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 14,
            minHeight: 44,
            borderRadius: 12,
            backgroundColor: c.surface,
            borderWidth: 1,
            borderColor: c.line,
            flexShrink: 1,
          }}
        >
          <Icon name="options-outline" size={17} color={c.accent} />
          <Txt numberOfLines={1} style={{ fontSize: 12, flexShrink: 1 }}>
            {filter === 'All' ? 'All services' : filter}
          </Txt>
          <Icon name="chevron-down" size={15} color={c.muted} />
        </Pressable>
        <Txt style={{ color: c.muted, fontSize: 11, marginLeft: 'auto' }}>
          {visible.length} messages
        </Txt>
      </View>
      <Modal
        visible={filterOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterOpen(false)}
      >
        <View
          style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#00000066' }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss service filter"
            onPress={() => setFilterOpen(false)}
            style={{ position: 'absolute', inset: 0 }}
          />
          <View
            accessibilityViewIsModal
            style={{
              width: '100%',
              maxWidth: 440,
              maxHeight: '75%',
              alignSelf: 'center',
              backgroundColor: c.background,
              borderRadius: 20,
              padding: 20,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
            >
              <Txt style={{ fontFamily: fonts.bold, fontSize: 18 }}>Choose service</Txt>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close service filter"
                onPress={() => setFilterOpen(false)}
                style={{ padding: 12 }}
              >
                <Icon name="close" size={20} />
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              {filters.map((f) => (
                <Pressable
                  key={f}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: filter === f }}
                  onPress={() => {
                    setFilter(f);
                    setLimit(30);
                    setFilterOpen(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    minHeight: 48,
                    paddingVertical: 13,
                    borderBottomWidth: 1,
                    borderColor: c.line,
                  }}
                >
                  <Txt style={{ flex: 1, fontSize: 13, color: filter === f ? c.accent : c.text }}>
                    {f === 'All' ? 'All services' : f}
                  </Txt>
                  {filter === f && <Icon name="checkmark" size={19} color={c.accent} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      {visible.slice(0, limit).map((m) => (
        <MessageRow key={m.id} message={m} onPress={() => onPlay(m)} />
      ))}
      {visible.length > limit && (
        <Pressable
          accessibilityRole="button"
          onPress={() => setLimit((n) => n + 30)}
          style={{ padding: 20, alignItems: 'center' }}
        >
          <Txt style={{ color: c.accent }}>Load more ({visible.length - limit} remaining)</Txt>
        </Pressable>
      )}
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

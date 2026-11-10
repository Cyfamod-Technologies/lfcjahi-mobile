import { Pressable, View } from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Eyebrow, Icon, Section, Txt, useTheme } from '../components/UI';
import { fonts } from '../theme';
import { dateLabel, openUrl, shareText } from '../lib';
import { PrayerGuide } from '../types';
import resources from '../data/resources.json';
export function Prayers({
  guides,
  guide,
  onGuide,
  prayed,
  onToggle,
  onReset,
}: {
  guides: PrayerGuide[];
  guide: PrayerGuide | null;
  onGuide: (g: PrayerGuide | null) => void;
  prayed: string[];
  onToggle: (key: string) => void;
  onReset: (g: PrayerGuide) => void;
}) {
  const c = useTheme();
  const [expanded, setExpanded] = useState<string[]>([]);
  if (!guide)
    return (
      <>
        <View style={{ marginVertical: 20 }}>
          <Eyebrow>A PEOPLE OF PRAYER</Eyebrow>
          <Txt style={{ fontSize: 30, lineHeight: 40, fontFamily: fonts.heavy, marginTop: 8 }}>
            Make room for prayer<Txt style={{ fontSize: 30, color: c.accent }}>.</Txt>
          </Txt>
          <Txt style={{ color: c.muted, fontSize: 13, marginTop: 8 }}>
            One heart. One voice. Standing on His Word.
          </Txt>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${guides[0].title} for ${dateLabel(guides[0].date)}`}
          onPress={() => onGuide(guides[0])}
        >
          <LinearGradient colors={['#302a49', '#1b1d35']} style={{ padding: 25, borderRadius: 23 }}>
            <Txt style={{ color: '#c4b4e4', fontSize: 10, letterSpacing: 1.6 }}>
              NIGHT PRAYER GUIDE
            </Txt>
            <View style={{ position: 'absolute', right: 25, top: 68 }}>
              <Icon name="moon-outline" size={55} color="#bda6df" />
            </View>
            <Txt
              style={{
                fontSize: 31,
                lineHeight: 38,
                color: '#f6f0fc',
                fontFamily: fonts.heavy,
                marginVertical: 23,
              }}
            >
              Let your faith{'\n'}find its voice.
            </Txt>
            <Txt style={{ fontSize: 13, color: '#d0c5e0' }}>{dateLabel(guides[0].date, true)}</Txt>
            <Txt style={{ fontSize: 11, color: '#b1a4c7', marginTop: 8 }}>
              {guides[0].intercessions.length} intercessions · Scripture included →
            </Txt>
          </LinearGradient>
        </Pressable>
        <Section title="Your prayer guides" />
        {guides.map((g) => (
          <Pressable
            key={g.id}
            accessibilityRole="button"
            onPress={() => onGuide(g)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              padding: 18,
              borderRadius: 18,
              backgroundColor: c.surface,
              borderWidth: 1,
              borderColor: c.line,
            }}
          >
            <View style={{ padding: 12, backgroundColor: c.purple + '15', borderRadius: 12 }}>
              <Txt style={{ fontFamily: fonts.heavy, fontSize: 22, color: c.purple }}>
                {g.date.slice(8, 10)}
              </Txt>
              <Txt style={{ fontSize: 10, letterSpacing: 1, color: c.purple }}>
                {new Date(g.date + 'T12:00:00Z')
                  .toLocaleDateString('en-GB', { month: 'short' })
                  .toUpperCase()}
              </Txt>
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <Txt style={{ fontFamily: fonts.bold }}>{g.title}</Txt>
              <Txt style={{ fontSize: 11, color: c.muted }}>
                {dateLabel(g.date)} · {g.intercessions.length} intercessions
              </Txt>
            </View>
            <Icon name="arrow-forward" size={18} color={c.muted} />
          </Pressable>
        ))}
        <Txt style={{ color: c.muted, fontSize: 13, lineHeight: 23, marginVertical: 25 }}>
          Let the Word lead your prayer. Open a guide and pray at your own pace.
        </Txt>
        <Pressable accessibilityRole="link" onPress={() => openUrl(resources.prayerResources)}>
          <Txt style={{ color: c.accent, fontSize: 13 }}>More prayer resources →</Txt>
        </Pressable>
      </>
    );
  const count = guide.intercessions.filter((p) => prayed.includes(guide.id + ':' + p.id)).length;
  const share = () =>
    shareText(
      'Night prayers',
      `Night Prayers for ${dateLabel(guide.date, true)} 🔥\n\n` +
        guide.intercessions
          .map(
            (p, i) => `🙏 Intercession ${i + 1}: ${p.prayer}\n🔥 – ${p.reference}\n${p.scripture}`,
          )
          .join('\n\n') +
        '\n\nJesus is Lord 🙌🏽',
    );
  return (
    <>
      <Pressable
        onPress={() => onGuide(null)}
        accessibilityRole="button"
        style={{ paddingVertical: 15 }}
      >
        <Txt style={{ fontSize: 12, color: c.muted }}>← All prayer guides</Txt>
      </Pressable>
      <Eyebrow>NIGHT PRAYERS</Eyebrow>
      <Txt style={{ fontSize: 29, lineHeight: 39, fontFamily: fonts.heavy, marginVertical: 12 }}>
        {dateLabel(guide.date, true)}
      </Txt>
      <Txt style={{ color: c.muted, fontSize: 13 }}>Take a quiet moment. Pray with faith.</Txt>
      <Card style={{ marginVertical: 24, backgroundColor: c.surface }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 13 }}>
          <Txt style={{ fontSize: 12 }}>
            {count} of {guide.intercessions.length} prayed
          </Txt>
          <Pressable onPress={() => onReset(guide)} accessibilityRole="button">
            <Txt style={{ fontSize: 12, color: c.muted }}>Reset</Txt>
          </Pressable>
        </View>
        <View style={{ height: 4, backgroundColor: c.line, borderRadius: 5 }}>
          <View
            style={{
              height: 4,
              width: `${(count / guide.intercessions.length) * 100}%`,
              backgroundColor: c.purple,
              borderRadius: 5,
            }}
          />
        </View>
      </Card>
      {guide.intercessions.map((p, i) => {
        const key = guide.id + ':' + p.id,
          done = prayed.includes(key),
          open = expanded.includes(key);
        return (
          <Card key={key} style={{ marginBottom: 16, borderColor: done ? c.green : c.line }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Txt
                style={{ fontSize: 10, color: c.purple, fontFamily: fonts.bold, letterSpacing: 1 }}
              >
                INTERCESSION {i + 1}
              </Txt>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: done }}
                accessibilityLabel={`Intercession ${i + 1} prayed`}
                onPress={() => onToggle(key)}
                style={{ padding: 9, borderWidth: 1, borderColor: c.line, borderRadius: 20 }}
              >
                <Txt style={{ fontSize: 10, color: done ? c.green : c.muted, lineHeight: 16 }}>
                  {done ? '✓ Prayed' : 'Mark as prayed'}
                </Txt>
              </Pressable>
            </View>
            <Txt style={{ fontSize: 16, lineHeight: 29, marginVertical: 19 }}>{p.prayer}</Txt>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              accessibilityLabel={`Read ${p.reference}`}
              onPress={() =>
                setExpanded((prev) => (open ? prev.filter((x) => x !== key) : [...prev, key]))
              }
              style={{
                borderTopWidth: 1,
                borderColor: c.line,
                paddingTop: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Icon name="book-outline" color={c.purple} size={16} />
              <Txt style={{ fontSize: 12, color: c.purple, flex: 1 }}>{p.reference}</Txt>
              <Txt style={{ fontSize: 11, color: c.muted }}>
                {open ? 'Hide −' : 'Read scripture +'}
              </Txt>
            </Pressable>
            {open && (
              <Txt style={{ fontSize: 16, lineHeight: 29, color: c.muted, marginTop: 16 }}>
                {p.scripture}
              </Txt>
            )}
          </Card>
        );
      })}
      <View style={{ alignItems: 'center', paddingVertical: 25, gap: 13 }}>
        <Txt style={{ color: c.purple, fontSize: 26 }}>✦</Txt>
        <Txt style={{ fontFamily: fonts.heavy, fontSize: 27, lineHeight: 35 }}>Jesus is Lord.</Txt>
        <Txt style={{ fontSize: 12, color: c.muted }}>Amen. Let it be according to His Word.</Txt>
        <Pressable
          accessibilityRole="button"
          onPress={share}
          style={{ padding: 15, backgroundColor: c.surface, borderRadius: 25, marginTop: 8 }}
        >
          <Txt style={{ fontSize: 13 }}>↗ Share this prayer guide</Txt>
        </Pressable>
      </View>
    </>
  );
}

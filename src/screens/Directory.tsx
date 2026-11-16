import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import type { District } from '../types';
import { Card, Txt, useTheme } from '../components/UI';
import { fonts } from '../theme';
import { openUrl } from '../lib';

export function Directory({ districts }: { districts: District[] }) {
  const c = useTheme();
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const search = query.trim().toLowerCase();
  const visible = districts.filter((d) => JSON.stringify(d).toLowerCase().includes(search));
  return (
    <View style={{ marginVertical: 20, gap: 14 }}>
      <Txt style={{ fontFamily: fonts.heavy, fontSize: 23 }}>Find your fellowship</Txt>
      <Txt style={{ color: c.muted, fontSize: 13 }}>Explore districts and home cells near you.</Txt>
      <TextInput
        value={query}
        onChangeText={setQuery}
        accessibilityLabel="Search districts and home cells"
        placeholder="Search area, cell or minister"
        placeholderTextColor={c.muted}
        style={{
          color: c.text,
          borderColor: c.line,
          borderWidth: 1,
          borderRadius: 14,
          padding: 15,
          fontFamily: fonts.regular,
        }}
      />
      {!visible.length && (
        <Txt style={{ color: c.muted, fontSize: 13 }}>
          {districts.length
            ? 'No fellowship matches your search.'
            : 'No districts are available yet. Pull down to refresh.'}
        </Txt>
      )}
      {visible.map((d) => (
        <Card key={d.id}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: expanded === d.id || !!search }}
            onPress={() => setExpanded(expanded === d.id ? null : d.id)}
          >
            <Txt style={{ fontFamily: fonts.bold, fontSize: 17 }}>{d.name}</Txt>
            <Txt style={{ color: c.muted, fontSize: 12, marginTop: 7 }}>{d.coverageAreas}</Txt>
            <Txt style={{ color: c.accent, fontSize: 12, marginTop: 12 }}>
              {expanded === d.id ? 'Hide details −' : 'View fellowship details +'}
            </Txt>
          </Pressable>
          {(expanded === d.id || !!search) && (
            <View style={{ gap: 12, marginTop: 18 }}>
              {[
                ['Home cell pastors', d.homeCellPastors.join(', ')],
                ['Home cell minister', d.homeCellMinister],
                ['Outreach pastor', d.outreachPastor],
                ['Outreach minister', d.outreachMinister],
                ['Outreach location', d.outreachLocation],
              ]
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <Txt key={label} style={{ color: c.muted, fontSize: 13 }}>
                    {label}: {value}
                  </Txt>
                ))}
              {d.zones.map((z) => (
                <View
                  key={z.id}
                  style={{ gap: 10, borderTopWidth: 1, borderColor: c.line, paddingTop: 13 }}
                >
                  <Txt style={{ fontFamily: fonts.bold }}>{z.name}</Txt>
                  {!!z.zoneMinister && (
                    <Txt style={{ color: c.muted, fontSize: 12 }}>
                      Zone minister: {z.zoneMinister}
                    </Txt>
                  )}
                  {z.cells.map((cell) => (
                    <View key={cell.id} style={{ gap: 6, paddingVertical: 8 }}>
                      <Txt style={{ fontFamily: fonts.bold, fontSize: 13 }}>{cell.name}</Txt>
                      {!!cell.address && (
                        <Pressable
                          accessibilityRole="link"
                          accessibilityLabel={`Directions to ${cell.name}`}
                          onPress={() =>
                            openUrl(
                              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cell.address + ', Abuja, Nigeria')}`,
                            )
                          }
                        >
                          <Txt style={{ color: c.accent, fontSize: 12 }}>{cell.address} ↗</Txt>
                        </Pressable>
                      )}
                      {!!cell.minister && (
                        <Txt style={{ color: c.muted, fontSize: 12 }}>{cell.minister}</Txt>
                      )}
                      {!!cell.phone && (
                        <Pressable
                          accessibilityRole="link"
                          accessibilityLabel={`Call ${cell.minister || cell.name}`}
                          onPress={() => openUrl(`tel:${cell.phone.replace(/[^+\d]/g, '')}`)}
                        >
                          <Txt style={{ color: c.accent, fontSize: 13 }}>{cell.phone}</Txt>
                        </Pressable>
                      )}
                    </View>
                  ))}
                </View>
              ))}
              {!d.zones.length && (
                <Txt style={{ color: c.muted, fontSize: 12 }}>
                  Home cell details will appear here when available.
                </Txt>
              )}
            </View>
          )}
        </Card>
      ))}
    </View>
  );
}

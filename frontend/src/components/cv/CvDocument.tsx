import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { WorkExperience, CvLanguage } from '@/types/models';

// ─── Register Roboto (Cyrillic + Latin) ───────────────────────────────────────

const BASE = typeof window !== 'undefined' ? window.location.origin : '';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: `${BASE}/fonts/Roboto-Regular.ttf`, fontWeight: 'normal', fontStyle: 'normal' },
    { src: `${BASE}/fonts/Roboto-Bold.ttf`,    fontWeight: 'bold',   fontStyle: 'normal' },
    { src: `${BASE}/fonts/Roboto-Italic.ttf`,  fontWeight: 'normal', fontStyle: 'italic' },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

// ─── Palette ──────────────────────────────────────────────────────────────────

const ACCENT  = '#2563eb';
const TEXT    = '#111827';
const MUTED   = '#6b7280';
const BORDER  = '#e5e7eb';
const PILL_BG = '#eff6ff';
const PILL_BD = '#bfdbfe';
const PILL_TX = '#1d4ed8';

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 10,
    color: TEXT,
    paddingTop: 44,
    paddingBottom: 44,
    paddingHorizontal: 50,
    lineHeight: 1.45,
    backgroundColor: '#ffffff',
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: ACCENT,
  },
  name: {
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    fontSize: 24,
    letterSpacing: 0.3,
    color: TEXT,
    marginBottom: 8,
  },
  // Contact row: each item is just a Text with marginRight — avoids gap quirks
  contactLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  contactItem: {
    fontFamily: 'Roboto',
    fontSize: 9,
    color: MUTED,
    marginRight: 4,
  },
  contactSep: {
    fontFamily: 'Roboto',
    fontSize: 9,
    color: '#d1d5db',
    marginRight: 4,
  },

  // ── Section ─────────────────────────────────────────────────────────────
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    fontSize: 8,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: ACCENT,
    marginBottom: 7,
    paddingBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },

  // ── Summary ─────────────────────────────────────────────────────────────
  summaryText: {
    fontFamily: 'Roboto',
    fontSize: 9.5,
    color: '#374151',
    lineHeight: 1.7,
  },

  // ── Experience ──────────────────────────────────────────────────────────
  expItem: {
    marginBottom: 10,
  },
  expTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  expPosition: {
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    fontSize: 10.5,
    color: TEXT,
    flex: 1,
    paddingRight: 8,
  },
  expDates: {
    fontFamily: 'Roboto',
    fontSize: 8.5,
    color: MUTED,
  },
  expCompany: {
    fontFamily: 'Roboto',
    fontStyle: 'italic',
    fontSize: 9,
    color: '#4b5563',
    marginBottom: 3,
  },
  expDesc: {
    fontFamily: 'Roboto',
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.55,
  },

  // ── Education ───────────────────────────────────────────────────────────
  eduRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eduLeft: { flex: 1, paddingRight: 8 },
  eduName: {
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    fontSize: 10.5,
    color: TEXT,
    marginBottom: 2,
  },
  eduMajor: {
    fontFamily: 'Roboto',
    fontStyle: 'italic',
    fontSize: 9,
    color: '#4b5563',
  },
  eduYear: {
    fontFamily: 'Roboto',
    fontSize: 8.5,
    color: MUTED,
  },

  // ── Skills ──────────────────────────────────────────────────────────────
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skill: {
    fontFamily: 'Roboto',
    fontSize: 8.5,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 8,
    paddingRight: 8,
    borderWidth: 0.75,
    borderColor: PILL_BD,
    borderRadius: 3,
    color: PILL_TX,
    backgroundColor: PILL_BG,
    marginRight: 5,
    marginBottom: 5,
  },

  // ── Languages ───────────────────────────────────────────────────────────
  langWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 4,
  },
  langName: {
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    fontSize: 9.5,
    color: TEXT,
  },
  langSep: {
    fontFamily: 'Roboto',
    fontSize: 9.5,
    color: '#9ca3af',
    marginLeft: 4,
    marginRight: 4,
  },
  langLevel: {
    fontFamily: 'Roboto',
    fontSize: 9.5,
    color: MUTED,
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtDate(v: string): string {
  if (!v) return '';
  const [year, month] = v.split('-');
  return `${MONTHS[parseInt(month, 10) - 1]} ${year}`.trim();
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CvData {
  name: string;
  email: string;
  phone?: string;
  summary?: string;
  skills: string[];
  experience: WorkExperience[];
  education: { university?: string; major?: string; graduationYear?: number };
  languages: CvLanguage[];
}

// ─── Document ────────────────────────────────────────────────────────────────

export function CvDocument({ data }: { data: CvData }) {
  const hasExp  = data.experience.length > 0;
  const hasEdu  = !!data.education.university;
  const hasSk   = data.skills.length > 0;
  const hasLang = data.languages.length > 0;
  const hasSumm = !!data.summary?.trim();

  return (
    <Document title={`CV — ${data.name}`} author={data.name} creator="Work&Study">
      <Page size="A4" style={s.page}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <View style={s.header}>
          <Text style={s.name}>{data.name}</Text>
          <View style={s.contactLine}>
            <Text style={s.contactItem}>{data.email}</Text>
            {data.phone && (
              <>
                <Text style={s.contactSep}>|</Text>
                <Text style={s.contactItem}>{data.phone}</Text>
              </>
            )}
          </View>
        </View>

        {/* ── Profile ────────────────────────────────────────────── */}
        {hasSumm && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Profile</Text>
            <Text style={s.summaryText}>{data.summary}</Text>
          </View>
        )}

        {/* ── Experience ─────────────────────────────────────────── */}
        {hasExp && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Experience</Text>
            {data.experience.map((exp) => (
              <View key={exp.id} style={s.expItem}>
                <View style={s.expTopRow}>
                  <Text style={s.expPosition}>{exp.position}</Text>
                  <Text style={s.expDates}>
                    {fmtDate(exp.startDate)} – {exp.current ? 'Present' : fmtDate(exp.endDate)}
                  </Text>
                </View>
                <Text style={s.expCompany}>{exp.company}</Text>
                {exp.description.trim() ? (
                  <Text style={s.expDesc}>{exp.description.trim()}</Text>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* ── Education ──────────────────────────────────────────── */}
        {hasEdu && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Education</Text>
            <View style={s.eduRow}>
              <View style={s.eduLeft}>
                <Text style={s.eduName}>{data.education.university}</Text>
                {data.education.major ? (
                  <Text style={s.eduMajor}>{data.education.major}</Text>
                ) : null}
              </View>
              {data.education.graduationYear ? (
                <Text style={s.eduYear}>Expected {data.education.graduationYear}</Text>
              ) : null}
            </View>
          </View>
        )}

        {/* ── Skills ─────────────────────────────────────────────── */}
        {hasSk && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Skills</Text>
            <View style={s.skillsWrap}>
              {data.skills.map((sk) => (
                <Text key={sk} style={s.skill}>{sk}</Text>
              ))}
            </View>
          </View>
        )}

        {/* ── Languages ──────────────────────────────────────────── */}
        {hasLang && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Languages</Text>
            <View style={s.langWrap}>
              {data.languages.map((l) => (
                <View key={l.id} style={s.langItem}>
                  <Text style={s.langName}>{l.name}</Text>
                  <Text style={s.langSep}>—</Text>
                  <Text style={s.langLevel}>{l.level}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      </Page>
    </Document>
  );
}

import { h } from 'vue'
import type { Notenkuerzel, EnmNote } from '../types/enm'
import { ZUWEISUNG_OPTIONEN, getZuweisungTitel } from './zuweisungen'

type LupeSubject = {
  fachKuerzel: string
  lgId: number
  lehrerText: string
  note: Notenkuerzel | null
  fachName: string
  istFld?: boolean
  zuweisung?: string | null
  zuweisungGeaendert?: boolean
  mahnung?: { state: 'markiert' | 'gemahnt'; kurz: string; titel: string } | null
  tone: {
    frame: string
    note: string
    label: string
    text: string
  }
}

export function createLupeCardsVNodes(params: {
  selectedSchuelerId: number
  lupeSubjects: LupeSubject[]
  notenOptions: EnmNote[]
  getNoteDisplay: (note: Notenkuerzel | null) => string
  onUpdateNote: (schuelerId: number, lgId: number, note: Notenkuerzel | null) => void
  zuweisungenVerfuegbar?: boolean
  onUpdateZuweisung?: (schuelerId: number, lgId: number, zuweisung: string | null) => void
}): any[] {
  const {
    selectedSchuelerId,
    lupeSubjects,
    notenOptions,
    getNoteDisplay,
    onUpdateNote,
    zuweisungenVerfuegbar = false,
    onUpdateZuweisung,
  } = params

  const renderZuweisung = (subject: LupeSubject) => h('label', {
    class: `lupe-fach-zuweisung ${subject.istFld ? 'is-fld' : ''}`.trim(),
    title: 'Kursart im nächsten Kursabschnitt',
  }, [
    h('span', { class: 'lupe-fach-zuweisung-label' }, 'Zuweisung'),
    h('select', {
      class: `lupe-zuweisung-select ${subject.zuweisungGeaendert ? 'changed' : ''}`.trim(),
      value: subject.zuweisung ?? '',
      title: getZuweisungTitel(subject.zuweisung),
      'aria-label': `Zuweisung ${subject.fachName}`,
      onChange: (event: Event) => {
        const wert = (event.target as HTMLSelectElement).value
        onUpdateZuweisung?.(selectedSchuelerId, subject.lgId, wert || null)
      },
    }, [
      h('option', { value: '' }, '–'),
      ...ZUWEISUNG_OPTIONEN.map(o => h('option', { value: o.wert, title: o.label }, o.wert)),
      ...(subject.zuweisung && !ZUWEISUNG_OPTIONEN.some(o => o.wert === subject.zuweisung)
        ? [h('option', { value: subject.zuweisung }, subject.zuweisung)]
        : []),
    ]),
  ])

  return lupeSubjects.map(subject => h('div', { class: `lupe-fach ${subject.tone.frame}` }, [
    h('div', { class: 'lupe-fach-k' }, subject.fachKuerzel),
    h('div', { class: 'lupe-fach-fn' }, subject.fachName),
    h('select', {
      class: `lupe-fach-note-select ${subject.tone.note}`,
      value: subject.note ?? '',
      onChange: (event: Event) => {
        const newNote = (event.target as HTMLSelectElement).value as Notenkuerzel | ''
        onUpdateNote(selectedSchuelerId, subject.lgId, newNote || null)
      },
    }, [
      h('option', { value: '' }, '–'),
      ...notenOptions.map((item: EnmNote) => h('option', { value: item.kuerzel }, getNoteDisplay(item.kuerzel))),
    ]),
    subject.mahnung
      ? h('span', { class: `lupe-mahnung lupe-mahnung-card is-${subject.mahnung.state}`, title: subject.mahnung.titel }, subject.mahnung.kurz)
      : null,
    h('div', { class: `lupe-fach-label ${subject.tone.label}` }, subject.tone.text),
    h('div', { class: 'lupe-fach-lehrer' }, subject.lehrerText),
    zuweisungenVerfuegbar ? renderZuweisung(subject) : null,
  ]))
}

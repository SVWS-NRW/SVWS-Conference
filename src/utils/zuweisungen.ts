/**
 * Zuweisungen: Kursart eines Fachs im nächsten Kursabschnitt (Fachleistungsdifferenzierung,
 * Förderunterricht, Ergänzungsstunden). Gemeinsame Optionsliste für Tabellen- und Kachelansicht
 * der Schülerlupe.
 */
export const ZUWEISUNG_OPTIONEN: ReadonlyArray<{ wert: string; label: string }> = [
  { wert: 'E', label: 'E-Kurs' },
  { wert: 'G', label: 'G-Kurs' },
  { wert: 'FFU', label: 'Fachbezogener Förderunterricht' },
  { wert: 'FUF', label: 'Fachunabhängiger Förderunterricht' },
  { wert: 'EGS1', label: 'Ergänzungsstunden' },
  { wert: 'EGSN', label: 'Ergänzungsstunden mit Benotung' },
]

export function getZuweisungTitel(wert: string | null | undefined): string {
  if (!wert) return 'Keine Zuweisung für den nächsten Kursabschnitt'
  return ZUWEISUNG_OPTIONEN.find(o => o.wert === wert)?.label ?? wert
}

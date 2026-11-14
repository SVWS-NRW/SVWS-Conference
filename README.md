# SVWS Konferenzübersicht

Digitale Notenkonferenz-Übersicht für Klassen und Lerngruppen.  
Liest den ENM-Export des SVWS-Servers (`.gz`-Datei) und stellt alle Noten übersichtlich dar.

Zum Benutzerhandbuch geht es hier:
https://fpfotenhauer.github.io/SVWS-Conference/

## Voraussetzungen

- Node.js 20 oder neuer
- npm 10 oder neuer

## Entwicklung

```bash
npm install
npm run dev
```

Die App läuft dann unter `http://localhost:5173`.

Der lokale Vite-Server stellt nur in der Entwicklung einen Hilfs-Proxy unter `/api/svws/*` bereit.
Dieser Proxy ist auf den lokalen Dev-Kontext beschränkt und übernimmt Zugangsdaten ausschließlich über den `Authorization`-Header, nicht über den Request-Body.

## Build für den Produktiveinsatz

```bash
npm run build
```

Der fertige Build liegt im Ordner `dist/`. Die Dateien darin können auf jeden Webserver kopiert werden — oder direkt per Doppelklick auf `dist/index.html` geöffnet werden (kein Server nötig).

Hinweis: Der Standard-Build ist bewusst offline-fähig erzeugt, damit das Öffnen per `file://` funktioniert.

## Release erstellen

```bash
npm run release          # Patch-Version erhöhen, z. B. 1.0.0 → 1.0.1
npm run release minor    # Minor-Version erhöhen, z. B. 1.0.0 → 1.1.0
npm run release major    # Major-Version erhöhen, z. B. 1.0.0 → 2.0.0
```

Der Ablauf (`scripts/release.mjs`):

1. Version in `package.json` erhöhen (Commit und Tag `v<version>`, lokal)
2. Bauen (`npm run release:build`): Linux-AppImage, Windows-Installer (NSIS, signiert, wenn das SafeNet-Token vorhanden ist) und Webserver-ZIP im Ordner `release/`
3. Commit und Tag pushen (nur nach erfolgreichem Build; bei Build-Fehler wird die Versionserhöhung zurückgenommen)
4. GitHub-Release als **Entwurf** anlegen (`npm run release:github`) und die drei Dateien hochladen

Voraussetzungen: Arbeitsverzeichnis ohne nicht committete Änderungen, Branch mit Upstream auf GitHub und angemeldete GitHub CLI (`gh auth login`). Die Release-Notes werden anschließend auf GitHub eingetragen und das Release dort veröffentlicht.

Die Artefakte heißen `SVWS-Conference-<version>.AppImage`, `SVWS-Conference-Setup-<version>.exe` und `SVWS-Conference-<version>-webserver.zip`. Nur bauen, ohne Version zu erhöhen oder hochzuladen: `npm run release:build`.

## Qualitätssicherung

```bash
npm run typecheck   # TypeScript-Typen prüfen
npm run lint        # ESLint
npm test            # Vitest Unit-Tests
npm run test:run    # Tests einmalig ausführen (ohne Watch)
```

## Datenbezug

### Online: REST-Abruf vom SVWS-Server

Die App ruft den ENM-Export per BasicAuth ab.

Verbindungsdaten in der Server-Kachel:

- SVWS-Basis-URL
- Schema
- Benutzername
- Passwort (darf leer sein)

Der Abruf erfolgt gegen einen der folgenden Endpunkte (je nach SVWS-Konfiguration):

```
GET {SVWS-Basis-URL}/db/{schema}/enm/v2/alle/gzip
GET {SVWS-Basis-URL}/db/{schema}/enm/v1/alle/gzip
GET {SVWS-Basis-URL}/api/v1/schule/{schema}/export/enm
GET {SVWS-Basis-URL}/api/v1/schule/export/enm?schema={schema}
GET {SVWS-Basis-URL}/api/v1/schule/export/enm
Accept: application/octet-stream
Authorization: Basic base64({username}:{password})
```

Hinweis zu selbstsignierten Zertifikaten:

- In der Entwicklungsumgebung (`npm run dev`) kann die Option `Zertifikat vertrauen` gesetzt werden.
- Im statischen/offline Build kann der Browser selbstsignierte Zertifikate nicht per App-Option umgehen.
- Produktiv- und Offline-Builds sprechen den SVWS-Server direkt aus dem Browser an; der Host der SPA erhält dabei keine ENM-Daten oder Credentials über relative Proxy-Endpunkte.

CORS-Konfiguration am SVWS-Server (Beispiel für nginx als Reverse Proxy):

```nginx
location /api/ {
    proxy_pass http://localhost:8443/;
    add_header 'Access-Control-Allow-Origin' 'https://ihre-konferenz-app.schule.de' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
    add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS' always;
}
```

### Offline: Manueller Datei-Upload

Wenn keine Verbindung zum SVWS-Server besteht, kann die ENM-Exportdatei  
(`enm.json.gz`) direkt in die App hochgeladen werden. Alle Daten bleiben  
im Browser — es werden keine Daten an externe Server übertragen.

## Datenschutz

- Alle Verarbeitung findet ausschließlich im Browser statt
- Keine Übertragung von Schülerdaten an Dritte
- Keine Cookies, keine persistente Speicherung
- Daten existieren nur für die Dauer der Browser-Session

## Datenformat

Die App erwartet den SVWS ENM-Export im Format `enm.json.gz`  
(gzip-komprimiertes JSON). Eine Beispieldatei mit Testdaten liegt unter `data/enm_json.gz`.

Die Typdefinitionen des vollständigen Schemas befinden sich in  
`src/types/enm.ts`.

# Sicherheitsprüfung vom 20.09.2026

Geprüfter Commit: `219173a6d2496633366b370c3f131d6a2c42b8b6` (Version 3.1.3).

## Ergebnis und Umfang

Die Prüfung ergab zwei Befunde mit hoher und zwei mit mittlerer Priorität. Der Schwerpunkt liegt auf fehlender vertrauenswürdiger Identität und Autorisierung sowie der Vertraulichkeit verdeckter Stimmen.

Geprüft wurden Anwendungs- und Repository-Code, Wartungsskripte, Hosting-/Docker-/CI-Konfiguration, einschlägige Tests und die aufgelösten Abhängigkeiten der Lockdatei. Es wurden keine produktiven Firestore-Daten gelesen oder verändert. Anwendungscode und Abhängigkeiten wurden nicht geändert.

**Grenze der Aussagekraft:** Im Repository befinden sich weder Firestore Security Rules noch deren Tests oder eine Deployment-Konfiguration dafür. `firebase.json` konfiguriert ausschließlich Hosting. Die tatsächlich eingesetzten Regeln und etwaige externe Schutzmaßnahmen sind unbekannt. Die nachgewiesenen Clientfehler sind deshalb von der nicht überprüften Ausnutzbarkeit gegenüber dem produktiven Backend zu unterscheiden. Die Dokumentation bestätigt, dass keine Benutzerauthentifizierung implementiert ist (`docs/technical-architecture.md`, Zeilen 358–370).

| ID | Priorität | Befund | Nachweis |
| --- | --- | --- | --- |
| S1 | Hoch / P1 | Spieleridentitäten und Moderatorrechte sind im Browser manipulierbar | Code und isolierte Ausführung; produktive Schreibrechte unbekannt |
| S2 | Hoch / P1 | Öffentliche Route startet Massenlöschung und ignoriert Sperren | Code und isolierte Ausführung; produktive Schreibrechte unbekannt |
| S3 | Mittel / P2 | Verdeckte Stimmen werden bereits an andere Teilnehmer ausgeliefert | Datenfluss, Repository-Ausführung und Darstellungscode |
| S4 | Mittel / P2 | Vier bekannte Advisories in indirekten Entwicklungsabhängigkeiten | Aktueller npm-Abgleich und Lockdatei-Graph |

## S1 – Manipulierbare Identität und fehlende Autorisierung

**Stellen:** `src/service/players.ts:96–101`, `src/utils/isModerator.ts:1–10`, `src/service/players.ts:42–59`, `src/repository/firebase.ts:91–125`, `src/components/Poker/GameController/GameController.tsx:146–171`.

`getCurrentPlayerId()` übernimmt `playerId` unverifiziert aus `localStorage.playerGames`. `isModerator()` vergleicht diese ID lediglich mit `createdById`. Beide Werte sind einem Teilnehmer zugänglich: Der Cache enthält bereits die Moderator-ID, und Spiel- sowie Spielerdokumente werden an den Client übertragen. Die Mitgliedschaftsprüfung kontrolliert nur, ob das referenzierte Spielerdokument existiert.

Ein Teilnehmer kann in einer Sitzung mit deaktivierter Mitgliederverwaltung seinen Cache-Eintrag so verändern, dass `playerId` dem gespeicherten `createdById` entspricht. Nach erneutem Laden behandelt die Oberfläche ihn als Moderator. Dasselbe Prinzip ermöglicht die Übernahme anderer Teilnehmeridentitäten. `updatePlayerValue()` akzeptiert eine beliebige Ziel-Spieler-ID und leitet sie direkt an Firestore weiter. Der Request enthält keine im Code authentifizierte Benutzeridentität.

Zusätzlich wird der Löschknopf in `GameController` nur von `game.isLocked` abhängig gemacht. Auch ein gewöhnlicher Teilnehmer erhält ihn, wenn `isAllowMembersToManageSession` deaktiviert ist; `canManageSession` schützt dort lediglich andere Verwaltungsaktionen. `removeGame()` kontrolliert ebenfalls nur die Sperre.

**Auswirkung:** Übernahme der Moderatoroberfläche, Manipulation fremder Stimmen/Namen und Entfernen von Teilnehmern oder Sitzungen, soweit die Firestore-Regeln die entsprechenden anonymen Requests erlauben. Die Identitätsprüfung im Client unterscheidet einen legitimen Moderator nicht von einem manipulierenden Teilnehmer.

**Isolierter Nachweis:** Originalfunktionen mit simuliertem Browser-Speicher ausgeführt: vor Änderung `isModerator === false`, nach Änderung auf `createdById` `isModerator === true`; die Mitgliedschaftsprüfung bleibt erfolgreich. Separat bestätigt, dass eine fremde Spieler-ID unverändert an den Schreibzugriff weitergereicht wird. Kein Backend-Aufruf erfolgte.

**Abhilfe:** Eine serverseitig überprüfbare Identität einführen, beispielsweise Firebase Anonymous Authentication, und Spieler/Ersteller an `request.auth.uid` binden. Security Rules müssen Eigentümerschaft, Mitgliedschaft, erlaubte Statusübergänge und änderbare Felder kontrollieren. `createdById`, Eigentümerzuordnung und administrative Sperrfelder dürfen nicht frei überschreibbar sein. Moderatoraktionen und eigene Stimmen getrennt autorisieren; globale Wartung über einen privilegierten Verwaltungszugang ausführen. UI-Prüfungen allein beheben den Befund nicht. Firebase beschreibt die Verwendung authentifizierter Identität in [Security-Rule-Bedingungen](https://firebase.google.com/docs/firestore/security/rules-conditions).

**Abnahmetest:** Zwei getrennte Auth-Identitäten im Firestore-Emulator verwenden. Cache-Manipulation, Änderungen fremder Stimmen und unberechtigtes Löschen müssen am Backend abgewiesen werden. Timer-Fallback und die ausdrücklich erlaubte Mitgliederverwaltung brauchen gesonderte Regeln für ihre legitimen Aktionen.

## S2 – Massenlöschung beim Öffnen einer öffentlichen Route

**Stellen:** `src/App.tsx:87`, `src/pages/DeleteOldGames/DeleteOldGames.tsx:9–16`, `src/repository/firebase.ts:150–175`.

Die Route `/delete-old-games` ist ohne Zugangskontrolle registriert. Bereits das Mounten der Komponente startet `deleteOldGames()`. Der Repository-Code liest sämtliche Sitzungen mit einem Alter von mehr als sechs Monaten und löscht deren Spieler sowie die Sitzungen selbst. Es gibt weder Benutzerinteraktion noch eine Prüfung auf Moderator-/Administratorrechte oder `isLocked`.

**Auswirkung:** Bei erlaubenden Firestore-Regeln kann jeder Besucher die globale Bereinigung auslösen, ohne eine Sitzungs-ID zu kennen. Ein versehentlich geöffneter Link genügt. Auch absichtlich geschützte alte Sitzungen werden vom Client zur Löschung vorgesehen. Selbst wenn eine Regel das Löschen eines gesperrten Eltern-Dokuments verhindert, müssen die zuvor ausgeführten Löschungen der Spielerdokumente separat geschützt sein.

**Isolierter Nachweis:** `removeOldGameFromStore()` mit einem alten Spiel mit `isLocked: true` und einem Teilnehmer ausgeführt. Die Aufrufe erfolgten in dieser Reihenfolge: Löschung des Spielers, Löschung des gesperrten Spiels. Die Firestore-Funktionen waren vollständig simuliert.

**Abhilfe:** Den Bereinigungsjob aus der öffentlichen SPA entfernen und als autorisierten administrativen oder zeitgesteuerten Backend-Job ausführen. Sperren vor dem Löschen berücksichtigen; direkte Client-Löschungen einschließlich Unterkollektionen durch Regeln absichern. Sitzungsalter mit vertrauenswürdigen Zeitstempeln bestimmen und Änderungen an `createdAt` einschränken. Ein bloßes Verstecken der Route reicht nicht aus.

**Abnahmetest:** Unauthentifizierte Nutzer und gewöhnliche Teilnehmer können weder alte Sitzungen global auflisten noch bereinigen. Ein gesperrtes altes Spiel bleibt einschließlich seiner Teilnehmer erhalten.

## S3 – Stimmen sind nur optisch verdeckt

**Stellen:** `src/service/players.ts:49–53`, `src/repository/firebase.ts:60–67,87–88`, `src/components/Poker/Poker.tsx:67–76`, `src/components/Players/PlayerCard/PlayerCard.tsx:199–208`.

Stimmwerte werden als `value` in den gemeinsamen Spielerdokumenten gespeichert. Alle Teilnehmer abonnieren diese Dokumente vollständig; der Snapshot wird ohne Filterung in den React-State übernommen. Erst `getCardFace()` entscheidet, ob statt des Werts ein Statussymbol angezeigt wird.

**Auswirkung:** Teilnehmer können fremde Schätzungen vor dem Aufdecken über den Clientzustand oder einen eigenen Firestore-Listener lesen. Das beeinträchtigt die zugesicherte verdeckte und unabhängige Abstimmung. Der Befund setzt keine Schreibrechte oder Moderatorübernahme voraus.

**Nachweis:** Der Repository-Aufruf liefert den vollständigen Stimmwert unabhängig vom Rundenstatus. Der tatsächlich verwendete Snapshot-Pfad übernimmt ebenfalls sämtliche Felder. Nur die Darstellung prüft den Aufdeckstatus.

**Abhilfe:** Öffentlichen Teilnehmerstatus und private Stimmwerte in getrennten Dokumenten speichern. Vor dem Aufdecken darf nur der Besitzer seine Stimme lesen; danach erhalten berechtigte Sitzungsteilnehmer Zugriff auf das Rundenergebnis. Firestore-Regeln können einzelne Felder eines lesbaren Dokuments nicht verbergen; daher ist eine Änderung des Datenmodells nötig. Siehe [Firebase: Feldzugriff und getrennte Dokumente](https://firebase.google.com/docs/firestore/security/rules-fields).

**Abnahmetest:** Teilnehmer A kann vor der Freigabe den Status von B lesen, dessen Stimme aber auch mit einem eigenen SDK-Aufruf nicht abrufen. Nach Freigabe funktioniert der autorisierte Zugriff. Alte Runden bleiben von neuen Stimmen getrennt.

## S4 – Bekannte Schwachstellen in firebase-tools-Abhängigkeiten

Am 20.09.2026 wurden **1.084 aufgelöste Paketversionen / 964 Paketnamen** aus `pnpm-lock.yaml` gegen die npm Bulk Advisory API geprüft. Anschließend wurden die gemeldeten Versionsbereiche und die Erreichbarkeit über Produktions- und Entwicklungsabhängigkeiten anhand des YAML-Lockdatei-Graphen geprüft.

| Paket in Lockdatei | Advisory | Bewertung | Behobene Version laut Advisory |
| --- | --- | --- | --- |
| `csv-parse@5.6.0` | [GHSA-8cw4-87c7-c6xx](https://github.com/advisories/GHSA-8cw4-87c7-c6xx): Prototype-Manipulation bei bestimmten Spaltenoptionen | Moderate | 7.0.2 |
| `qs@6.15.3` | [GHSA-x5fp-wj9c-mxmx](https://github.com/advisories/GHSA-x5fp-wj9c-mxmx): Umgehung von Array-Limits bei bestimmter Parserkonfiguration | Moderate | 6.16.0 |
| `qs@6.15.3` | [GHSA-4mjr-xmp4-gh2g](https://github.com/advisories/GHSA-4mjr-xmp4-gh2g): Denial of Service über kontrolliertes `isBuffer` | Moderate | 6.16.0 |
| `stream-json@1.9.1` | [GHSA-528h-pc64-c93x](https://github.com/advisories/GHSA-528h-pc64-c93x): übermäßiger CPU-Verbrauch bei tief verschachtelten Eingaben in Pfadfiltern | Moderate | 3.5.0 |

**Abhängigkeitspfade:** `firebase-tools@15.28.2 → csv-parse`, `firebase-tools@15.28.2 → stream-json` und beispielsweise `firebase-tools@15.28.2 → body-parser@1.20.6 → qs`.

**Einordnung:** Alle Treffer liegen im Entwicklungs-/Administrationswerkzeugbaum. Im Produktions-Abhängigkeitsbaum ergaben sich keine Advisory-Treffer. Eine konkrete Ausnutzbarkeit innerhalb der verwendeten Firebase-CLI-Kommandos wurde nicht nachgewiesen; sie hängt von den jeweiligen Parseroptionen und angreiferkontrollierten Eingaben ab. Dies ist kein nachgewiesener Remote-Angriff auf die statisch ausgelieferte SPA.

**Abhilfe:** `firebase-tools` auf eine kompatible Version mit korrigierten transitiven Paketen aktualisieren bzw. die Upstream-Korrektur verfolgen. Overrides nur nach Kompatibilitätsprüfung einsetzen: `csv-parse` und `stream-json` benötigen laut Advisory Major-Upgrades. Danach Lockdatei und Advisory-Abgleich erneuern sowie tatsächlich verwendete CLI-Abläufe prüfen.

## Durchgeführte Verifikation und weitere Beobachtungen

- Fünf vorhandene Testsuiten zu Spiel-/Spielerservices, Spielerkarten, Sitzungsverwaltung und Moderatorprüfung: **68 Tests bestanden**. Ausgeführt über die vorhandene lokale Vitest-Binary. Diese Tests simulieren Firestore und ersetzen keine Security-Rules-Tests.
- Vier zusätzliche isolierte Ausführungsnachweise mit dem Original-TypeScript-Code und simulierten Abhängigkeiten: Cache-basierte Rollenübernahme, Weiterleitung fremder Spieler-ID, Löschung gesperrter Sitzungen durch Bereinigung, vollständige Stimmwerte beim Lesen. Alle vier beobachteten das oben beschriebene Verhalten.
- Die lokal installierten Werkzeuge weichen von der Lockdatei ab: Vitest 4.1.5 statt 4.1.11, Vite 8.0.16 statt 8.2.2. Testergebnisse beziehen sich auf die vorhandene Installation; der Schwachstellenabgleich auf die eingecheckte Lockdatei.
- `pnpm audit` konnte wegen fehlgeschlagener Registry-Abfragen bei der automatischen Paketmanager-Signaturprüfung nicht starten. Die Signaturprüfung wurde nicht umgangen. Stattdessen wurde die npm Advisory API direkt mit den per YAML eingelesenen öffentlichen Paketnamen und Versionen abgefragt. Der Fehler allein belegt keine Manipulation.
- Gezielte Suche in versionierten Dateien nach privaten Schlüsseln, AWS-Zugangsschlüssel-IDs und GitHub-Tokenmustern: keine Treffer. `.env` ist nicht versioniert. Es fand kein vollständiger Secret-Scan der Git-Historie statt. Firebase-Web-Konfigurationswerte sind für Browser vorgesehen und ersetzen keine Zugriffskontrolle; siehe [Firebase API Keys](https://firebase.google.com/docs/projects/api-keys).
- Keine offensichtliche Ausführung untrusted HTML/JavaScript durch `dangerouslySetInnerHTML`, `innerHTML`, `eval` oder `new Function` im Anwendungscode gefunden. Das ist keine vollständige XSS-Garantie.
- Zusätzliche Härtung: In `firebase.json` und `nginx.conf` sind keine expliziten CSP-/Frame-Schutzregeln definiert. `.dockerignore` schließt `.env` nicht aus, obwohl der Build zusätzlich ein Secret-Mount verwendet; lokale Konfigurationsdateien sollten aus dem Build-Kontext ausgeschlossen werden. Die derzeitigen Firebase-Web-Werte allein wurden nicht als Secret-Leak gewertet. Produktive HTTP-Header und Container-Images wurden nicht überprüft.

## Empfohlene Reihenfolge

1. Öffentlichen Bereinigungsweg entfernen bzw. serverseitig sperren; Schutz für gesperrte Sitzungen und deren Teilnehmer prüfen.
2. Produktive Firestore-Regeln sichern, prüfen und versionieren; authentifizierte Spieleridentität und serverseitige Autorisierung samt Emulator-Tests implementieren.
3. Private Stimmwerte von öffentlich lesbaren Teilnehmerdaten trennen.
4. Betroffene CLI-Abhängigkeiten kompatibel aktualisieren und einen regelmäßigen Advisory-Abgleich in CI ergänzen.

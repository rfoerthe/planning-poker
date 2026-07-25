/**
 * German UI copy. Keys stay in English so they read like the code around them;
 * only the values are translated. This bundle ships with the app instead of
 * being fetched at runtime, so the interface never renders raw keys.
 */
export const de = {
  common: {
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    ok: 'Ok',
    remove: 'Entfernen',
    edit: 'Bearbeiten',
    loading: 'Wird geladen …',
    votes_one: '{{count}} Stimme',
    votes_other: '{{count}} Stimmen',
  },

  toolbar: {
    brand: 'Planning Poker',
    version: 'Version: {{version}}',
    openMenu: 'Menü öffnen',
    closeMenu: 'Menü schließen',
    github: 'Projekt auf GitHub',
    menu: {
      about: 'Was ist Planning Poker?',
      guide: 'Leitfaden',
      examples: 'Beispiele',
      newSession: 'Neue Session',
      joinSession: 'Session beitreten',
      legalNotice: 'Impressum',
    },
    theme: {
      label: 'Darstellung',
      light: 'Hell',
      dark: 'Dunkel',
      system: 'System',
    },
  },

  home: {
    badge: 'Kostenlos & Open Source',
    titleLead: 'Schätzen im Team.',
    titleAccent: 'Ohne Reibung.',
    lede: 'Session anlegen, Link teilen, verdeckt abstimmen, gemeinsam aufdecken. Kein Login, keine Installation — in unter zehn Sekunden startklar.',
    features: {
      decks: {
        title: 'Fünf Kartendecks',
        text: 'Fibonacci, Short Fibonacci, T-Shirt, gemischt oder eigene Werte.',
      },
      stats: {
        title: 'Runden-Statistik',
        text: 'Median, Spannweite, Verteilung, Konsens-Bewertung und markierte Ausreißer.',
      },
      timer: {
        title: 'Optionaler Timer',
        text: 'Von 0:30 bis 5:00 — deckt die Runde automatisch auf und zählt die letzten Sekunden groß herunter.',
      },
      presence: {
        title: 'Präsenz-Anzeige',
        text: 'Du siehst auf jeder Karte, wer gerade wirklich dabei ist.',
      },
    },
  },

  createGame: {
    title: 'Neue Session',
    subtitle: 'Du wirst automatisch Moderator:in.',
    sessionName: 'Session-Name',
    sessionNamePlaceholder: 'z. B. Sprint 42 — Refinement',
    yourName: 'Dein Name',
    yourNamePlaceholder: 'Wie sollen dich die anderen sehen?',
    deckLabel: 'Kartendeck',
    decks: {
      shortFibonacci: 'Short Fibonacci',
      fibonacci: 'Fibonacci',
      tshirt: 'T-Shirt',
      tshirtAndNumber: 'T-Shirt & Zahlen',
      custom: 'Eigene Werte',
    },
    deckValues: {
      custom: 'frei wählbar',
    },
    customLabel: 'Eigene Kartenwerte',
    customHint: 'Mindestens zwei Werte, je bis zu drei Zeichen.',
    customError: 'Bitte gib mindestens zwei eigene Kartenwerte ein.',
    allowMembers: 'Alle dürfen moderieren',
    allowMembersHint: 'Aufdecken, neu starten und Timer setzen',
    submit: 'Session starten',
    submitting: 'Session wird erstellt …',
  },

  joinGame: {
    title: 'Session beitreten',
    subtitle: 'Gib die Session-ID aus dem Einladungslink ein.',
    sessionId: 'Session-ID',
    sessionIdPlaceholder: 'z. B. 01hq…',
    sessionNotFound: 'Session nicht gefunden — bitte ID prüfen.',
    yourName: 'Dein Name',
    yourNamePlaceholder: 'Wie sollen dich die anderen sehen?',
    submit: 'Beitreten',
    submitting: 'Beitritt läuft …',
    deletedSnackbar: 'Diese Session wurde gelöscht und existiert nicht mehr.',
  },

  recentGames: {
    title: 'Weitermachen',
    empty: 'Noch keine Sessions vorhanden.',
    createdByLabel: 'von',
    open: 'Session öffnen',
    removeTitle: 'Session löschen',
    removeMessage:
      'Wirklich löschen? Die Session „{{name}}“ wird entfernt und alle Teilnehmenden fliegen heraus.',
    removeAction: 'Session löschen',
    lockedTitle: 'Diese Session ist gegen Löschen geschützt',
    lockedSnackbar: 'Diese Session darf nicht gelöscht werden.',
  },

  session: {
    round: 'Runde',
    statusLabel: {
      started: 'Bereit',
      inProgress: 'Abstimmung läuft',
      finished: 'Aufgedeckt',
    },
    progress: '{{voted}} von {{total}} haben abgestimmt',
    progressPercent: '{{percent}} %',
    actions: {
      reveal: 'Aufdecken',
      revealTitle: 'Runde beenden und alle Karten aufdecken',
      restart: 'Neue Runde',
      restartTitle: 'Neue Runde starten',
      invite: 'Einladen',
      inviteTitle: 'Einladungslink in die Zwischenablage kopieren',
      exit: 'Verlassen',
      exitTitle: 'Session verlassen',
      moreLabel: 'Weitere Aktionen',
    },
    deleteTitle: 'Session löschen',
    deleteMessage:
      'Wirklich löschen? Die Session wird entfernt und alle Teilnehmenden fliegen heraus.',
    deleteLockedTitle: 'Diese Session ist gegen Löschen geschützt',
    deleteLockedSnackbar: 'Diese Session darf nicht gelöscht werden.',
    inviteDialogTitle: 'Einladungslink erstellt',
    inviteDialogBody: 'Der Link wurde in deine Zwischenablage kopiert:',
    inviteDialogHint: 'Teile ihn mit deinem Team, um alle in diese Session zu holen.',
    inviteCopiedSnackbar: 'Einladungslink kopiert.',
    loading: 'Session wird geladen …',
    notFound: 'Diese Session existiert nicht.',
    updateError: 'Aktualisierungen können gerade nicht empfangen werden. Bitte später erneut versuchen.',
  },

  roundStatus: {
    title: 'Diese Runde',
    hidden: 'verdeckt',
    waiting: 'Die Auswertung erscheint, sobald aufgedeckt wurde.',
    voted: 'Abgestimmt',
    open: 'Offen',
    timerLabel: 'Runden-Timer',
    timerIdle: 'Kein Timer aktiv',
  },

  timer: {
    label: 'Timer',
    start: 'Runden-Timer starten',
    stop: 'Runden-Timer stoppen',
    running: 'Noch {{time}}',
    menuLabel: 'Timer-Dauer wählen',
    remainingOf: 'von {{total}}',
  },

  playerCard: {
    you: 'du',
    moderator: 'Moderation',
    voted: 'Abgestimmt',
    thinking: 'Überlegt noch',
    abstained: 'Enthalten',
    outlier: 'Ausreißer',
    outlierTitle: 'Ausreißer — weit weg vom Median des Teams',
    rename: 'Namen ändern',
    renameNamed: '{{name}} — Namen ändern',
    nameLabel: 'Name der teilnehmenden Person',
    remove: 'Teilnehmende Person entfernen',
    presence: 'Gerade in dieser Session aktiv',
    away: 'Zurzeit nicht aktiv',
  },

  cardPicker: {
    title: 'Deine Karte',
    hint: 'Klick zum Wählen — nochmal klicken zum Ändern.',
    lockedTitle: 'Deck gesperrt',
    lockedHint: 'Warte auf „Neue Runde“, um wieder zu wählen.',
    unsure: 'Keine Einschätzung',
    break: 'Pause',
  },

  numericSummary: {
    title: 'Ergebnis',
    median: 'Median',
    average: 'Durchschnitt',
    nearestCard: 'Nächstliegende Karte: {{card}}',
    range: 'Spannweite',
    rangeLabel: 'Spannweite: {{lowest}} – {{highest}}',
    standardDeviation: 'σ',
    abstentions: 'Enthaltungen',
    distribution: 'Verteilung',
    withoutEstimate: '{{count}} ohne Schätzung',
    distributionTooltip: '{{votes}} für {{card}}',
    outliersLabel: 'Ausreißer: {{names}}',
  },

  tshirtSummary: {
    title: 'T-Shirt-Ergebnis',
    medianSize: 'Median-Größe',
    totalMedianValue: 'Median-Aufwand',
    empty: 'Keine T-Shirt-Stimmen zum Auswerten.',
  },

  consensus: {
    details: 'Spanne: {{spread}} · σ: {{deviation}}',
    detailsWithRatio: 'Spanne: {{spread}} · σ: {{deviation}} · Verhältnis: {{ratio}}×',
    consensus: {
      badge: '✓',
      code: 'Konsens',
      message: 'Schätzung plausibel.',
    },
    'moderate-spread': {
      badge: '~',
      code: 'Mittlere Streuung',
      message: 'Kurze Klärung empfohlen.',
    },
    'critical-spread': {
      badge: '!',
      code: 'Kritische Streuung',
      message: 'Diskussion erforderlich!',
    },
  },

  tshirtLegend: {
    title: 'Größen und typischer Aufwand',
    size: 'Größe',
    effort: 'Typischer Aufwand',
    unit: 'PT',
  },

  countdown: {
    label: 'Noch {{seconds}} Sekunden',
  },

  footer: {
    basedOn: 'Basiert auf dem Projekt von',
    version: 'v{{version}}',
  },

  deleteOldGames: {
    inProgress: 'Alte Sessions werden gelöscht …',
    done: 'Löschen abgeschlossen.',
  },

  cookieConsent: {
    accept: 'Verstanden',
    title: 'Datenschutzhinweise und Datenverwendung',
    localStorage: {
      title: 'Cookies und lokaler Browser-Speicher',
      body: 'Damit die Anwendung nutzbar ist, verwenden wir Cookies und den lokalen Speicher deines Browsers. Ein Cookie verwaltet deine Zustimmung zu diesen Hinweisen. Im lokalen Speicher liegen Einstellungen, zwischengespeicherte Daten und Statusinformationen der Anwendung. Diese Daten bleiben ausschließlich auf deinem Gerät und werden weder an unsere Server noch an Dritte übertragen. Der lokale Speicher dient allein technischen und funktionalen Zwecken.',
      control:
        'Alle im lokalen Speicher abgelegten Informationen kannst du jederzeit über die Einstellungen deines Browsers einsehen und löschen.',
    },
    firestore: {
      title: 'Einsatz von Google Firestore',
      body: 'Diese Anwendung nutzt Google Firestore, einen cloudbasierten Datenbankdienst der Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland („Google“). Firestore ermöglicht das Speichern, Synchronisieren und Abrufen von Daten in Echtzeit. Dabei können personenbezogene Daten wie Nutzungsaktivitäten oder von dir eingegebene Inhalte verarbeitet, an Google-Server übertragen und dort gespeichert werden.',
      legalBasis:
        'Die Verarbeitung durch Google Firestore stützt sich auf Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse), da eine moderne und stabile Web-Anwendung ohne diese Technologie nicht bereitgestellt werden kann — oder, soweit für bestimmte Zwecke erforderlich, auf deine Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO. Weitere Informationen zur Datenverarbeitung durch Google: https://policies.google.com/privacy',
      transfer:
        'Im Rahmen der Nutzung können Daten auch an Server in den USA übertragen werden. Google ist unter dem EU-U.S. Data Privacy Framework zertifiziert und gewährleistet damit ein Schutzniveau, das europäischen Datenschutzstandards entspricht.',
    },
  },

  about: {
    title: 'Was ist Agile Planning Poker?',
    sections: [
      {
        title: 'Was ist Agile Planning Poker?',
        image: 'what',
        paragraphs: [
          'In der agilen Softwareentwicklung ist eine belastbare Schätzung die Grundlage für gute Planung. Agile Planning Poker ist eine kollaborative Technik, die das Wissen des gesamten Teams nutzt, um Aufwand, Komplexität oder relative Größe von User Stories und Aufgaben einzuschätzen.',
          'Planning Poker — auch Scrum Poker genannt — ist ein konsensbasiertes Schätzverfahren. Ein Team mit unterschiedlichen Fachrichtungen vergibt gemeinsam Story Points für User Stories, Features oder Aufgaben. Das Verfahren fördert Diskussion, Wissensaustausch und ein gemeinsames Verständnis — und führt damit zu verlässlicheren Schätzungen.',
        ],
      },
      {
        title: 'So läuft Agile Planning Poker ab',
        image: 'how',
        paragraphs: [
          'Zusammenarbeit im Team: Alle Rollen sind dabei — Entwicklung, Test, Product Ownership und Scrum Master. Jede Person bekommt ein Kartendeck mit Werten für Aufwand oder Komplexität.',
          'Vorstellung der User Story: Das Product Ownership stellt die Story vor und erklärt Zweck, Anforderungen und erwartetes Ergebnis, damit alle vom Gleichen ausgehen.',
          'Individuelle Schätzung: Jede Person wählt verdeckt eine Karte. Die Karten bleiben verdeckt, bis alle gewählt haben.',
          'Aufdecken: Auf ein gemeinsames Signal werden alle Karten gleichzeitig aufgedeckt. Die Bandbreite der Schätzungen wird sichtbar und lädt zur Begründung ein.',
          'Konsens finden: Die Beteiligten erläutern ihre Überlegungen, klären Unsicherheiten und nähern sich einer gemeinsamen Einschätzung an.',
          'Wiederholen: Der Ablauf wiederholt sich für jede weitere Story, bis das Backlog oder der Sprint gemeinsam geschätzt ist.',
        ],
      },
      {
        title: 'Der Nutzen',
        image: 'benefits',
        paragraphs: [
          'Höhere Genauigkeit: Die Schätzung stützt sich auf das gesammelte Wissen des Teams — unterschiedliche Perspektiven, Erfahrungen und Fähigkeiten fließen ein.',
          'Bessere Zusammenarbeit: Das Verfahren erzwingt offene Kommunikation und Wissensaustausch, schafft ein gemeinsames Verständnis und stärkt das Verantwortungsgefühl.',
          'Mehr Transparenz: Der Schätzprozess wird für alle sichtbar. Abweichungen fallen früh auf, Erwartungen lassen sich angleichen.',
          'Zeitersparnis: Die klare Struktur verhindert endlose Debatten und verankert Einzelschätzungen in einem gemeinsamen Verständnis — der Konsens kommt schneller.',
        ],
      },
      {
        title: 'Bewährte Praktiken',
        image: 'bestPractices',
        paragraphs: [
          'Einheitliche Schätzeinheit: Sorgt dafür, dass alle dieselbe Einheit meinen — Story Points, Ideal-Tage oder T-Shirt-Größen.',
          'Das ganze Team einbeziehen: Unterschiedliche Perspektiven führen zu besseren Schätzungen und höherer Akzeptanz.',
          'Fibonacci-Folge nutzen: Die Abstände (1, 2, 3, 5, 8, 13, 21 …) bilden ab, dass große Aufgaben zwangsläufig ungenauer geschätzt werden.',
          'Schätzungen festhalten: Wer Werte dokumentiert, erkennt Trends und kann nachjustieren — wertvoll für Planung und Retrospektive.',
          'Konsens ernst nehmen: Offen diskutieren, aktiv zuhören und gemeinsam eine Einschätzung finden, statt Mehrheiten zu überstimmen.',
          'Iterieren und verfeinern: Planning Poker ist kein einmaliges Ritual. Passt das Vorgehen laufend an das an, was ihr aus vergangenen Sprints gelernt habt.',
        ],
      },
    ],
    closing:
      'Agile Planning Poker stärkt Zusammenarbeit, Transparenz und Genauigkeit im Schätzprozess. Indem es das gemeinsame Wissen des Teams nutzt, führt es zu verlässlicheren Schätzungen und besserer Planung — und damit zu Ergebnissen, auf die sich alle Beteiligten stützen können.',
    imageAlt: {
      what: 'Illustration: Was ist Planning Poker',
      how: 'Illustration: Ablauf einer Schätzrunde',
      benefits: 'Illustration: Nutzen für das Team',
      bestPractices: 'Illustration: Bewährte Praktiken',
    },
  },

  guide: {
    title: 'Leitfaden: User Stories in agilen Teams schätzen',
    intro:
      'Sieben Schritte, mit denen Schätzrunden verlässlich werden — von der gemeinsamen Grundlage bis zur laufenden Verfeinerung.',
    items: [
      {
        title: 'Die User Story verstehen',
        text: 'Bevor geschätzt wird, muss die Story klar sein. Das Product Ownership liefert den Kontext und beantwortet Rückfragen. Zweck, Funktionsumfang und erwartetes Ergebnis müssen im Team gleich verstanden werden.',
      },
      {
        title: 'Schätzskala festlegen',
        text: 'Wählt eine Skala, die zu euch passt: Fibonacci-Folge (1, 2, 3, 5, 8, 13, 21 …), T-Shirt-Größen (XS bis XL) oder eine lineare Skala. Wichtig ist genug Abstand zwischen den Stufen, damit ihr keine Zeit mit Feinheiten verliert.',
      },
      {
        title: 'Relativ schätzen',
        text: 'Agile Schätzung vergleicht Stories miteinander statt absolute Zeiten zu raten. Das ist schneller und deutlich verlässlicher.',
      },
      {
        title: 'Referenz-Stories nutzen',
        text: 'Legt einen kleinen Satz Referenz-Stories fest, auf den sich alle einigen. Sie dienen als Maßstab, an dem neue Stories gemessen werden.',
      },
      {
        title: 'Schätzrunden gemeinsam durchführen',
        text: 'Alle, die die Stories später umsetzen, gehören in die Runde. Planning Poker sorgt dafür, dass zunächst verdeckt geschätzt und erst danach diskutiert wird — so ankert niemand die anderen.',
      },
      {
        title: 'Unterschiede besprechen und auflösen',
        text: 'Weichen Schätzungen ab, lasst die Beteiligten ihre Überlegungen erklären. Genau dort kommen Annahmen, Risiken und Abhängigkeiten ans Licht. Ziel ist eine getragene gemeinsame Schätzung.',
      },
      {
        title: 'Schätzungen aktualisieren und verfeinern',
        text: 'Übertragt das Ergebnis ins Backlog und passt es an, wenn die Umsetzung neue Erkenntnisse bringt. Diese laufende Korrektur verbessert die Genauigkeit künftiger Schätzungen.',
      },
    ],
  },

  examples: {
    title: 'Beispiele für Story-Schätzungen',
    intro:
      'Neun typische User Stories mit Schätzung und Begründung — als Anhaltspunkt für eure eigenen Referenzwerte.',
    labels: {
      story: 'User Story',
      estimate: 'Schätzung',
      rationale: 'Begründung',
    },
    items: [
      {
        story: 'Als Nutzer:in möchte ich mich mit E-Mail und Passwort anmelden können.',
        estimate: '3 Story Points (Fibonacci)',
        rationale:
          'Mittlere Komplexität: Authentifizierung, Prüfung der Zugangsdaten und eine saubere Fehlerbehandlung. Aus Erfahrung des Teams ergibt sich der Konsens von 3 Punkten.',
      },
      {
        story:
          'Als Nutzer:in möchte ich Produkte nach Filtern durchsuchen können (Preis, Kategorie, Marke).',
        estimate: '5 Story Points (Fibonacci)',
        rationale:
          'Aufwendiger als eine einfache Story: mehrere Filteroptionen, Anbindung an die Datenbank und eine ausreichend schnelle Suche.',
      },
      {
        story:
          'Als Administrator:in möchte ich monatliche Berichte zu Nutzung und Umsatz erzeugen können.',
        estimate: '8 Story Points (Fibonacci)',
        rationale:
          'Umfangreiche Aufgabe: Berichtsfunktionen entwerfen, Daten aus mehreren Quellen zusammenführen und aussagekräftig aufbereiten.',
      },
      {
        story: 'Als Nutzer:in möchte ich mein Passwort zurücksetzen können, wenn ich es vergessen habe.',
        estimate: '2 Story Points (Fibonacci)',
        rationale:
          'Überschaubar: Verifizierung per E-Mail und Aktualisierung des Passworts in der Datenbank.',
      },
      {
        story: 'Als Nutzer:in möchte ich Produkte in den Warenkorb legen und zur Kasse gehen können.',
        estimate: 'M (T-Shirt-Größe)',
        rationale:
          'Interaktionen, Warenkorb-Zustand, Bestandsaktualisierung und Anbindung eines Zahlungsdienstleisters — insgesamt mittlerer Umfang.',
      },
      {
        story: 'Als Nutzer:in möchte ich Dateien an meine Aufgaben anhängen können.',
        estimate: '3 Story Points (Fibonacci)',
        rationale:
          'Moderate Komplexität: Dateiablage, Validierung und die Verknüpfung mit der jeweiligen Aufgabe.',
      },
      {
        story: 'Als Administrator:in möchte ich Rollen und Berechtigungen verwalten können.',
        estimate: '5 Story Points (Fibonacci)',
        rationale:
          'Größere Aufgabe: ein flexibles Berechtigungsmodell entwerfen, Rollen definieren und die Sicherheit durchgängig gewährleisten.',
      },
      {
        story: 'Als Nutzer:in möchte ich E-Mail-Benachrichtigungen zu wichtigen Ereignissen erhalten.',
        estimate: '2 Story Points (Fibonacci)',
        rationale:
          'Vergleichsweise geradlinig: Anbindung eines E-Mail-Dienstes, Vorlagen und ereignisbasierter Versand.',
      },
      {
        story: 'Als Nutzer:in möchte ich Suchergebnisse filtern und sortieren können.',
        estimate: '3 Story Points (Fibonacci)',
        rationale:
          'Mittlerer Umfang: Nutzereinstellungen berücksichtigen, flexible Suchabfragen bauen und die Ergebnisse passend ausgeben.',
      },
    ],
    closing:
      'Diese Werte sind Beispiele. Eure tatsächlichen Schätzungen hängen von Projekt, Team und Technologie ab. Es geht nicht um absolute Zahlen, sondern um ein gemeinsames Gefühl für relative Größe — als Grundlage für Priorisierung und Planung.',
  },
};

export type TranslationResources = typeof de;

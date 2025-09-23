Feature: Wiki Index Generation
  Als Entwickler
  möchte ich einen automatisch generierten Index aller Test Reports
  damit ich schnell auf historische Test-Ergebnisse zugreifen kann

  Background:
    Given das Wiki-Reports System ist aktiv
    And mehrere Test Reports existieren bereits

  Scenario: Index-Seite Struktur
    Given Reports für Branches "main", "feature-a", "feature-b"
    When die Index-Seite generiert wird
    Then enthält sie Sektionen für jeden Branch
    And jede Sektion zeigt die letzten 20 Läufe
    And der neueste Lauf steht oben

  Scenario: Verlinkung und Navigation
    Given ein Report für Branch "main" mit Run-ID "789"
    When die Index-Seite generiert wird
    Then enthält sie einen Link zu "reports/main/789/index.html"
    And der Link zeigt Commit-SHA, Datum und Status
    And die Navigation ist barrierefrei

  Scenario: Statistik-Dashboard
    Given 50 Test-Läufe in den letzten 7 Tagen
    When die Index-Seite generiert wird
    Then zeigt sie Test-Erfolgsrate über Zeit
    And durchschnittliche Test-Laufzeit wird angezeigt
    And Trends werden visualisiert

  Scenario: Branch-spezifische Übersicht
    Given ein Branch "feature-x" mit 5 Läufen
    When die Branch-Übersichtsseite generiert wird
    Then zeigt sie nur Reports für "feature-x"
    And enthält Link zurück zur Hauptübersicht
    And zeigt Branch-spezifische Metriken

  Scenario: Suchfunktion
    Given 100 Reports über mehrere Monate
    When die Index-Seite generiert wird
    Then enthält sie ein Suchfeld
    And Suche nach Commit-SHA funktioniert
    And Suche nach Datum funktioniert
    And Suche nach Branch funktioniert

  Scenario: Responsive Design
    Given die Index-Seite wurde generiert
    When sie auf verschiedenen Geräten angezeigt wird
    Then ist sie auf Mobile Devices lesbar
    And Tabellen sind horizontal scrollbar
    And Navigation bleibt zugänglich
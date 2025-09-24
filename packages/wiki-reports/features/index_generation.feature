Feature: Wiki Index-Seite generieren
  Als Entwickler möchte ich eine übersichtliche Index-Seite,
  damit ich schnell zu den gewünschten Reports navigieren kann.

  Background:
    Given mehrere Testläufe existieren im Wiki

  Scenario: Startseite mit letztem Lauf
    Given der letzte Lauf war auf Branch "main"
    When die Index-Seite generiert wird
    Then zeigt die Startseite "Letzter Lauf" mit Link zum Report
    And Commit-SHA, Zeitstempel und Branch sind sichtbar

  Scenario: Branch-spezifische Navigation
    Given Reports für verschiedene Branches existieren
    When die Index-Seite generiert wird
    Then gibt es eine Sektion für jeden aktiven Branch
    And jeder Branch zeigt seine letzten 20 Läufe

  Scenario: Suchfunktion im Index
    Given die Index-Seite wurde generiert
    When ein Suchfeld hinzugefügt wird
    Then kann nach Commit-SHA gesucht werden
    And kann nach Branch-Namen gefiltert werden
    And kann nach Datum gefiltert werden

  Scenario: Statistik-Übersicht
    Given mehrere Läufe mit Testergebnissen existieren
    When die Index-Seite generiert wird
    Then zeigt sie Erfolgsrate der letzten 10 Läufe
    And zeigt durchschnittliche Testlaufzeit
    And zeigt Trend-Indikator (besser/schlechter)

  Scenario: Mobile-freundliche Darstellung
    Given die Index-Seite wurde generiert
    When sie auf einem mobilen Gerät betrachtet wird
    Then ist die Navigation responsive
    And Tabellen sind horizontal scrollbar
    And wichtige Infos bleiben sichtbar
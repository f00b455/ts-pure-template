Feature: Support für verschiedene Test Report Formate
  Als Entwickler
  möchte ich verschiedene Test-Report-Formate unterstützt haben
  damit ich einheitliche Wiki-Reports unabhängig vom Test-Framework bekomme

  Background:
    Given das Wiki-Reports System ist initialisiert
    And die Wiki ist aktiviert

  Scenario: JUnit XML zu HTML Konvertierung
    Given ein JUnit XML Report "junit.xml" mit 10 Tests und 2 Failures
    When der Report konvertiert wird
    Then wird ein HTML Report generiert
    And der HTML Report zeigt "10 Tests, 8 Passed, 2 Failed"
    And die Failure Details sind im HTML sichtbar

  Scenario: Jest JSON Reporter
    Given ein Jest JSON Report mit Test-Suites
    When der Report verarbeitet wird
    Then wird eine HTML Übersicht generiert
    And Test-Suites sind kollabierbar dargestellt
    And die Laufzeit jeder Suite ist sichtbar

  Scenario: Vitest Reporter
    Given ein Vitest JSON Report mit Coverage-Daten
    When der Report verarbeitet wird
    Then wird ein HTML Report mit Coverage-Metriken generiert
    And die Coverage-Prozentangaben sind visualisiert
    And nicht abgedeckte Zeilen sind hervorgehoben

  Scenario: Playwright HTML Reporter
    Given ein Playwright HTML Report mit Screenshots
    When der Report kopiert wird
    Then bleiben alle Assets (Screenshots, Videos) erhalten
    And relative Pfade werden korrekt angepasst
    And der Report ist im Wiki navigierbar

  Scenario: Cucumber JSON Reporter
    Given ein Cucumber JSON Report mit Features und Szenarien
    When der Report konvertiert wird
    Then wird ein HTML Report mit Feature-Übersicht generiert
    And Szenarien zeigen Given-When-Then Steps
    And Failed Steps sind rot markiert

  Scenario: Kombinierte Reports
    Given mehrere Report-Formate aus verschiedenen Test-Suites
    When alle Reports verarbeitet werden
    Then wird eine kombinierte Übersichtsseite generiert
    And jeder Report-Typ hat seine eigene Sektion
    And Navigation zwischen Report-Typen ist möglich
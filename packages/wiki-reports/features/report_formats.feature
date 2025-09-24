Feature: Support für verschiedene Testberichtsformate
  Als Entwickler möchte ich verschiedene Testformate unterstützen,
  damit alle Testframeworks automatisch Reports generieren können.

  Background:
    Given die Wiki-Reports Pipeline ist konfiguriert

  Scenario: JUnit XML zu HTML Konvertierung
    Given ein JUnit XML Report existiert
    When die Konvertierung ausgeführt wird
    Then wird ein HTML Report mit Teststatistiken erzeugt
    And fehlgeschlagene Tests sind rot markiert
    And erfolgreiche Tests sind grün markiert

  Scenario: Jest JSON zu HTML Konvertierung
    Given ein Jest JSON Report existiert
    When die Konvertierung ausgeführt wird
    Then wird ein HTML Report mit Coverage-Daten erzeugt
    And Test-Suiten sind hierarchisch dargestellt

  Scenario: Vitest JSON zu HTML Konvertierung
    Given ein Vitest JSON Report existiert
    When die Konvertierung ausgeführt wird
    Then wird ein HTML Report mit Timing-Informationen erzeugt
    And langsame Tests sind hervorgehoben

  Scenario: Cucumber JSON zu HTML Konvertierung
    Given ein Cucumber JSON Report existiert
    When die Konvertierung ausgeführt wird
    Then wird ein HTML Report mit Feature-Übersicht erzeugt
    And Szenarien zeigen Given-When-Then Schritte

  Scenario: Mehrere Formate gleichzeitig
    Given Reports in verschiedenen Formaten existieren
    When die Konvertierung ausgeführt wird
    Then wird für jedes Format ein separater HTML Report erzeugt
    And alle Reports sind im Index verlinkt
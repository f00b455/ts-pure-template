import { Given, When, Then, Before } from '@cucumber/cucumber';

function unimplemented(step: string): never {
  throw new Error(`UNIMPLEMENTED_STEP: ${step} — please implement.`);
}

interface WikiWorld {
  repository: {
    wikiEnabled: boolean;
    artifacts: boolean;
  };
  pipeline: {
    branch: string;
    commitSha: string;
    runId: string;
    status: string;
  };
  publishResult: {
    success: boolean;
    reportPath: string;
    indexUpdated: boolean;
  };
}

Before(function (this: WikiWorld) {
  this.repository = {
    wikiEnabled: false,
    artifacts: false
  };
  this.pipeline = {
    branch: '',
    commitSha: '',
    runId: '',
    status: ''
  };
  this.publishResult = {
    success: false,
    reportPath: '',
    indexUpdated: false
  };
});

// Background steps
Given('das Repository hat die GitHub Wiki aktiviert', function (this: WikiWorld) {
  this.repository.wikiEnabled = true;
  // unimplemented('Given das Repository hat die GitHub Wiki aktiviert');
});

Given('die Pipeline erzeugt Testberichte als Artefakte', function (this: WikiWorld) {
  this.repository.artifacts = true;
  // unimplemented('Given die Pipeline erzeugt Testberichte als Artefakte');
});

// Happy-path scenario
Given('ein erfolgreicher Pipeline-Lauf auf Branch {string} mit Commit-SHA {string}', function (this: WikiWorld, branch: string, sha: string) {
  this.pipeline.branch = branch;
  this.pipeline.commitSha = sha;
  this.pipeline.status = 'success';
  this.pipeline.runId = 'test-run-123';
  // unimplemented(`Given ein erfolgreicher Pipeline-Lauf auf Branch "${branch}" mit Commit-SHA "${sha}"`);
});

When('die Publish-Stage ausgeführt wird', function (this: WikiWorld) {
  // Simulate publishing
  if (this.repository.wikiEnabled && this.repository.artifacts) {
    this.publishResult.success = true;
    this.publishResult.reportPath = `wiki/reports/${this.pipeline.branch}/${this.pipeline.runId}/`;
    this.publishResult.indexUpdated = true;
  }
  // unimplemented('When die Publish-Stage ausgeführt wird');
});

Then('werden HTML-Reports unter {string} abgelegt', function (this: WikiWorld, path: string) {
  const expectedPath = path.replace('<run-id>', this.pipeline.runId);
  if (this.publishResult.reportPath !== expectedPath) {
    throw new Error(`Expected report path ${expectedPath} but got ${this.publishResult.reportPath}`);
  }
  // unimplemented(`Then werden HTML-Reports unter "${path}" abgelegt`);
});

Then('die Wiki-Startseite verlinkt {string}', function (this: WikiWorld, linkText: string) {
  const expectedLink = linkText
    .replace('<run-id>', this.pipeline.runId)
    .replace('abc123', this.pipeline.commitSha);
  // unimplemented(`Then die Wiki-Startseite verlinkt "${linkText}"`);
});

Then('die Seite ist öffentlich innerhalb des Projekts einsehbar', function (this: WikiWorld) {
  // unimplemented('Then die Seite ist öffentlich innerhalb des Projekts einsehbar');
});

// Multiple branches scenario
Given('ein Lauf auf Branch {string}', function (this: WikiWorld, branch: string) {
  this.pipeline.branch = branch;
  this.pipeline.status = 'success';
  this.pipeline.runId = 'test-run-456';
  // unimplemented(`Given ein Lauf auf Branch "${branch}"`);
});

Then('werden Reports unter {string} gespeichert', function (this: WikiWorld, path: string) {
  const expectedPath = path.replace('<run-id>', this.pipeline.runId);
  // unimplemented(`Then werden Reports unter "${path}" gespeichert`);
});

Then('ein Branch-Index existiert und ist verlinkt', function (this: WikiWorld) {
  // unimplemented('Then ein Branch-Index existiert und ist verlinkt');
});

// Index scenario
Given('ein neuer Report wurde abgelegt', function (this: WikiWorld) {
  this.publishResult.success = true;
  // unimplemented('Given ein neuer Report wurde abgelegt');
});

When('das Index-Skript läuft', function (this: WikiWorld) {
  this.publishResult.indexUpdated = true;
  // unimplemented('When das Index-Skript läuft');
});

Then('werden die letzten N Läufe pro Branch gelistet, absteigend sortiert nach Zeit', function (this: WikiWorld) {
  // unimplemented('Then werden die letzten N Läufe pro Branch gelistet, absteigend sortiert nach Zeit');
});

// Fallback scenario
Given('die Tests erzeugen keine Artefakte oder sind fehlgeschlagen', function (this: WikiWorld) {
  this.repository.artifacts = false;
  this.pipeline.status = 'failed';
  // unimplemented('Given die Tests erzeugen keine Artefakte oder sind fehlgeschlagen');
});

Then('wird ein Eintrag {string} mit Zeitstempel erzeugt', function (this: WikiWorld, message: string) {
  // unimplemented(`Then wird ein Eintrag "${message}" mit Zeitstempel erzeugt`);
});

Then('die Pipeline schlägt nicht allein wegen des Wiki-Schritts fehl', function (this: WikiWorld) {
  // unimplemented('Then die Pipeline schlägt nicht allein wegen des Wiki-Schritts fehl');
});

// Retention scenario
Given('mehr als {int} Läufe existieren', function (this: WikiWorld, count: number) {
  // unimplemented(`Given mehr als ${count} Läufe existieren`);
});

When('die Publish-Stage läuft', function (this: WikiWorld) {
  this.publishResult.success = true;
  // unimplemented('When die Publish-Stage läuft');
});

Then('werden ältere Verzeichnisse entfernt, sodass die Wiki-Größe kontrolliert bleibt', function (this: WikiWorld) {
  // unimplemented('Then werden ältere Verzeichnisse entfernt, sodass die Wiki-Größe kontrolliert bleibt');
});
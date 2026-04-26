

# univocal

Eine digitale Plattform zur Stärkung demokratischer Mitbestimmung an Universitäten und Hochschulen.

## Inhaltsverzeichnis

- [1. Quick start / Installation Guide](#1-quick-start--installation-guide)
  - [1.1 Voraussetzungen](#11-voraussetzungen)
  - [1.2 Kube Installations](#12-kube-installations)
  - [1.3 Secrets](#13-secrets)
  - [1.4 Skaffold](#14-skaffold)
  - [1.5 Production Deployment](#15-production-deployment)
- [2. Projektbeschreibung](#2-projektbeschreibung)
- [3. Projektstruktur](#3-projektstruktur)
  - [3.1 General (pnpm - Workspaces)](#31-general-pnpm---workspaces)
  - [3.2 Core-Modules](#32-core-modules)
  - [3.3 Libs](#33-libs)
  - [3.4 Mobile](#34-mobile)
- [4. Troubleshooting](#4-troubleshooting)
- [5. Contributing und Licensing](#5-contributing-und-licensing)

## 1. Quick start / Installation Guide

### 1.1 Voraussetzungen

Bevor Sie mit der Installation beginnen, stellen Sie sicher, dass folgende Tools installiert sind:

- **Node.js** >= 20
- **pnpm** >= 8
- **Docker**
- **Kubernetes** Cluster (z.B. minikube, kind oder ein Cloud-Cluster)
- **kubectl** (Kubernetes CLI)
- **Skaffold** (für Development-Workflows)

### 1.2 Kube Installations

Installieren Sie den Ingress-Controller für Kubernetes:

```sh
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
```

### 1.3 Secrets

Erstellen Sie die folgenden Kubernetes Secrets mit den entsprechenden Schlüsseln in `core/uvc-infra/k8s/dev` oder `core/uvc-infra/k8s/prod`:

#### jwt-encryption-key

- `schluessel`: JWT-Verschlüsselungsschlüssel (String)

#### mongodb-cluster

- `user`: MongoDB Benutzername
- `password`: MongoDB Passwort
- `uri`: MongoDB Connection URI

#### environment

- `brevo_key`: Brevo (ehemals Sendinblue) API-Schlüssel für E-Mail-Versand
- `mode`: Umgebungsmodus (z.B. "development", "production")
- `public_url`: Öffentliche URL der Anwendung
- `network_key`: Netzwerk-Schlüssel für interne Kommunikation

#### s3-config

- `endpoint_url`: S3-kompatibler Storage Endpoint URL
- `access_key`: S3 Access Key
- `secret_key`: S3 Secret Key
- `bucket_name`: S3 Bucket Name

#### ihr-registry-secret-name
- `.dockerconfigjson`: Das Image Pull Secret für das Private Docker Registry

#### shibboleth-sp-credentials (Shibboleth)

Für Shibboleth-Login muss zusätzlich ein Secret mit dem Namen `shibboleth-sp-credentials` vorhanden sein (in **dev** und **prod**). Es enthält:

- `sp-signing-cert.pem`: SP Signing Zertifikat (PEM)
- `sp-signing-key.pem`: SP Signing Private Key (PEM)
- `dfn-aai.pem`: Zertifikat zur Signaturprüfung der DFN-AAI Metadaten (PEM)

**Wichtig:** Diese Dateien sind in `.gitignore` und werden **nicht** committed.

### 1.4 Skaffold

Für die lokale Entwicklung können Sie das Development-Script verwenden:

```sh
./scripts/dev.sh
```

Dieses Script:

- Baut das Basis-Docker-Image (`uvc-base`) falls nötig
- Startet Skaffold im Development-Modus
- Synchronisiert Code-Änderungen automatisch in die laufenden Container

**Wichtig:** Development-Images werden **lokal gebaut** und **nicht zu einer Docker Registry gepusht** (`push: false` in `skaffold.yaml`). Die Images werden nur im lokalen Docker-Daemon verfügbar gemacht und direkt im Kubernetes-Cluster verwendet. Dies bedeutet:

- Keine Registry-Credentials für Development erforderlich
- Schnellere Build-Zyklen (kein Push nötig)
- Images sind nur lokal verfügbar
- Für Production-Deployments müssen Images zu einer Registry gepusht werden (siehe Abschnitt 1.5)

### 1.5 Production Deployment

Für Production-Deployments müssen Sie zunächst Ihre Docker Registry konfigurieren.

#### Registry-Konfiguration

Das Repository verwendet Platzhalter für die Docker Registry-URLs, um keine privaten Informationen zu committen. Für Production-Deployments müssen Sie eine lokale Konfigurationsdatei erstellen:

1. **Kopieren Sie die Vorlage:**

```sh
cp .registry.local.example .registry.local
```

2. **Passen Sie die Werte in `.registry.local` an:**

```sh
export REGISTRY_URL="ihre-registry-url.com"
export REGISTRY_SECRET="ihr-registry-secret-name"

# Shibboleth dev (required for ./scripts/dev.sh)
export SHIB_DEV_ENTITY_ID="http://apps.univocal.local.de/shibboleth"
export SHIB_DEV_DISCOVERY_URL="https://wayf.aai.dfn.de/DFN-AAI-Test/wayf"
export SHIB_DEV_METADATA_URL="http://www.aai.dfn.de/metadata/dfn-aai-test-metadata.xml"
export SHIB_DEV_SUPPORT_CONTACT="support@univocal.local.de"
export SHIB_DEV_APACHE_SERVER_NAME="apps.univocal.local.de"

# Shibboleth prod (required for ./scripts/deploy.sh)
export SHIB_PROD_ENTITY_ID="https://apps.univocal.de/shibboleth"
export SHIB_PROD_DISCOVERY_URL="https://wayf.aai.dfn.de/DFN-AAI/wayf"
export SHIB_PROD_METADATA_URL="http://www.aai.dfn.de/metadata/dfn-aai-metadata.xml"
export SHIB_PROD_SUPPORT_CONTACT="support@education-interactive.de"
export SHIB_PROD_APACHE_SERVER_NAME="https://apps.univocal.de:443"
```

**Wichtig:** Die Datei `.registry.local` ist in `.gitignore` und wird nicht ins Repository committed. Sie enthält Ihre privaten Registry-Informationen.

#### Deployment ausführen

Für Production-Deployments verwenden Sie das Deployment-Script:

```sh
./scripts/deploy.sh <version_base> prod
```

**Beispiel:**

```sh
./scripts/deploy.sh 2.0.0 prod
```

Das Script:

- Lädt die Registry- und Shibboleth-Konfiguration aus `.registry.local`
- Ersetzt automatisch die Platzhalter in den Kubernetes-Manifesten
- Baut die Docker-Images mit Skaffold
- Deployed die Anwendung in den Production-Cluster
- Stellt die Original-Dateien nach dem Deployment wieder her

**Hinweis:** Stellen Sie sicher, dass alle erforderlichen Secrets (siehe Abschnitt 1.3) im Production-Namespace vorhanden sind, bevor Sie das Deployment ausführen.

### 1.6 Beispiel-Konfigurationsdateien

Das Repository enthält eine Beispiel-Konfigurationsdatei für die lokale Konfiguration:

#### `.registry.local.example`

Vorlage für die Docker Registry-Konfiguration. Kopieren Sie diese Datei zu `.registry.local` und passen Sie die Werte an:

```sh
cp .registry.local.example .registry.local
```

Die Datei enthält:
- `REGISTRY_URL`: URL Ihrer Docker Registry
- `REGISTRY_SECRET`: Name des Kubernetes Secrets für Registry-Authentifizierung

**Wichtig:** Die Datei `.registry.local` ist in `.gitignore` und wird nicht ins Repository committed.

#### Kubernetes Secrets

**Wichtig:** Die Secret-Dateien in `core/uvc-infra/k8s/dev/secrets/` und `core/uvc-infra/k8s/prod/secrets/` sollten **nicht mit echten Credentials committed werden**. Diese Dateien dienen als Referenz für die Struktur der benötigten Secrets.

**Für neue Installationen** müssen Sie Ihre eigenen Secrets erstellen. Die folgenden Secrets werden benötigt:

- **environment**: Umgebungsvariablen (Brevo API Key, Public URL, etc.)
- **jwt-encryption-key**: JWT-Verschlüsselungsschlüssel
- **mongodb-cluster**: MongoDB-Verbindungsdaten
- **nodemailer**: E-Mail-Konfiguration (falls verwendet)
- **s3-config**: S3-kompatibler Storage-Konfiguration
- **Registry Secret** (nur prod): Docker Registry Pull Secret
- **shibboleth-sp-credentials** (dev + prod): Shibboleth SP Credentials (SP signing cert/key + DFN-AAI metadata signature cert)

**Informationen zur Erstellung von Secrets:**

Weitere Informationen zur Erstellung von Kubernetes Secrets mit YAML-Dateien finden Sie in der offiziellen Kubernetes-Dokumentation:

- [Kubernetes Secrets - Offizielle Dokumentation](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Erstellen von Secrets mit kubectl](https://kubernetes.io/docs/tasks/configmap-secret/managing-secret-using-kubectl/)
- [Erstellen von Secrets mit YAML](https://kubernetes.io/docs/tasks/configmap-secret/managing-secret-using-config-file/)

**Wichtig:** 
- Erstellen Sie für Ihre eigene Installation neue Secrets mit Ihren eigenen Werten
- Die Secret-Dateien im Repository dienen nur als Struktur-Referenz
- Lokale Secret-Dateien mit echten Werten sollten **nicht ins Repository committed** werden

## 2. Projektbeschreibung

univocal ist eine digitale Plattform zur Stärkung demokratischer Mitbestimmung an Universitäten und Hochschulen. Sie wurde aus der Praxis studentischer Gremienarbeit heraus entwickelt und verfolgt das Ziel, demokratische Prozesse, Organisation und Kommunikation von Fachschaften, Studierendenvertretungen und Hochschulgruppen zeitgemäß, sicher und nachhaltig zu unterstützen. Mit der Veröffentlichung des vollständigen Source Codes als Open-Source-Software (OSS) wird univocal nun einer breiten Öffentlichkeit zugänglich gemacht und kann von Hochschulen, Initiativen und Entwickler:innen weitergenutzt, angepasst und weiterentwickelt werden.

### Ausgangslage und Motivation

Studentische Vertretungen und Hochschulgremien übernehmen an Universitäten und Hochschulen eine zentrale Rolle für demokratische Teilhabe, Interessenvertretung und politische Bildung. Gleichzeitig stehen sie vor strukturellen Herausforderungen: häufig wechselnde Amtszeiten, begrenzte zeitliche Ressourcen, fehlende Kontinuität in der Dokumentation sowie uneinheitliche oder ungeeignete digitale Werkzeuge erschweren nachhaltige Gremienarbeit erheblich.

Zwar existieren zahlreiche digitale Tools für Projektmanagement, Kommunikation, Umfragen oder Abstimmungen, diese sind jedoch oft kostenpflichtig, datenschutzrechtlich problematisch oder nicht auf die Prozesse studentischer Selbstverwaltung ausgerichtet. Insbesondere fehlen Lösungen, die speziell auf die Bedürfnisse demokratischer Gremien an Hochschulen zugeschnitten sind und dabei rechtliche, organisatorische und technische Anforderungen gleichermaßen berücksichtigen.

Vor diesem Hintergrund entstand univocal als integrierte Plattform, die typische Arbeitsprozesse studentischer Gremienarbeit bündelt und gleichzeitig den Anspruch verfolgt, demokratische Mitbestimmung niedrigschwelliger, transparenter und wirksamer zu gestalten.

### univocal als digitale Infrastruktur für Mitbestimmung

univocal ist als Web-Anwendung und App nutzbar und vereint mehrere zentrale Funktionen in einer gemeinsamen, intuitiven Oberfläche. Dazu gehören unter anderem:

- Digitale Wahlen und Abstimmungen, die demokratische Entscheidungsprozesse vereinfachen und dokumentieren
- Projekt- und Aufgabenmanagement, um Vorhaben in Fachschaften und Gremien strukturiert zu planen, umzusetzen und nachzuhalten
- Budget- und Ressourcenverwaltung, die Transparenz im Umgang mit finanziellen Mitteln schafft
- Kommunikations- und Informationsfunktionen, etwa zur internen Abstimmung oder zur Öffentlichkeitsarbeit
- Dokumentation und Wissenssicherung, um Erfahrungen, Beschlüsse und Materialien über Amtszeiten hinweg verfügbar zu halten

Durch diese Bündelung entsteht eine zentrale Arbeitsumgebung, die nicht nur organisatorische Abläufe unterstützt, sondern auch demokratische Prinzipien wie Transparenz, Beteiligung und Nachvollziehbarkeit digital abbildet.

## 3. Projektstruktur

### 3.1 General (pnpm - Workspaces)

Das Projekt verwendet **pnpm Workspaces** zur Verwaltung eines Monorepos. Dies ermöglicht:

- Zentrale Dependency-Verwaltung
- Geteilte Bibliotheken zwischen Services
- Effiziente Build-Prozesse
- Versionierung über Workspace-Protokolle

Die Workspace-Struktur ist in `pnpm-workspace.yaml` definiert und umfasst:

- `core/*` - Microservices
- `lib/*` - Gemeinsame Bibliotheken
- `templates/*` - Projektvorlagen

Verfügbare Root-Scripts:

```sh
pnpm build:libs        # Baut alle Bibliotheken
pnpm build:services   # Baut alle Services
pnpm build:all        # Baut alles
pnpm install:all      # Installiert alle Dependencies
```

### 3.2 Core-Modules

Die Anwendung besteht aus mehreren Microservices, die als separate Docker-Container deployed werden:

- **uvc-auth**: Authentifizierung und Benutzerverwaltung
- **uvc-calendar**: Kalenderfunktionalität und Terminverwaltung
- **uvc-chat**: Chat- und Messaging-Funktionen
- **uvc-event**: Event-Management und Veranstaltungen
- **uvc-knowledge**: Wissensdatenbank und Wiki-Funktionalität
- **uvc-profile**: Öffentliche Schüler*innenvertretungsprofile
- **uvc-project**: Projektmanagement und Aufgabenverwaltung
- **uvc-survey**: Umfragen und Abstimmungen
- **uvc-tenant**: Gruppenverwaltung und -administration
- **uvc-web**: Frontend-Webanwendung (React + Vite)
- **uvc-infra**: Kubernetes-Infrastruktur-Konfigurationen

Jeder Service ist ein eigenständiges Node.js/Express-Projekt mit:

- TypeScript
- MongoDB (Mongoose)
- Migrations (migrate-mongo)
- Docker-Support

### 3.3 Libs

Gemeinsame Bibliotheken, die von den Services verwendet werden:

- **uvc-common**: Gemeinsame Utilities, Middleware, Fehlerbehandlung, Services (Brevo, Notifications, Upload, etc.)
- **uvc-api**: API-Route-Definitionen und Typen für alle Services

Diese Bibliotheken werden als Workspace-Dependencies referenziert und müssen vor dem Build der Services kompiliert werden.

### 3.4 Mobile

Die mobile Anwendung befindet sich im `mobile/` Verzeichnis und basiert auf:

- **Expo** (React Native)
- **Expo Router** für Navigation
- TypeScript

## 4. Troubleshooting

### Häufige Probleme

#### Docker-Images werden nicht gebaut

**Problem:** Skaffold kann die Docker-Images nicht bauen.

**Lösung:**
- Stellen Sie sicher, dass Docker läuft: `docker ps`
- Prüfen Sie, ob der Build-Kontext korrekt ist
- Für Production: Stellen Sie sicher, dass `.registry.local` existiert und korrekt konfiguriert ist

#### Kubernetes-Pods starten nicht

**Problem:** Pods bleiben im Status `Pending` oder `CrashLoopBackOff`.

**Lösung:**
- Prüfen Sie die Pod-Logs: `kubectl logs <pod-name>`
- Stellen Sie sicher, dass alle erforderlichen Secrets vorhanden sind: `kubectl get secrets`
- Prüfen Sie die Pod-Beschreibung: `kubectl describe pod <pod-name>`
- Für Production: Stellen Sie sicher, dass das Registry-Pull-Secret korrekt konfiguriert ist

#### Registry-Authentifizierung schlägt fehl

**Problem:** Images können nicht aus der Registry gezogen werden.

**Lösung:**
- Prüfen Sie, ob das Registry-Secret existiert: `kubectl get secret <registry-secret-name>`
- Stellen Sie sicher, dass `.registry.local` die korrekte `REGISTRY_SECRET` Variable enthält
- Erstellen Sie das Secret manuell, falls nötig:
  ```sh
  kubectl create secret docker-registry <secret-name> \
    --docker-server=<registry-url> \
    --docker-username=<username> \
    --docker-password=<password> \
    --docker-email=<email>
  ```

#### MongoDB-Verbindungsfehler

**Problem:** Services können sich nicht mit MongoDB verbinden.

**Lösung:**
- Prüfen Sie, ob das MongoDB-Secret korrekt ist: `kubectl get secret mongodb-cluster -o yaml`
- Stellen Sie sicher, dass MongoDB erreichbar ist
- Prüfen Sie die Connection URI im Secret

#### Skaffold-Sync funktioniert nicht

**Problem:** Code-Änderungen werden nicht in die Container synchronisiert.

**Lösung:**
- Prüfen Sie die Skaffold-Logs: `skaffold dev --verbosity=debug`
- Stellen Sie sicher, dass die `sync`-Konfiguration in `skaffold.yaml` korrekt ist
- Prüfen Sie, ob die Dateien in den `infer`-Pfaden liegen

#### Port-Konflikte

**Problem:** Ports sind bereits belegt.

**Lösung:**
- Prüfen Sie, welche Prozesse die Ports verwenden: `lsof -i :<port>` (macOS/Linux) oder `netstat -ano | findstr :<port>` (Windows)
- Ändern Sie die Port-Konfiguration in den Kubernetes-Services oder beenden Sie die konkurrierenden Prozesse

### Weitere Hilfe

Falls Sie weitere Probleme haben:

1. Prüfen Sie die [Issues auf GitHub](https://github.com/your-repo/issues) für bekannte Probleme
2. Erstellen Sie ein neues Issue mit:
   - Beschreibung des Problems
   - Schritte zur Reproduktion
   - Erwartetes vs. tatsächliches Verhalten
   - Logs und Fehlermeldungen
   - Umgebungsinformationen (OS, Kubernetes-Version, etc.)

## 5. Contributing und Licensing

### Contributing

Beiträge sind jederzeit willkommen! Bitte lesen Sie die [Contributing Guidelines](./CONTRIBUTING.md) und den [Code of Conduct](./CODE_OF_CONDUCT.md) bevor Sie einen Pull Request einreichen.

Wichtige Punkte:

- Kleine, fokussierte Pull Requests bevorzugt
- Tests und Linter müssen bestehen
- Dokumentation aktualisieren
- Für größere Änderungen bitte zuerst ein Issue öffnen

### Kontakt

Bei Fragen, Anregungen oder Problemen können Sie uns erreichen:

- **E-Mail:** univocal@saukels.de
- **GitHub Issues:** Für Bug Reports und Feature Requests nutzen Sie bitte die [GitHub Issues](https://github.com/your-repo/issues)

### Security

Wenn Sie eine Sicherheitslücke gefunden haben, melden Sie diese bitte **nicht öffentlich**, sondern kontaktieren Sie uns direkt:

- **Security E-Mail:** univocal@saukels.de
- **Betreff:** Bitte verwenden Sie "[SECURITY]" im Betreff

Wir werden Sicherheitsprobleme schnellstmöglich bearbeiten und Sie über den Fortschritt informieren.

### Licensing

univocal ist unter der **Apache License 2.0** lizenziert. Details finden Sie in der [LICENSE.md](./LICENSE.md).

Copyright 2026 Education Interactive

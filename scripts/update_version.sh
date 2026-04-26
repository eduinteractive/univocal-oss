#!/bin/bash

# Überprüfen, ob die Version als Argument übergeben wurde
if [ -z "$1" ]; then
  echo "Bitte gib eine Version an, die gesetzt werden soll."
  echo "Nutzung: $0 <version>"
  exit 1
fi

VERSION=$1
CORE_DIR="core"

# Überprüfen, ob das core-Verzeichnis existiert
if [ ! -d "$CORE_DIR" ]; then
  echo "Das Verzeichnis '$CORE_DIR' existiert nicht."
  exit 1
fi

# Suche nach package.json-Dateien und debugge die Ausgabe
echo "Suche nach package.json-Dateien im $CORE_DIR Verzeichnis..."
find "$CORE_DIR" -type f -name "package.json" ! -path "*/node_modules/*" | while read -r package_file; do
  echo "Setze Version in $package_file auf $VERSION..."

  # Ersetze die Version in der package.json ohne Backup und logge eventuelle Fehler
    sed -i '' -E "s/\"version\": \"[^\"]+\"/\"version\": \"$VERSION\"/" "$package_file"
  
  echo "Version erfolgreich auf $VERSION gesetzt in $package_file"
done

LIB_DIR="lib"

# Überprüfen, ob das core-Verzeichnis existiert
if [ ! -d "$LIB_DIR" ]; then
  echo "Das Verzeichnis '$LIB_DIR' existiert nicht."
  exit 1
fi

# Suche nach package.json-Dateien und debugge die Ausgabe
echo "Suche nach package.json-Dateien im $LIB_DIR Verzeichnis..."
find "$LIB_DIR" -type f -name "package.json" ! -path "*/node_modules/*" | while read -r package_file; do
  echo "Setze Version in $package_file auf $VERSION..."

  # Ersetze die Version in der package.json ohne Backup und logge eventuelle Fehler
    sed -i '' -E "s/\"version\": \"[^\"]+\"/\"version\": \"$VERSION\"/" "$package_file"
  
  echo "Version erfolgreich auf $VERSION gesetzt in $package_file"
done

# Aktualisiere publiccode.yml
PUBLICCODE_FILE="publiccode.yml"
if [ -f "$PUBLICCODE_FILE" ]; then
  echo "Setze Version in $PUBLICCODE_FILE auf $VERSION..."
  # Ersetze softwareVersion in publiccode.yml
  sed -i '' -E "s/softwareVersion: [0-9]+\.[0-9]+\.[0-9]+/softwareVersion: $VERSION/" "$PUBLICCODE_FILE"
  echo "Version erfolgreich auf $VERSION gesetzt in $PUBLICCODE_FILE"
else
  echo "Warnung: $PUBLICCODE_FILE nicht gefunden, überspringe..."
fi

echo "Alle Versionen wurden erfolgreich gesetzt."

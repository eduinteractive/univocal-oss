#!/bin/bash
# Script zur Prüfung der Dependencies-Lizenzen
# Generiert automatisch LICENSES_SUMMARY.md

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_FILE="$PROJECT_ROOT/LICENSES_SUMMARY.md"

echo "🔍 Prüfe Dependencies-Lizenzen..."
echo ""

# Erstelle temporäre Datei mit allen Lizenzen
TEMP_FILE=$(mktemp)
pnpm licenses list 2>&1 > "$TEMP_FILE"

# Starte die Ausgabe-Datei
cat > "$OUTPUT_FILE" << 'EOF'
# Dependencies-Lizenzen Zusammenfassung

> **Hinweis**: Diese Datei wird automatisch von `./scripts/check-licenses.sh` generiert.
> Letzte Aktualisierung: $(date)

EOF

# Füge Datum hinzu
echo "> **Letzte Aktualisierung**: $(date '+%Y-%m-%d %H:%M:%S')" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Analysiere Lizenzen
echo "## ✅ Kompatibilität mit Apache 2.0" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "Die meisten Dependencies sind mit Apache 2.0 kompatibel:" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Zähle verschiedene Lizenzen und formatiere sie
LICENSE_COUNTS=$(grep -v "^┌\|^├\|^│ Package\|^└" "$TEMP_FILE" | grep "│" | awk -F'│' '{print $3}' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | sort | uniq -c | sort -rn)

# Extrahiere die häufigsten Lizenzen
MIT_COUNT=$(echo "$LICENSE_COUNTS" | grep -i "MIT" | head -1 | awk '{print $1}' || echo "0")
ISC_COUNT=$(echo "$LICENSE_COUNTS" | grep -i "ISC" | head -1 | awk '{print $1}' || echo "0")
BSD3_COUNT=$(echo "$LICENSE_COUNTS" | grep -i "BSD-3-Clause" | head -1 | awk '{print $1}' || echo "0")
APACHE_COUNT=$(echo "$LICENSE_COUNTS" | grep -i "Apache-2.0" | head -1 | awk '{print $1}' || echo "0")
BSD2_COUNT=$(echo "$LICENSE_COUNTS" | grep -i "BSD-2-Clause" | head -1 | awk '{print $1}' || echo "0")
MPL_COUNT=$(echo "$LICENSE_COUNTS" | grep -i "MPL-2.0" | head -1 | awk '{print $1}' || echo "0")

# Schreibe kompatible Lizenzen
[ "$MIT_COUNT" != "0" ] && echo "- **MIT**: $MIT_COUNT Packages ✅" >> "$OUTPUT_FILE"
[ "$ISC_COUNT" != "0" ] && echo "- **ISC**: $ISC_COUNT Packages ✅" >> "$OUTPUT_FILE"
[ "$BSD3_COUNT" != "0" ] && echo "- **BSD-3-Clause**: $BSD3_COUNT Packages ✅" >> "$OUTPUT_FILE"
[ "$APACHE_COUNT" != "0" ] && echo "- **Apache-2.0**: $APACHE_COUNT Packages ✅" >> "$OUTPUT_FILE"
[ "$BSD2_COUNT" != "0" ] && echo "- **BSD-2-Clause**: $BSD2_COUNT Packages ✅" >> "$OUTPUT_FILE"
[ "$MPL_COUNT" != "0" ] && echo "- **MPL-2.0**: $MPL_COUNT Packages ✅" >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"
echo "## ⚠️ Zu prüfende Lizenzen" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Prüfe auf problematische Lizenzen
GPL_PACKAGES=$(grep -iE "GPL|LGPL|AGPL" "$TEMP_FILE" | grep "│" | awk -F'│' '{print $2}' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | head -10)

if [ -n "$GPL_PACKAGES" ]; then
    echo "### GPL/LGPL/AGPL Lizenzen" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "$GPL_PACKAGES" | while read -r package; do
        if [ -n "$package" ]; then
            echo "- **$package**: GPL-Lizenz (Copyleft - kann problematisch sein)" >> "$OUTPUT_FILE"
        fi
    done
    echo "" >> "$OUTPUT_FILE"
else
    echo "### ✅ Keine GPL-Lizenzen gefunden" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "Keine GPL, LGPL oder AGPL Lizenzen gefunden - das ist gut für Apache 2.0 Kompatibilität!" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
fi

# Prüfe auf BUSL
BUSL_PACKAGES=$(grep -iE "BUSL" "$TEMP_FILE" | grep "│" | awk -F'│' '{print $2}' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
if [ -n "$BUSL_PACKAGES" ]; then
    echo "### BUSL (Business Source License)" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "$BUSL_PACKAGES" | while read -r package; do
        if [ -n "$package" ]; then
            echo "- **$package**: Business Source License - proprietär, wird später zu Apache 2.0" >> "$OUTPUT_FILE"
        fi
    done
    echo "" >> "$OUTPUT_FILE"
fi

# Prüfe auf CC-BY
CCBY_PACKAGES=$(grep -iE "CC-BY" "$TEMP_FILE" | grep "│" | awk -F'│' '{print $2}' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
if [ -n "$CCBY_PACKAGES" ]; then
    echo "### CC-BY (Creative Commons)" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "Creative Commons Lizenzen sind für Dokumentation/Metadaten, nicht für Code:" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "$CCBY_PACKAGES" | while read -r package; do
        if [ -n "$package" ]; then
            LICENSE_TYPE=$(grep "$package" "$TEMP_FILE" | grep "│" | awk -F'│' '{print $3}' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
            echo "- **$package**: $LICENSE_TYPE" >> "$OUTPUT_FILE"
        fi
    done
    echo "" >> "$OUTPUT_FILE"
fi

# Prüfe auf andere ungewöhnliche Lizenzen
UNUSUAL=$(grep -v "^┌\|^├\|^│ Package\|^└" "$TEMP_FILE" | grep "│" | awk -F'│' '{print $3}' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | grep -viE "MIT|ISC|BSD|Apache|MPL|GPL|LGPL|AGPL|CC-BY|BUSL|Unlicense|0BSD" | sort | uniq | head -10)

if [ -n "$UNUSUAL" ]; then
    echo "### Weitere Lizenzen" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "$UNUSUAL" | while read -r license; do
        if [ -n "$license" ]; then
            COUNT=$(echo "$LICENSE_COUNTS" | grep -F "$license" | awk '{print $1}' | head -1)
            echo "- **$license**: $COUNT Package(s)" >> "$OUTPUT_FILE"
        fi
    done
    echo "" >> "$OUTPUT_FILE"
fi

# Füge vollständige Liste hinzu
echo "## 📋 Vollständige Lizenz-Liste" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "Für eine vollständige Liste aller Dependencies und deren Lizenzen, führen Sie aus:" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "\`\`\`bash" >> "$OUTPUT_FILE"
echo "pnpm licenses list" >> "$OUTPUT_FILE"
echo "\`\`\`" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Zeige Zusammenfassung in der Konsole
echo "📊 Lizenz-Übersicht:"
echo "===================="
echo ""
echo "Lizenz-Verteilung:"
echo "$LICENSE_COUNTS" | head -20
echo ""
echo "⚠️  Potenziell problematische Lizenzen (GPL/LGPL/AGPL):"
echo "========================================================"
if [ -n "$GPL_PACKAGES" ]; then
    echo "$GPL_PACKAGES"
else
    echo "Keine GPL-Lizenzen gefunden ✅"
fi
echo ""
echo "✅ LICENSES_SUMMARY.md wurde aktualisiert!"
echo ""

# Aufräumen
rm "$TEMP_FILE"


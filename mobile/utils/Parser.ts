import { TenantType } from "@/api/Tenant";
import { NETWORK_PERMISSION_LEVELS, SSR_PERMISSION_LEVELS, SV_PERMISSION_LEVELS } from "../constants/Enums";
import { parseDocument, DomUtils } from 'htmlparser2';

export const getMemberRoleLabel = (type: TenantType | undefined, role: number | undefined) => {
    if (!type || role === undefined || role === null) return "Unbekannt";
    switch (type) {
        case TenantType.SV:
            return SV_PERMISSION_LEVELS.find((level) => level.value === role)?.label || "Unbekannt";
        case TenantType.NETWORK:
            return NETWORK_PERMISSION_LEVELS.find((level) => level.value === role)?.label || "Unbekannt";
        case TenantType.SSR:
            return SSR_PERMISSION_LEVELS.find((level) => level.value === role)?.label || "Unbekannt";
    }
}

export const getMemberRoles = (type: TenantType | undefined) => {
    if (!type) return [];
    switch (type) {
        case TenantType.SV:
            return SV_PERMISSION_LEVELS;
        case TenantType.NETWORK:
            return NETWORK_PERMISSION_LEVELS;
        case TenantType.SSR:
            return SSR_PERMISSION_LEVELS;
    }
}

export const htmlToMarkdown = (html: string, plain?: boolean): string => {
    const root = parseDocument(html);

    function convertNode(node: any): string {
        if (DomUtils.isText(node)) {
            return (node as any).data.trim();
        }

        if (DomUtils.isTag(node)) {
            const tag = (node as any).name.toLowerCase();
            const children = DomUtils.getChildren(node);

            if (plain) {
                return convertChildren(children);
            }

            switch (tag) {
                case 'strong':
                case 'b':
                    return `**${convertChildren(children)}**`;
                case 'em':
                case 'i':
                    return `*${convertChildren(children)}*`;
                case 'u':
                    return `<u>${convertChildren(children)}</u>`;
                case 'h1':
                    return `# ${convertChildren(children)}\n\n`;
                case 'h2':
                    return `## ${convertChildren(children)}\n\n`;
                case 'h3':
                    return `### ${convertChildren(children)}\n\n`;
                case 'p':
                    return `${convertChildren(children)}\n\n`;
                case 'br':
                    return `  \n`;
                case 'ul':
                case 'ol':
                    return children.map(convertNode).join('');
                case 'li': {
                    const parentTag = (node.parent as any)?.name;
                    const prefix = parentTag === 'ol' ? '1.' : '-';
                    return `${prefix} ${convertChildren(children)}\n`;
                }
                case 'a':
                    const href = node.attribs?.href || '';
                    return `[${convertChildren(children)}](${href})`;
                case 'code':
                    return `\`${convertChildren(children)}\``;
                case 'pre':
                    return `\`\`\`\n${convertChildren(children)}\n\`\`\`\n\n`;
                case 'img':
                    const alt = node.attribs?.alt || '';
                    const src = node.attribs?.src || '';
                    return `![${alt}](${src})`;
                case 'blockquote':
                    return `> ${convertChildren(children)}\n\n`;
                case 'table':
                    return convertTable(node);
                default:
                    return convertChildren(children);
            }
        }

        return '';
    }

    function convertChildren(nodes: any[]): string {
        return nodes.map(convertNode).join('');
    }

    function convertTable(tableNode: any): string {
        const rows = DomUtils.findAll(el => el.name === 'tr', tableNode);
        if (rows.length === 0) return '';

        // Hilfsfunktion zum Extrahieren des reinen Textes aus einer Zelle
        const extractCellText = (cell: any) =>
            escapeMarkdown(
                DomUtils.getChildren(cell)
                    .map(child => DomUtils.isTag(child) && child.name === 'p'
                        ? DomUtils.getChildren(child).map(c => DomUtils.isText(c) ? c.data.trim() : '').join(' ')
                        : DomUtils.isText(child) ? child.data.trim() : ''
                    )
                    .join(' ')
                    .replace(/\u00A0/g, ' ') // Entferne &nbsp;
                    .replace(/\s+/g, ' ')    // Mehrere Leerzeichen zusammenfassen
                    .trim()
            );

        // Header-Zellen erkennen
        const headerCells = DomUtils.getChildren(rows[0])
            .filter(child => DomUtils.isTag(child) && ['th', 'td'].includes((child as any).name))
            .map(cell => extractCellText(cell as any));

        const headerLine = `| ${headerCells.join(' | ')} |`;
        const separatorLine = `| ${headerCells.map(() => '---').join(' | ')} |`;

        const bodyLines = rows.slice(1).map(row => {
            const cells = DomUtils.getChildren(row)
                .filter(child => DomUtils.isTag(child) && ['td', 'th'].includes((child as any).name))
                .map(cell => extractCellText(cell as any));
            return `| ${cells.join(' | ')} |`;
        });

        return [headerLine, separatorLine, ...bodyLines].join('\n') + '\n\n';
    }

    function escapeMarkdown(text: string): string {
        return text
            .replace(/\|/g, '\\|')     // für Tabellen: "|" escapen
            .replace(/\\/g, '\\\\')    // Backslashes doppeln
            .replace(/`/g, '\\`')      // Code-Backticks
            .replace(/\*/g, '\\*')     // Fettdruck / Italic
            .replace(/_/g, '\\_')      // Unterstriche
            .replace(/#/g, '\\#')      // Überschriften
            .replace(/\[/g, '\\[')     // Links
            .replace(/\]/g, '\\]')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)')
            .replace(/!/g, '\\!');     // Bilder
    };

    const response = convertChildren(DomUtils.getChildren(root)).trim();
    return response;
}

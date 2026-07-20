import { GROUP_PERMISSION_OPTIONS } from "@/api/Auth";
import { parseDocument, DomUtils } from "htmlparser2";

/** Options for selects (tenant member role, UVC view access, etc.) — same scale as `GROUP_PERMISSION_LEVEL`. */
export const getGroupPermissionOptions = () => GROUP_PERMISSION_OPTIONS;

export const getGroupPermissionLabel = (role: number | undefined) => {
	if (role === undefined || role === null) return "Unbekannt";
	return GROUP_PERMISSION_OPTIONS.find((level) => level.value === role)?.label ?? "Unbekannt";
};

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
				case "strong":
				case "b":
					return `**${convertChildren(children)}**`;
				case "em":
				case "i":
					return `*${convertChildren(children)}*`;
				case "u":
					return `<u>${convertChildren(children)}</u>`;
				case "h1":
					return `# ${convertChildren(children)}\n\n`;
				case "h2":
					return `## ${convertChildren(children)}\n\n`;
				case "h3":
					return `### ${convertChildren(children)}\n\n`;
				case "p":
					return `${convertChildren(children)}\n\n`;
				case "br":
					return `  \n`;
				case "ul":
				case "ol":
					return children.map(convertNode).join("");
				case "li": {
					const parentTag = (node.parent as any)?.name;
					const prefix = parentTag === "ol" ? "1." : "-";
					return `${prefix} ${convertChildren(children)}\n`;
				}
				case "a":
					const href = node.attribs?.href || "";
					return `[${convertChildren(children)}](${href})`;
				case "code":
					return `\`${convertChildren(children)}\``;
				case "pre":
					return `\`\`\`\n${convertChildren(children)}\n\`\`\`\n\n`;
				case "img":
					const alt = node.attribs?.alt || "";
					const src = node.attribs?.src || "";
					return `![${alt}](${src})`;
				case "blockquote":
					return `> ${convertChildren(children)}\n\n`;
				case "table":
					return convertTable(node);
				default:
					return convertChildren(children);
			}
		}

		return "";
	}

	function convertChildren(nodes: any[]): string {
		return nodes.map(convertNode).join("");
	}

	function convertTable(tableNode: any): string {
		const rows = DomUtils.findAll((el) => el.name === "tr", tableNode);
		if (rows.length === 0) return "";

		const extractCellText = (cell: any) =>
			escapeMarkdown(
				DomUtils.getChildren(cell)
					.map((child) =>
						DomUtils.isTag(child) && child.name === "p"
							? DomUtils.getChildren(child)
									.map((c) => (DomUtils.isText(c) ? c.data.trim() : ""))
									.join(" ")
							: DomUtils.isText(child)
								? child.data.trim()
								: ""
					)
					.join(" ")
					.replace(/\u00A0/g, " ")
					.replace(/\s+/g, " ")
					.trim()
			);

		const headerCells = DomUtils.getChildren(rows[0])
			.filter((child) => DomUtils.isTag(child) && ["th", "td"].includes((child as any).name))
			.map((cell) => extractCellText(cell as any));

		const headerLine = `| ${headerCells.join(" | ")} |`;
		const separatorLine = `| ${headerCells.map(() => "---").join(" | ")} |`;

		const bodyLines = rows.slice(1).map((row) => {
			const cells = DomUtils.getChildren(row)
				.filter((child) => DomUtils.isTag(child) && ["td", "th"].includes((child as any).name))
				.map((cell) => extractCellText(cell as any));
			return `| ${cells.join(" | ")} |`;
		});

		return [headerLine, separatorLine, ...bodyLines].join("\n") + "\n\n";
	}

	function escapeMarkdown(text: string): string {
		return text
			.replace(/\|/g, "\\|")
			.replace(/\\/g, "\\\\")
			.replace(/`/g, "\\`")
			.replace(/\*/g, "\\*")
			.replace(/_/g, "\\_")
			.replace(/#/g, "\\#")
			.replace(/\[/g, "\\[")
			.replace(/\]/g, "\\]")
			.replace(/\(/g, "\\(")
			.replace(/\)/g, "\\)")
			.replace(/!/g, "\\!");
	}

	const response = convertChildren(DomUtils.getChildren(root)).trim();
	return response;
};

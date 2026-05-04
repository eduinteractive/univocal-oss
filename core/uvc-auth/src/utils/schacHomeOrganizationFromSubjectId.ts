/**
 * Heuristic for “home organization” from the DFN principal string (SAML subject-id),
 * when schacHomeOrganization is not released by the IdP.
 * Typical: scoped identifier with `@` (e.g. `…!…@idp.uni-example.de`).
 */
export function schacHomeOrganizationFromSubjectId(
    subjectId: string | undefined | null
): string | undefined {
    if (!subjectId || typeof subjectId !== "string") return undefined;
    const p = subjectId.trim();
    if (!p) return undefined;
    const at = p.lastIndexOf("@");
    if (at !== -1) {
        const scope = p.slice(at + 1).trim();
        if (scope) return scope;
    }
    return undefined;
}

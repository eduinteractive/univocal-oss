/**
 * Heuristik für „Heimateinrichtung“ aus der SAML pairwise-id, wenn kein schacHomeOrganization
 * vom IdP kommt. Typisch: scoped Identifier mit `@` (z. B. `…!…@idp.uni-example.de`).
 * Bei Bedarf Format an eure reale pairwise-id anpassen.
 */
export function schacHomeOrganizationFromPairwiseId(
    pairwiseId: string | undefined | null
): string | undefined {
    if (!pairwiseId || typeof pairwiseId !== "string") return undefined;
    const p = pairwiseId.trim();
    if (!p) return undefined;
    const at = p.lastIndexOf("@");
    if (at !== -1) {
        const scope = p.slice(at + 1).trim();
        if (scope) return scope;
    }
    return undefined;
}

import { SVHMetadataDoc } from "../types/SVHMetadata";

export const hasReadPermission = (doc: Partial<SVHMetadataDoc> | null, tenantId?: string, permissionLevel?: number) => {
    if (!doc || doc === null) {
        return false;
    }
    if (doc.tenantId?.toString() !== tenantId) {
        return false;
    }
    if (permissionLevel) {
        if (doc.viewAccess && doc.viewAccess > permissionLevel) {
            return false;
        }
    }
    return true;
}
import { GROUP_PERMISSION_LEVELS } from "../constants/Enums";

export const getMemberRoleLabel = (role: number | undefined) => {
    if (role === undefined || role === null) return "Unbekannt";
    return GROUP_PERMISSION_LEVELS.find((level) => level.value === role)?.label || "Unbekannt";
}
import { check } from "express-validator"

export const activateCalendarIcalChain = () => {
    return [
        check("tenantId").isMongoId(),
    ]
}

export const deactivateCalendarIcalChain = () => {
    return [
        check("tenantId").isMongoId(),
    ]
}

export const getCalendarEventsIcalChain = () => {
    return [
        check("tenantId").isMongoId(),
        check("icalToken").isString(),
    ]
}
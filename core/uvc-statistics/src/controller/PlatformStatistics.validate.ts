import { check } from "express-validator";

export const getLandingSummaryChain = () => {
    return [
        check("from").isISO8601().withMessage("Date From is invalid"),
        check("to").isISO8601().withMessage("Date To is invalid"),
        check("granularity").isIn(["daily", "weekly", "monthly"]).withMessage("Granularity is invalid"),
    ];
};

export const getLandingCampaignChain = () => {
    return [
        check("morigin").matches(/^[A-Za-z0-9]{1,32}$/).withMessage("morigin is invalid"),
    ];
};

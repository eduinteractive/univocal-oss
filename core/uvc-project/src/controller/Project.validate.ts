import { createSVHMetadataChain, updateSVHMetadataChain } from "@eduinteractive/uvc-common"
import { body, check } from "express-validator"

export const createProjectChain = () => {
    return [
        ...createSVHMetadataChain()
    ]
}

export const getProjectChain = () => {
    return [
        check('projectId').isMongoId().withMessage('Project ID must be a valid MongoDB ID')
    ]
}

export const updateProjectChain = () => {
    return [
        ...updateSVHMetadataChain(),
        check('projectId').isMongoId().withMessage('Project ID must be a valid MongoDB ID'),
        body('columns').optional().isArray().withMessage('Columns must be an array'),
        body('columns.*._id').optional({ values: "falsy" }).isMongoId().withMessage('Column ID must be a valid MongoDB ID'),
        body('columns.*.title').isString().withMessage('Column title must be a string'),
        body('columns.*.tasks').optional().isArray().withMessage('Tasks must be an array'),
        body('columns.*.tasks.*').isMongoId().withMessage('Task ID must be a valid MongoDB ID')
    ]
}

export const deleteProjectChain = () => {
    return [
        check('projectId').isMongoId().withMessage('Project ID must be a valid MongoDB ID')
    ]
}
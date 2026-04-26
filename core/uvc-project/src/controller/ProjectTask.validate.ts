import { body, check } from "express-validator"

export const createTaskChain = () => {
    return [
        check('projectId').isString().withMessage('Project ID must be a string'),
        body('title').isString().withMessage('Title must be a string'),
        body('description').optional().isString().withMessage('Description must be a string'),
        body('subtasks').optional().customSanitizer((value) => JSON.parse(value)).isArray().withMessage('Subtasks must be an array'),
        body('dueDate').optional({ values: "falsy" }).isISO8601().toDate().withMessage('Due date must be a string'),
        body('color').optional().isString().withMessage('Color must be a string'),
        body('owner').optional().isString().withMessage('Owner must be a string'),
        body('connectors').optional().customSanitizer((value) => JSON.parse(value)).isArray().withMessage('Connectors must be an array'),
        body('materials').customSanitizer((value) => JSON.parse(value)).isArray().withMessage('Materials must be an array'),
    ]
}

export const getTaskChain = () => {
    return [
        check('projectId').isString().withMessage('Project ID must be a string'),
        check('taskId').isString().withMessage('Task ID must be a string')
    ]
}

export const updateTaskChain = () => {
    return [
        check('projectId').isString().withMessage('Project ID must be a string'),
        check('taskId').isString().withMessage('Task ID must be a string'),
        body('title').optional().isString().withMessage('Title must be a string'),
        body('description').optional().isString().withMessage('Description must be a string'),
        body('subtasks').optional().customSanitizer((value) => JSON.parse(value)).isArray().withMessage('Subtasks must be an array'),
        body('dueDate').optional({ values: "falsy" }).isISO8601().toDate().withMessage('Due date must be a string'),
        body('color').optional().isString().withMessage('Color must be a string'),
        body('owner').optional().isString().withMessage('Owner must be a string'),
        body('connectors').optional().customSanitizer((value) => JSON.parse(value)).isArray().withMessage('Connectors must be an array'),
        body('materials').customSanitizer((value) => JSON.parse(value)).isArray().withMessage('Materials must be an array'),
    ]
}

export const deleteTaskChain = () => {
    return [
        check('projectId').isString().withMessage('Project ID must be a string'),
        check('taskId').isString().withMessage('Task ID must be a string')
    ]
}
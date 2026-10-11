import { AssignedProjectTask } from '@eduinteractive/uvc-api';
import dayjs from 'dayjs';

const DONE_COLUMN = 'erledigt';
const URGENT_HORIZON_DAYS = 14;

export const isCompletedAssignedTask = (task: AssignedProjectTask) =>
    task.columnTitle.trim().toLowerCase() === DONE_COLUMN;

export const isOverdueAssignedTask = (task: AssignedProjectTask) => {
    if (!task.dueDate || isCompletedAssignedTask(task)) {
        return false;
    }
    return dayjs(task.dueDate).startOf('day').isBefore(dayjs().startOf('day'));
};

export const isUrgentAssignedTask = (task: AssignedProjectTask) => {
    if (!task.dueDate || isCompletedAssignedTask(task)) {
        return false;
    }
    const dueDay = dayjs(task.dueDate).startOf('day');
    const horizon = dayjs().startOf('day').add(URGENT_HORIZON_DAYS, 'day');
    return dueDay.isBefore(horizon) || dueDay.isSame(horizon, 'day');
};

const compareByDueDate = (a: AssignedProjectTask, b: AssignedProjectTask) => {
    if (a.dueDate && b.dueDate) {
        return dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf();
    }
    if (a.dueDate) {
        return -1;
    }
    if (b.dueDate) {
        return 1;
    }
    return a.title.localeCompare(b.title, 'de');
};

export const sortAssignedTasks = (tasks: AssignedProjectTask[]) => {
    const open = tasks.filter((task) => !isCompletedAssignedTask(task)).sort(compareByDueDate);
    const done = tasks.filter((task) => isCompletedAssignedTask(task)).sort(compareByDueDate);
    return [...open, ...done];
};

export const urgentAssignedTasks = (tasks: AssignedProjectTask[]) =>
    tasks.filter(isUrgentAssignedTask).sort(compareByDueDate).slice(0, 5);

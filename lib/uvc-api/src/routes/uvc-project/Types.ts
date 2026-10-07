import { SVHMetadata } from "../base";

export enum ProjectConnector {
    BUDGET = 'BUDGET',
    WIKI = 'WIKI',
    EVENT = 'EVENT',
    SURVEY = 'SURVEY'
}

export interface ProjectSubtask {
    _id: string;
    title: string;
    description?: string;
    dueDate?: string;
    owner?: string;
    done?: boolean;
}

export interface ProjectTask {
    _id: string;
    title: string;
    description?: string;
    subtasks?: ProjectSubtask[];
    dueDate?: string;
    color?: string;
    owner?: string;
    connectors?: {
        origin: ProjectConnector;
        target: string;
    }[];
    materials: {
        title: string,
        link: string,
        mimetype: string
    }[];
    createdAt: Date;
    updatedAt: Date;
}

export interface AssignedProjectTask extends ProjectTask {
    projectId: string;
    projectTitle: string;
    columnTitle: string;
}

export interface ProjectPlanningCounts {
    tasks: number;
    open: number;
    done: number;
    overdue: number;
    dueSoon: number;
    unassigned: number;
}

export interface ProjectPlanningProject extends ProjectPlanningCounts {
    projectId: string;
    projectTitle: string;
}

export interface ProjectPlanning {
    totals: ProjectPlanningCounts & { projects: number };
    projects: ProjectPlanningProject[];
}

export interface ProjectTaskColumn {
    _id: string;
    title: string;
    tasks: ProjectTask[];
}

export interface Project extends SVHMetadata {
    _id: string;
    columns: ProjectTaskColumn[];
}
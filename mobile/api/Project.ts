import APIHandler, { createUVCMetadataAttrs, getUVCFilterParams, UVCFilterObject, UVCMetadata, updateUVCMetadataAttrs } from "./APIHandler";

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

export interface ProjectTaskColumn {
    _id: string;
    title: string;
    tasks: ProjectTask[];
}

export interface Project extends UVCMetadata {
    _id: string;
    columns: ProjectTaskColumn[];
}

interface getProjectsRequest {
    tenantId: string;
    params: UVCFilterObject | null;
}

export const getProjects = async (req: getProjectsRequest): Promise<Project[]> => {
    const response = await APIHandler.get(`/project/tenant/${req.tenantId}/project`, {
        params: getUVCFilterParams(req.params)
    });
    return response.data;
}

export interface getProjectRequest {
    tenantId: string;
    projectId: string;
}

export const getProject = async (req: getProjectRequest): Promise<Project> => {
    const response = await APIHandler.get(`/project/tenant/${req.tenantId}/project/${req.projectId}`);
    return response.data;
}

interface createProjectRequest {
    tenantId: string;
    body: createUVCMetadataAttrs
}

export const createProject = async (req: createProjectRequest): Promise<Project> => {
    const response = await APIHandler.post(`/project/tenant/${req.tenantId}/project`, req.body);
    return response.data;
}

interface updateProjectRequest {
    tenantId: string;
    projectId: string;
    body: updateUVCMetadataAttrs & {
        columns?: {
            _id: string;
            title: string;
            tasks: string[];
        }[]
    }
}

export const updateProject = async (req: updateProjectRequest): Promise<Project> => {
    const response = await APIHandler.put(`/project/tenant/${req.tenantId}/project/${req.projectId}`, req.body);
    return response.data;
}

interface deleteProjectRequest {
    tenantId: string;
    projectId: string;
}

export const deleteProject = async (req: deleteProjectRequest): Promise<void> => {
    const response = await APIHandler.delete(`/project/tenant/${req.tenantId}/project/${req.projectId}`);
    return response.data;
}

interface createTaskRequest {
    tenantId: string;
    projectId: string;
    body: {
        title: string;
        description?: string;
        subtasks?: {
            _id: string;
            title: string;
            description?: string;
            dueDate?: string;
            owner?: string;
            done?: boolean;
        }[];
        dueDate?: Date | string;
        color?: string;
        owner?: string;
        connectors?: {
            origin: string;
            target: string;
        }[];
        colId?: string;
        materials: {
            title: string,
            link: string,
            mimetype: string
        }[],
        newUploads?: File[]
    }
}

export const createTask = async (req: createTaskRequest): Promise<ProjectTask> => {
    const formData = new FormData();
    formData.append('title', req.body.title);
    if (req.body.description !== undefined) formData.append('description', req.body.description);
    if (req.body.subtasks !== undefined) formData.append('subtasks', JSON.stringify(req.body.subtasks));
    if (req.body.dueDate !== undefined) formData.append('dueDate', typeof req.body.dueDate === 'string' ? req.body.dueDate : req.body.dueDate.toISOString());
    if (req.body.color !== undefined) formData.append('color', req.body.color);
    if (req.body.owner !== undefined) formData.append('owner', req.body.owner);
    if (req.body.connectors !== undefined) formData.append('connectors', JSON.stringify(req.body.connectors));
    if (req.body.colId !== undefined) formData.append('colId', req.body.colId);
    if (req.body.materials !== undefined) formData.append('materials', JSON.stringify(req.body.materials));
    if (req.body.newUploads) {
        req.body.newUploads.forEach(file => {
            formData.append('newUploads', file, file.name);
        });
    }
    const response = await APIHandler.post(`/project/tenant/${req.tenantId}/project/${req.projectId}/task`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
}

interface getTaskRequest {
    tenantId: string;
    projectId: string;
    taskId: string;
}

export const getTask = async (req: getTaskRequest): Promise<ProjectTask> => {
    const response = await APIHandler.get(`/project/tenant/${req.tenantId}/project/${req.projectId}/task/${req.taskId}`);
    return response.data;
}

interface updateTaskRequest {
    tenantId: string;
    projectId: string;
    taskId: string;
    body: {
        title?: string;
        description?: string;
        subtasks?: {
            _id: string;
            title: string;
            description?: string;
            dueDate?: string;
            owner?: string;
            done?: boolean
        }[];
        dueDate?: Date | string;
        color?: string;
        owner?: string;
        connectors?: {
            origin: string;
            target: string;
        }[];
        materials: {
            title: string,
            link: string,
            mimetype: string
        }[]
        newUploads?: File[]
    }
}

export const updateTask = async (req: updateTaskRequest): Promise<ProjectTask> => {
    const formData = new FormData();
    if (req.body.title !== undefined) formData.append('title', req.body.title);
    if (req.body.description !== undefined) formData.append('description', req.body.description);
    if (req.body.subtasks !== undefined) formData.append('subtasks', JSON.stringify(req.body.subtasks));
    if (req.body.dueDate !== undefined) formData.append('dueDate', typeof req.body.dueDate === 'string' ? req.body.dueDate : req.body.dueDate.toISOString());
    if (req.body.color !== undefined) formData.append('color', req.body.color);
    if (req.body.owner !== undefined) formData.append('owner', req.body.owner);
    if (req.body.connectors !== undefined) formData.append('connectors', JSON.stringify(req.body.connectors));
    if (req.body.materials !== undefined) formData.append('materials', JSON.stringify(req.body.materials));
    if (req.body.newUploads) {
        req.body.newUploads.forEach(file => {
            formData.append('newUploads', file, file.name);
        });
    }
    const response = await APIHandler.put(`/project/tenant/${req.tenantId}/project/${req.projectId}/task/${req.taskId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
}

interface deleteTaskRequest {
    tenantId: string;
    projectId: string;
    taskId: string;
}

export const deleteTask = async (req: deleteTaskRequest): Promise<void> => {
    const response = await APIHandler.delete(`/project/tenant/${req.tenantId}/project/${req.projectId}/task/${req.taskId}`);
    return response.data;
}
import { APIHandler } from "../..";
import { SVHReport } from "./Types";

export const getReports = async () => {
    const response = await APIHandler.get('/chat/admin/report');
    return response.data as SVHReport[];
}

export const getReport = async (reportId: string) => {
    const response = await APIHandler.get(`/chat/admin/report/${reportId}`);
    return response.data as SVHReport;
}

interface updateReportRequest {
    reportId: string;
    body: {
        action: string;
        reason?: string;
    }
}

export const updateReport = async (req: updateReportRequest) => {
    const response = await APIHandler.put(`/chat/admin/report/${req.reportId}`, req.body);
    return response.data as SVHReport;
}
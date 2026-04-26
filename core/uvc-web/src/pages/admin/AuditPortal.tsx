import { Title } from "@mantine/core";
import SVHPageWrapper from "../../components/common/SVHPageWrapper";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SAPI } from "@eduinteractive/uvc-api";
import { NotificationHandler } from "@eduinteractive/mantine-common";
import SVHLoader from "../../components/common/SVHLoader";
import ReportsTable from "../../components/features/admin/ReportsTable";
import { useState, useMemo } from "react";
import { ReportStatus } from "@eduinteractive/uvc-api";

const AuditPortal = () => {
    const { t } = useTranslation();
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

    const reportsQuery = useQuery({
        queryKey: ['reports'],
        queryFn: () => SAPI.CHAT.ADMIN.getReports(),
    });

    // Fetch full report details when a report is selected
    const reportQuery = useQuery({
        queryKey: ['report', selectedReportId],
        queryFn: () => selectedReportId ? SAPI.CHAT.ADMIN.getReport(selectedReportId) : null,
        enabled: !!selectedReportId,
    });

    const updateReportMutation = useMutation({
        mutationFn: SAPI.CHAT.ADMIN.updateReport,
        onSuccess: () => {
            reportsQuery.refetch();
            reportQuery.refetch();
            NotificationHandler.showSuccess(t('ADMIN.AUDIT_PORTAL.SUCCESS.UPDATED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    // Split into pending and resolved, each sorted by creation date (newest first)
    const { pendingReports, resolvedReports } = useMemo(() => {
        if (!reportsQuery.data) {
            return { pendingReports: [], resolvedReports: [] };
        }
        const pending = reportsQuery.data
            .filter((r) => r.status === ReportStatus.PENDING)
            .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });
        const resolved = reportsQuery.data
            .filter((r) => r.status === ReportStatus.RESOLVED)
            .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });
        return { pendingReports: pending, resolvedReports: resolved };
    }, [reportsQuery.data]);

    if (reportsQuery.isLoading) {
        return <SVHLoader />;
    }

    if (reportsQuery.isError) {
        return (
            <SVHPageWrapper p="md">
                <Title order={3} c="blue" mb="sm">
                    {t('ADMIN.AUDIT_PORTAL.TITLE')}
                </Title>
                <div>Error: {reportsQuery.error?.message}</div>
            </SVHPageWrapper>
        );
    }

    return (
        <SVHPageWrapper p="md">
            <Title order={3} c="blue" mb="md">
                {t('ADMIN.AUDIT_PORTAL.TITLE')}
            </Title>
            <ReportsTable
                pendingReports={pendingReports}
                resolvedReports={resolvedReports}
                selectedReport={reportQuery.data || null}
                isLoadingReport={reportQuery.isLoading}
                onSelectReport={(reportId) => setSelectedReportId(reportId)}
                onCloseModal={() => setSelectedReportId(null)}
                onUpdate={(reportId, action, reason) => {
                    updateReportMutation.mutate({
                        reportId,
                        body: {
                            action,
                            reason,
                        },
                    });
                }}
            />
        </SVHPageWrapper>
    );
};

export default AuditPortal;
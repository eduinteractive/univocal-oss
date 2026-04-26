import { Title, Card, Text, Grid, Group, NumberFormatter, Select, Stack, Loader, Alert, Table, ScrollArea } from "@mantine/core";
import { LineChart } from "@mantine/charts";
import SVHPageWrapper from "../../components/common/SVHPageWrapper";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { SAPI, TimeSeriesType, TimeSeries } from "@eduinteractive/uvc-api";
import { useState, useMemo } from "react";
import { IconAlertCircle } from "@tabler/icons-react";

// Helper to get ISO week number for a date
const getISOWeek = (date: Date): { year: number; week: number } => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return { year: d.getUTCFullYear(), week: weekNo };
};

// Helper to get the last ISO week of a year (52 or 53)
const getLastWeekOfYear = (year: number): number => {
    // Check if December 28th is in week 53
    const dec28 = new Date(year, 11, 28);
    const weekOfDec28 = getISOWeek(dec28);
    if (weekOfDec28.year === year && weekOfDec28.week === 53) {
        return 53;
    }
    // Check if December 31st is in week 1 of next year
    const dec31 = new Date(year, 11, 31);
    const weekOfDec31 = getISOWeek(dec31);
    if (weekOfDec31.year > year) {
        // December 31 is in week 1 of next year, so this year has 52 weeks
        return 52;
    }
    // Otherwise, check the week of December 28
    return weekOfDec28.week;
};

// Helper to convert week format (YYYY-WXX) to date range format (YYYY-MM-DD - YYYY-MM-DD)
const weekToDateRange = (weekStr: string): string => {
    const parts = weekStr.split('-W');
    if (parts.length !== 2) return weekStr;
    const year = parseInt(parts[0], 10);
    const week = parseInt(parts[1], 10);
    if (isNaN(year) || isNaN(week)) return weekStr;
    
    // Use UTC directly to avoid timezone issues
    const approxDate = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
    const targetDate = new Date(approxDate);
    let found = false;
    let attempts = 0;
    
    while (!found && attempts < 15) {
        const testWeek = getISOWeek(targetDate);
        if (testWeek.year === year && testWeek.week === week) {
            found = true;
        } else {
            const daysDiff = (week - testWeek.week) * 7;
            targetDate.setUTCDate(targetDate.getUTCDate() + daysDiff);
            attempts++;
        }
    }
    
    const dayOfWeek = targetDate.getUTCDay() || 7;
    const daysToSunday = dayOfWeek === 7 ? 0 : 7 - dayOfWeek;
    
    const weekEndUTC = new Date(targetDate);
    weekEndUTC.setUTCDate(targetDate.getUTCDate() + daysToSunday);
    
    const weekStartUTC = new Date(weekEndUTC);
    weekStartUTC.setUTCDate(weekEndUTC.getUTCDate() - 6);
    
    // Format directly from UTC to avoid timezone conversion issues
    const startStr = `${weekStartUTC.getUTCFullYear()}-${String(weekStartUTC.getUTCMonth() + 1).padStart(2, '0')}-${String(weekStartUTC.getUTCDate()).padStart(2, '0')}`;
    const endStr = `${weekEndUTC.getUTCFullYear()}-${String(weekEndUTC.getUTCMonth() + 1).padStart(2, '0')}-${String(weekEndUTC.getUTCDate()).padStart(2, '0')}`;
    
    return `${startStr} - ${endStr}`;
};

// Helper to generate X-axis data points based on time series type
const generateXAxisDataPoints = (timeSeriesType: TimeSeriesType): string[] => {
    const now = new Date();
    const dataPoints: string[] = [];

    if (timeSeriesType === 'daily') {
        // Last 14 days
        for (let i = 13; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            dataPoints.push(date.toISOString().split('T')[0]);
        }
    } else if (timeSeriesType === 'weekly') {
        // Last 8 weeks including the current week (even if partially in the future)
        const currentWeek = getISOWeek(now);
        let currentYear = currentWeek.year;
        let currentWeekNum = currentWeek.week;
        
        // Generate 8 weeks starting from the current week going backwards
        for (let i = 0; i < 8; i++) {
            const weekStr = `${currentYear}-W${currentWeekNum.toString().padStart(2, '0')}`;
            dataPoints.push(weekToDateRange(weekStr));
            
            // Go to previous week
            currentWeekNum--;
            if (currentWeekNum < 1) {
                // Go to last week of previous year
                currentYear--;
                // Get the last week of the previous year
                const lastWeekOfYear = getLastWeekOfYear(currentYear);
                currentWeekNum = lastWeekOfYear;
            }
        }
        
        // Reverse to show oldest to newest
        dataPoints.reverse();
    } else if (timeSeriesType === 'monthly') {
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            dataPoints.push(`${year}-${month.toString().padStart(2, '0')}`);
        }
    }

    return dataPoints;
};

// Helper to calculate date range for filtering (min and max dates)
const getDateRangeForTimeSeries = (timeSeriesType: TimeSeriesType): { dateFrom: string; dateTo: string } => {
    const now = new Date();
    
    if (timeSeriesType === 'daily') {
        // Last 14 days
        const dateFrom = new Date(now);
        dateFrom.setDate(dateFrom.getDate() - 13);
        return {
            dateFrom: dateFrom.toISOString().split('T')[0],
            dateTo: now.toISOString().split('T')[0]
        };
    } else if (timeSeriesType === 'weekly') {
        // Last 8 weeks - calculate from current week going back 7 weeks
        const currentWeek = getISOWeek(now);
        let targetYear = currentWeek.year;
        let targetWeek = currentWeek.week - 7;
        
        if (targetWeek < 1) {
            targetYear--;
            const lastWeekOfYear = getLastWeekOfYear(targetYear);
            targetWeek = lastWeekOfYear + targetWeek;
        }
        
        // Get the Monday of the oldest week we need
        const oldestWeekStr = `${targetYear}-W${targetWeek.toString().padStart(2, '0')}`;
        const oldestWeekRange = weekToDateRange(oldestWeekStr);
        const dateFrom = oldestWeekRange.split(' - ')[0];
        
        // Get the Sunday of the current week
        const currentWeekStr = `${currentWeek.year}-W${currentWeek.week.toString().padStart(2, '0')}`;
        const currentWeekRange = weekToDateRange(currentWeekStr);
        const dateTo = currentWeekRange.split(' - ')[1];
        
        return { dateFrom, dateTo };
    } else if (timeSeriesType === 'monthly') {
        // Last 12 months
        const dateFrom = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        const dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
        return {
            dateFrom: dateFrom.toISOString().split('T')[0],
            dateTo: dateTo.toISOString().split('T')[0]
        };
    }
    
    // Fallback
    return {
        dateFrom: new Date(0).toISOString().split('T')[0],
        dateTo: now.toISOString().split('T')[0]
    };
};

// Helper to merge query data into predefined data points
const mergeDataIntoDataPoints = (
    dataPoints: string[],
    queryData: { date: string; count: number }[],
    timeSeriesType: TimeSeriesType
): { date: string; count: number }[] => {
    const dataMap = new Map<string, number>();
    queryData.forEach(item => {
        if (item.date) {
            // For weekly data, convert from "YYYY-WXX" to date range format for matching
            if (timeSeriesType === 'weekly' && item.date.includes('-W')) {
                const dateRange = weekToDateRange(item.date);
                dataMap.set(dateRange, item.count);
            } else {
                dataMap.set(item.date, item.count);
            }
        }
    });

    return dataPoints.map(date => ({
        date,
        count: dataMap.get(date) || 0
    }));
};

const AdminDashboard = () => {
    const { t } = useTranslation();
    const [timeSeries, setTimeSeries] = useState<TimeSeriesType>('monthly');

    // Calculate date range for filtering
    const dateRange = useMemo(() => {
        const selectedSeries = timeSeries === 'all' ? 'monthly' : timeSeries;
        return getDateRangeForTimeSeries(selectedSeries);
    }, [timeSeries]);

    const authStatisticsQuery = useQuery({
        queryKey: ['authStatistics', timeSeries, dateRange.dateFrom, dateRange.dateTo],
        queryFn: () => SAPI.AUTH.ADMIN.getAuthStatistics({ 
            timeSeries,
            dateFrom: dateRange.dateFrom,
            dateTo: dateRange.dateTo
        }),
    });

    const tenantStatisticsQuery = useQuery({
        queryKey: ['tenantStatistics', timeSeries, dateRange.dateFrom, dateRange.dateTo],
        queryFn: () => SAPI.TENANT.ADMIN.getTenantStatistics({ 
            timeSeries,
            dateFrom: dateRange.dateFrom,
            dateTo: dateRange.dateTo
        }),
    });

    // Calculate statistics for first row
    const firstRowStats = useMemo(() => {
        if (!authStatisticsQuery.data) return null;

        const groupStats = authStatisticsQuery.data.groupStatistics;
        const userCounts = groupStats.map(g => g.userCount).filter(count => count > 0);
        
        // Calculate median
        const sortedCounts = [...userCounts].sort((a, b) => a - b);
        const median = sortedCounts.length > 0
            ? sortedCounts.length % 2 === 0
                ? (sortedCounts[sortedCounts.length / 2 - 1] + sortedCounts[sortedCounts.length / 2]) / 2
                : sortedCounts[Math.floor(sortedCounts.length / 2)]
            : 0;

        return {
            totalUsers: authStatisticsQuery.data.totalUsers,
            medianTenantSize: median,
            tenantsWithUsers: groupStats.filter(g => g.userCount > 0).length
        };
    }, [authStatisticsQuery.data]);

    // Extract total counts from tenant statistics
    const totalCounts = useMemo(() => {
        if (!tenantStatisticsQuery.data) return null;

        const data = tenantStatisticsQuery.data;
        return {
            calendarEvents: 'error' in data.calendar ? 0 : data.calendar.totalEvents,
            events: 'error' in data.event ? 0 : data.event.totalEvents,
            contacts: 'error' in data.knowledge ? 0 : data.knowledge.totalContacts,
            wikis: 'error' in data.knowledge ? 0 : data.knowledge.totalWikis,
            news: 'error' in data.profile ? 0 : data.profile.totalNews,
            profileProjects: 'error' in data.profile ? 0 : data.profile.totalProjects,
            projects: 'error' in data.project ? 0 : data.project.totalProjects,
            surveys: 'error' in data.survey ? 0 : data.survey.totalSurveys,
            budgets: 'error' in data.budget ? 0 : data.budget.totalBudgets,
        };
    }, [tenantStatisticsQuery.data]);

    // Prepare tenant list for table (filter and sort)
    const tenantList = useMemo(() => {
        if (!authStatisticsQuery.data) return [];

        return authStatisticsQuery.data.groupStatistics
            .filter(tenant => tenant.userCount > 0)
            .sort((a, b) => b.userCount - a.userCount);
    }, [authStatisticsQuery.data]);

    // Prepare registration data for second row
    const registrationData = useMemo(() => {
        const selectedSeries = timeSeries === 'all' ? 'monthly' : timeSeries;
        const dataPoints = generateXAxisDataPoints(selectedSeries);
        
        if (!authStatisticsQuery.data?.registrations) {
            return dataPoints.map(date => ({ date, count: 0 }));
        }
        
        const rawData = authStatisticsQuery.data.registrations[selectedSeries] || [];
        return mergeDataIntoDataPoints(dataPoints, rawData, selectedSeries);
    }, [authStatisticsQuery.data, timeSeries]);

    // Prepare multi-line chart data for third row
    const multiLineData = useMemo(() => {
        const selectedSeries = timeSeries === 'all' ? 'monthly' : timeSeries;
        const dataPoints = generateXAxisDataPoints(selectedSeries);
        const datasets: { name: string; color: string; data: Map<string, number> }[] = [];

        if (!tenantStatisticsQuery.data) {
            return { data: dataPoints.map(date => ({ date })), series: [] };
        }

        // Collect data from all services
        // Handle knowledge separately (contacts and wikis as separate lines)
        const knowledgeData = tenantStatisticsQuery.data.knowledge;
        if (knowledgeData && !('error' in knowledgeData)) {
            const knowledgeStats = knowledgeData as { contacts?: TimeSeries, wikis?: TimeSeries };
            
            // Contacts line
            const contactsData = knowledgeStats.contacts?.[selectedSeries] || [];
            const contactsMap = new Map<string, number>();
            contactsData.forEach(item => {
                if (item.date) {
                    // Convert week format to date range format for weekly data
                    const dateKey = selectedSeries === 'weekly' && item.date.includes('-W') 
                        ? weekToDateRange(item.date) 
                        : item.date;
                    contactsMap.set(dateKey, item.count);
                }
            });
            datasets.push({
                name: t('ADMIN.STATISTICS.KNOWLEDGE_CONTACTS'),
                color: 'green',
                data: contactsMap
            });
            
            // Wikis line
            const wikisData = knowledgeStats.wikis?.[selectedSeries] || [];
            const wikisMap = new Map<string, number>();
            wikisData.forEach(item => {
                if (item.date) {
                    const dateKey = selectedSeries === 'weekly' && item.date.includes('-W') 
                        ? weekToDateRange(item.date) 
                        : item.date;
                    wikisMap.set(dateKey, item.count);
                }
            });
            datasets.push({
                name: t('ADMIN.STATISTICS.KNOWLEDGE_WIKIS'),
                color: 'teal',
                data: wikisMap
            });
        }

        // Handle profile separately (news and projects as separate lines)
        const profileData = tenantStatisticsQuery.data.profile;
        if (profileData && !('error' in profileData)) {
            const profileStats = profileData as { news?: TimeSeries, projects?: TimeSeries };
            
            // News line
            const newsData = profileStats.news?.[selectedSeries] || [];
            const newsMap = new Map<string, number>();
            newsData.forEach(item => {
                if (item.date) {
                    const dateKey = selectedSeries === 'weekly' && item.date.includes('-W') 
                        ? weekToDateRange(item.date) 
                        : item.date;
                    newsMap.set(dateKey, item.count);
                }
            });
            datasets.push({
                name: t('ADMIN.STATISTICS.PROFILE_NEWS'),
                color: 'purple',
                data: newsMap
            });
            
            // Projects line
            const projectsData = profileStats.projects?.[selectedSeries] || [];
            const projectsMap = new Map<string, number>();
            projectsData.forEach(item => {
                if (item.date) {
                    const dateKey = selectedSeries === 'weekly' && item.date.includes('-W') 
                        ? weekToDateRange(item.date) 
                        : item.date;
                    projectsMap.set(dateKey, item.count);
                }
            });
            datasets.push({
                name: t('ADMIN.STATISTICS.PROFILE_PROJECTS'),
                color: 'violet',
                data: projectsMap
            });
        }

        // Handle other services
        const otherServices = [
            { key: 'calendar', name: t('ADMIN.STATISTICS.CALENDAR'), color: 'blue', dataKey: 'events' },
            { key: 'event', name: t('ADMIN.STATISTICS.EVENT'), color: 'orange', dataKey: 'events' },
            { key: 'project', name: t('ADMIN.STATISTICS.PROJECT'), color: 'cyan', dataKey: 'projects' },
            { key: 'survey', name: t('ADMIN.STATISTICS.SURVEY'), color: 'pink', dataKey: 'surveys' },
            { key: 'budget', name: t('ADMIN.STATISTICS.BUDGET'), color: 'red', dataKey: 'budgets' }
        ];

        otherServices.forEach(service => {
            const serviceData = tenantStatisticsQuery.data[service.key as keyof typeof tenantStatisticsQuery.data];
            if ('error' in serviceData) return;

            const serviceStats = serviceData as { events?: TimeSeries } | { projects?: TimeSeries } | { surveys?: TimeSeries } | { budgets?: TimeSeries };
            const timeSeriesObj = service.dataKey === 'events' ? (serviceStats as { events?: TimeSeries }).events :
                                 service.dataKey === 'projects' ? (serviceStats as { projects?: TimeSeries }).projects :
                                 service.dataKey === 'surveys' ? (serviceStats as { surveys?: TimeSeries }).surveys :
                                 (serviceStats as { budgets?: TimeSeries }).budgets;
            const timeSeriesData = timeSeriesObj?.[selectedSeries] || [];

            const dataMap = new Map<string, number>();
            timeSeriesData.forEach(item => {
                if (item.date) {
                    const dateKey = selectedSeries === 'weekly' && item.date.includes('-W') 
                        ? weekToDateRange(item.date) 
                        : item.date;
                    dataMap.set(dateKey, item.count);
                }
            });
            datasets.push({
                name: service.name,
                color: service.color,
                data: dataMap
            });
        });

        // Merge all datasets into a single array for LineChart using predefined data points
        const mergedData = dataPoints.map(date => {
            const entry: Record<string, string | number> = { date };
            datasets.forEach(dataset => {
                entry[dataset.name] = dataset.data.get(date) || 0;
            });
            return entry;
        });

        const series = datasets.map(dataset => ({
            name: dataset.name,
            color: dataset.color,
            label: dataset.name
        }));

        return { data: mergedData, series };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantStatisticsQuery.data, timeSeries, t]);

    if (authStatisticsQuery.isLoading || tenantStatisticsQuery.isLoading) {
        return (
            <SVHPageWrapper p="md">
                <Group justify="center" mt="xl">
                    <Loader size="lg" />
                </Group>
            </SVHPageWrapper>
        );
    }

    if (authStatisticsQuery.isError || tenantStatisticsQuery.isError) {
        return (
            <SVHPageWrapper p="md">
                <Alert icon={<IconAlertCircle />} title={t('ADMIN.STATISTICS.ERROR_TITLE')} color="red">
                    {t('ADMIN.STATISTICS.ERROR_DESCRIPTION')}
                </Alert>
            </SVHPageWrapper>
        );
    }

    return (
        <SVHPageWrapper p="md">
            <Stack gap="lg" pb="xl">
                <Title order={3} c="blue">
                    {t('ADMIN.DASHBOARD_TITLE')}
                </Title>

                {/* Configuration Row */}
                <Card shadow="sm" padding="md" radius="md" withBorder>
                    <Group justify="flex-start" align="flex-end" gap="md">
                        <Select
                            label={t('ADMIN.STATISTICS.TIME_SERIES_LABEL')}
                            value={timeSeries}
                            onChange={(value) => setTimeSeries((value as TimeSeriesType) || 'monthly')}
                            data={[
                                { value: 'daily', label: t('ADMIN.STATISTICS.TIME_SERIES_DAILY') },
                                { value: 'weekly', label: t('ADMIN.STATISTICS.TIME_SERIES_WEEKLY') },
                                { value: 'monthly', label: t('ADMIN.STATISTICS.TIME_SERIES_MONTHLY') },
                            ]}
                            w={200}
                        />
                    </Group>
                </Card>

                {/* First Row: Key Metrics */}
                <Grid>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Text size="sm" c="dimmed" mb="xs">
                                {t('ADMIN.STATISTICS.TOTAL_USERS')}
                            </Text>
                            <Text size="xl" fw={700}>
                                <NumberFormatter value={firstRowStats?.totalUsers || 0} thousandSeparator="." decimalSeparator="," />
                            </Text>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Text size="sm" c="dimmed" mb="xs">
                                {t('ADMIN.STATISTICS.MEDIAN_TENANT_SIZE')}
                            </Text>
                            <Text size="xl" fw={700}>
                                <NumberFormatter value={firstRowStats?.medianTenantSize || 0} thousandSeparator="." decimalSeparator="," decimalScale={1} />
                            </Text>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Text size="sm" c="dimmed" mb="xs">
                                {t('ADMIN.STATISTICS.TENANTS_WITH_USERS')}
                            </Text>
                            <Text size="xl" fw={700}>
                                <NumberFormatter value={firstRowStats?.tenantsWithUsers || 0} thousandSeparator="." decimalSeparator="," />
                            </Text>
                        </Card>
                    </Grid.Col>
                </Grid>

                {/* Second Row: Total Counts */}
                <Grid>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Text size="sm" c="dimmed" mb="xs">
                                {t('ADMIN.STATISTICS.TOTAL_CALENDAR_EVENTS')}
                            </Text>
                            <Text size="xl" fw={700}>
                                <NumberFormatter value={totalCounts?.calendarEvents || 0} thousandSeparator="." decimalSeparator="," />
                            </Text>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Text size="sm" c="dimmed" mb="xs">
                                {t('ADMIN.STATISTICS.TOTAL_EVENTS')}
                            </Text>
                            <Text size="xl" fw={700}>
                                <NumberFormatter value={totalCounts?.events || 0} thousandSeparator="." decimalSeparator="," />
                            </Text>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Text size="sm" c="dimmed" mb="xs">
                                {t('ADMIN.STATISTICS.TOTAL_CONTACTS')}
                            </Text>
                            <Text size="xl" fw={700}>
                                <NumberFormatter value={totalCounts?.contacts || 0} thousandSeparator="." decimalSeparator="," />
                            </Text>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Text size="sm" c="dimmed" mb="xs">
                                {t('ADMIN.STATISTICS.TOTAL_WIKIS')}
                            </Text>
                            <Text size="xl" fw={700}>
                                <NumberFormatter value={totalCounts?.wikis || 0} thousandSeparator="." decimalSeparator="," />
                            </Text>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Text size="sm" c="dimmed" mb="xs">
                                {t('ADMIN.STATISTICS.TOTAL_NEWS')}
                            </Text>
                            <Text size="xl" fw={700}>
                                <NumberFormatter value={totalCounts?.news || 0} thousandSeparator="." decimalSeparator="," />
                            </Text>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Text size="sm" c="dimmed" mb="xs">
                                {t('ADMIN.STATISTICS.TOTAL_PROFILE_PROJECTS')}
                            </Text>
                            <Text size="xl" fw={700}>
                                <NumberFormatter value={totalCounts?.profileProjects || 0} thousandSeparator="." decimalSeparator="," />
                            </Text>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Text size="sm" c="dimmed" mb="xs">
                                {t('ADMIN.STATISTICS.TOTAL_PROJECTS')}
                            </Text>
                            <Text size="xl" fw={700}>
                                <NumberFormatter value={totalCounts?.projects || 0} thousandSeparator="." decimalSeparator="," />
                            </Text>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Text size="sm" c="dimmed" mb="xs">
                                {t('ADMIN.STATISTICS.TOTAL_SURVEYS')}
                            </Text>
                            <Text size="xl" fw={700}>
                                <NumberFormatter value={totalCounts?.surveys || 0} thousandSeparator="." decimalSeparator="," />
                            </Text>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Text size="sm" c="dimmed" mb="xs">
                                {t('ADMIN.STATISTICS.TOTAL_BUDGETS')}
                            </Text>
                            <Text size="xl" fw={700}>
                                <NumberFormatter value={totalCounts?.budgets || 0} thousandSeparator="." decimalSeparator="," />
                            </Text>
                        </Card>
                    </Grid.Col>
                </Grid>

                {/* Third Row: Registration History */}
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Title order={4} mb="md">
                        {t('ADMIN.STATISTICS.REGISTRATIONS_TITLE')}
                    </Title>
                    {registrationData.length > 0 ? (
                        <LineChart
                            h={300}
                            data={registrationData}
                            dataKey="date"
                            series={[
                                {
                                    name: 'count',
                                    color: 'blue',
                                    label: t('ADMIN.STATISTICS.REGISTRATIONS_LABEL')
                                }
                            ]}
                            curveType="linear"
                            yAxisProps={{ domain: [0, 'auto'] }}
                        />
                    ) : (
                        <Text c="dimmed" ta="center" py="xl">
                            {t('COMMON.DATA_EMPTY')}
                        </Text>
                    )}
                </Card>

                {/* Fourth Row: Multi-line Chart for all services */}
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Title order={4} mb="md">
                        {t('ADMIN.STATISTICS.SERVICES_TITLE')}
                    </Title>
                    {multiLineData.data.length > 0 ? (
                        <LineChart
                            h={400}
                            data={multiLineData.data}
                            dataKey="date"
                            series={multiLineData.series}
                            curveType="linear"
                            yAxisProps={{ domain: [0, 'auto'] }}
                        />
                    ) : (
                        <Text c="dimmed" ta="center" py="xl">
                            {t('COMMON.DATA_EMPTY')}
                        </Text>
                    )}
                </Card>

                {/* Fifth Row: Tenant List Table */}
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Title order={4} mb="md">
                        {t('ADMIN.STATISTICS.TENANT_LIST_TITLE')}
                    </Title>
                    {tenantList.length > 0 ? (
                        <ScrollArea>
                            <Table striped highlightOnHover withTableBorder withColumnBorders>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>{t('ADMIN.STATISTICS.TENANT_NAME')}</Table.Th>
                                        <Table.Th style={{ textAlign: 'right' }}>{t('ADMIN.STATISTICS.TENANT_USER_COUNT')}</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {tenantList.map((tenant) => (
                                        <Table.Tr key={tenant.tenantId}>
                                            <Table.Td>{tenant.tenantTitle}</Table.Td>
                                            <Table.Td style={{ textAlign: 'right' }}>
                                                <NumberFormatter value={tenant.userCount} thousandSeparator="." decimalSeparator="," />
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </ScrollArea>
                    ) : (
                        <Text c="dimmed" ta="center" py="xl">
                            {t('COMMON.DATA_EMPTY')}
                        </Text>
                    )}
                </Card>
            </Stack>
        </SVHPageWrapper>
    )
}

export default AdminDashboard;
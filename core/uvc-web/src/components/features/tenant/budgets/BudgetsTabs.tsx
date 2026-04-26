import { Tabs } from "@mantine/core"
import { IconChartBar, IconMoneybag } from "@tabler/icons-react"
import { useTranslation } from "react-i18next";

interface BudgetsTabsProps {
    statisticsTab: React.ReactNode;
    budgetsTab: React.ReactNode;
}

const BudgetsTabs = (props: BudgetsTabsProps) => {
    const { t } = useTranslation();
    
    return (
        <Tabs defaultValue="statistics">
            <Tabs.List>
                <Tabs.Tab value="statistics" leftSection={<IconChartBar />}>{t("BUDGET.TAB_OVERVIEW")}</Tabs.Tab>
                <Tabs.Tab value="budgets" leftSection={<IconMoneybag />}>{t("BUDGET.TAB_BUDGETS")}</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="statistics" p="md">
                {props.statisticsTab}
            </Tabs.Panel>
            <Tabs.Panel value="budgets" p="md">
                {props.budgetsTab}
            </Tabs.Panel>
        </Tabs>
    )
}

export default BudgetsTabs;
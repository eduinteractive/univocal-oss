import { Budget, BudgetPosition, BudgetReceipt } from "@eduinteractive/uvc-api";
import BudgetGroup from "./BudgetGroup";
import { BudgetGroupsWithPosition } from "./BudgetGroups";

interface BudgetGroupListProps {
    budget: Budget;
    data: BudgetGroupsWithPosition[];
    ist_active?: boolean;
    receipt_active?: boolean;
    receipts?: BudgetReceipt[];
    onAdd: (parent: string) => void;
    onEdit: (position: BudgetPosition) => void;
    onDelete: (positionId: string) => void;
}

const BudgetGroupList = (props: BudgetGroupListProps) => {
    return (
        <>
            {props.data.map((group) => (
                <BudgetGroup
                    ist_active={props.ist_active}
                    receipt_active={props.receipt_active}
                    receipts={props.receipts}
                    key={group.group._id}
                    budget={props.budget}
                    group={group.group}
                    positions={group.positions}
                    onAdd={props.onAdd}
                    onEdit={props.onEdit}
                    onDelete={props.onDelete}
                />
            ))}
        </>
    )
}

export default BudgetGroupList;

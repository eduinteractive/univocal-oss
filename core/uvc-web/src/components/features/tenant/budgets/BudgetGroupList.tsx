import { Budget, BudgetPosition } from "@eduinteractive/uvc-api";
import BudgetGroup from "./BudgetGroup";
import { BudgetGroupsWithPosition } from "./BudgetGroups";

interface BudgetGroupListProps {
    budget: Budget;
    data: BudgetGroupsWithPosition[];
    ist_active?: boolean;
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
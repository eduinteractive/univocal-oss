import KnowledgeTabs from "../../../components/features/tenant/knowledge/KnowledgeTabs";
import ContactGroups from "./ContactGroups";
import Wikis from "./Wikis";

const Knowledge = () => {
    return (
        <>
            <KnowledgeTabs
                wikisTab={<Wikis />}
                contactsTab={<ContactGroups />}
            />
        </>
    )
}

export default Knowledge;
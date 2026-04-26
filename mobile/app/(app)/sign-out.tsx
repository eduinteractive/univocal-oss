import SVHLoader from "@/components/common/SVHLoader";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const SignOut = () => {
    const { signOut } = useAuth();
    
    useEffect(() => {
        signOut();
    }, []);

    return (
        <SVHLoader />
    )
}

export default SignOut;
import UVCLoader from "@/components/common/UVCLoader";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const SignOut = () => {
    const { signOut } = useAuth();
    
    useEffect(() => {
        signOut();
    }, []);

    return (
        <UVCLoader />
    )
}

export default SignOut;
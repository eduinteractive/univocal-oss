import { Suspense } from 'react';
import SVHLoader from './SVHLoader';

interface SVHSuspenseProps {
    children: React.ReactNode;
}

const SVHSuspense = (props: SVHSuspenseProps) => {
    return (
        <Suspense
            fallback={
                <SVHLoader />
            }
        >
            {props.children}
        </Suspense>
    );
};

export default SVHSuspense;

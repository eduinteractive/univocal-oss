import { Navigate, useParams } from 'react-router-dom';

const EventProgram = () => {
    const { eventId } = useParams();
    return <Navigate to={`/event/${eventId}#program`} replace />;
};

export default EventProgram;

import { lazy, type JSX } from 'react';
import { Route, Routes } from 'react-router-dom';
import SVHSuspense from '../components/common/SVHSuspense';

const PublicSite = lazy(() => import('../pages/site/PublicSite'));
const SurveyTransaction = lazy(() => import('../pages/SurveyTransaction'));
const EventRegistration = lazy(() => import('../pages/EventRegistration'));
const EventProgram = lazy(() => import('../pages/EventProgram'));

interface SiteHostRouterProps {
    subdomain: string;
}

/** Router for `{subdomain}.{base domain}`: only the public group site and public flows. */
const SiteHostRouter = ({ subdomain }: SiteHostRouterProps): JSX.Element => (
    <Routes>
        <Route
            path="/survey-transaction/:surveyId"
            element={
                <SVHSuspense>
                    <SurveyTransaction />
                </SVHSuspense>
            }
        />
        <Route
            path="/event-registration/:eventId"
            element={
                <SVHSuspense>
                    <EventRegistration />
                </SVHSuspense>
            }
        />
        <Route
            path="/event-program/:eventId"
            element={
                <SVHSuspense>
                    <EventProgram />
                </SVHSuspense>
            }
        />
        <Route
            path="/*"
            element={
                <SVHSuspense>
                    <PublicSite hostSubdomain={subdomain} />
                </SVHSuspense>
            }
        />
    </Routes>
);

export default SiteHostRouter;

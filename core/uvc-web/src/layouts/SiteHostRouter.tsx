import { lazy, type JSX } from 'react';
import { Route, Routes } from 'react-router-dom';
import SVHSuspense from '../components/common/SVHSuspense';

const PublicSite = lazy(() => import('../pages/site/PublicSite'));
const SurveyTransaction = lazy(() => import('../pages/SurveyTransaction'));
const SurveyPublicResults = lazy(() => import('../pages/SurveyPublicResults'));
const EventRegistration = lazy(() => import('../pages/EventRegistration'));
const EventProgram = lazy(() => import('../pages/EventProgram'));
const PublicEvent = lazy(() => import('../pages/PublicEvent'));

interface SiteHostRouterProps {
    subdomain: string;
}

/** Router for `{subdomain}.{base domain}`: only the public group site and public flows. */
const SiteHostRouter = ({ subdomain }: SiteHostRouterProps): JSX.Element => (
    <Routes>
        <Route
            path="/survey-transaction/:surveyId/results"
            element={
                <SVHSuspense>
                    <SurveyPublicResults />
                </SVHSuspense>
            }
        />
        <Route
            path="/survey-transaction/:surveyId"
            element={
                <SVHSuspense>
                    <SurveyTransaction />
                </SVHSuspense>
            }
        />
        <Route
            path="/event/:eventId"
            element={
                <SVHSuspense>
                    <PublicEvent />
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

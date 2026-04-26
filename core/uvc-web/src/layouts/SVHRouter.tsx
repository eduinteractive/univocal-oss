import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import SVHAppShell from './SVHAppShell';
import { AUTH_FORM_STATE } from '../constants/Enums';
import { PERMISSION_LEVEL } from '@eduinteractive/uvc-api';
import SVHSuspense from '../components/common/SVHSuspense';
import RequireLogin from '../middleware/RequireLogin';
import RequireSocket from '../middleware/RequireSocket';
import RequireTenant from '../middleware/RequireTenant';
import InitTenant from '../middleware/InitTenant';
const Verify = lazy(() => import('../pages/Verify'));
const Domains = lazy(() => import('../pages/domain/Domains'));
const Domain = lazy(() => import('../pages/domain/Domain'));
const Authentification = lazy(() => import('../pages/Authentification'));
const RequirePermission = lazy(() => import('../middleware/RequirePermission'));
const Tenants = lazy(() => import('../pages/admin/Tenants'));
const Tenant = lazy(() => import('../pages/admin/Tenant'));
const AdminDomains = lazy(() => import('../pages/admin/Domains'));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminReports = lazy(() => import('../pages/admin/AuditPortal'));
const AdminUsers = lazy(() => import('../pages/admin/Users'));
const AdminUser = lazy(() => import('../pages/admin/User'));
const Settings = lazy(() => import('../pages/tenant/Settings'));
const Members = lazy(() => import('../pages/tenant/Members'));
const Profile = lazy(() => import('../pages/tenant/Profile'));
const Calendar = lazy(() => import('../pages/tenant/Calendar'));
const News = lazy(() => import('../pages/tenant/profile/News'));
const TenantProjects = lazy(() => import('../pages/tenant/profile/Projects'));
const Dashboard = lazy(() => import('../pages/tenant/Dashboard'));
const Chat = lazy(() => import('../pages/user/Chat'));
const GroupChat = lazy(() => import('../pages/tenant/GroupChat'));
const Notifications = lazy(() => import('../pages/tenant/Notifications'));
const Invitations = lazy(() => import('../pages/user/Invitations'));
const Homepage = lazy(() => import('../pages/Homepage'));
const MyAccount = lazy(() => import('../pages/user/MyAccount'));
const Chats = lazy(() => import('../pages/user/Chats'));
const NewChat = lazy(() => import('../pages/user/NewChat'));
const Budgets = lazy(() => import('../pages/tenant/budgets/Budgets'));
const Budget = lazy(() => import('../pages/tenant/budgets/Budget'));
const Knowledge = lazy(() => import('../pages/tenant/knowledge/Knowledge'));
const Wiki = lazy(() => import('../pages/tenant/knowledge/Wiki'));
const ContactGroup = lazy(
    () => import('../pages/tenant/knowledge/ContactGroup')
);
const Surveys = lazy(() => import('../pages/tenant/surveys/Surveys'));
const Survey = lazy(() => import('../pages/tenant/surveys/Survey'));
const SurveyTransaction = lazy(() => import('../pages/SurveyTransaction'));
const Events = lazy(() => import('../pages/tenant/events/Events'));
const Event = lazy(() => import('../pages/tenant/events/Event'));
const EventRegistration = lazy(() => import('../pages/EventRegistration'));
const EventAccreditation = lazy(() => import('../pages/EventAccreditation'));
const EventProgram = lazy(() => import('../pages/EventProgram'));
const Projects = lazy(() => import('../pages/tenant/projects/Projects'));
const Project = lazy(() => import('../pages/tenant/projects/Project'));
const OpenTenants = lazy(() => import('../pages/discover/Tenants'));

const SVHRouter = (): JSX.Element => {
    return (
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
                path="/event-checkin/:eventId"
                element={
                    <SVHSuspense>
                        <EventAccreditation />
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
                path="/reset-password/:token"
                element={
                    <SVHSuspense>
                        <Authentification
                            formState={AUTH_FORM_STATE.RESETWITHTOKEN}
                        />
                    </SVHSuspense>
                }
            />
            <Route
                path="/verify"
                element={
                    <SVHSuspense>
                        <Verify />
                    </SVHSuspense>
                }
            />
            <Route path="*" element={<RequireLogin />}>
                <Route path="*" element={<RequireSocket />}>
                    <Route path="*" element={<InitTenant />}>
                        <Route path="*" element={<SVHAppShell />}>
                            <Route
                                index
                                element={
                                    <SVHSuspense>
                                        <Homepage />
                                    </SVHSuspense>
                                }
                            />
                            <Route path="sv" element={<RequireTenant />}>
                                <Route
                                    path="dashboard"
                                    element={
                                        <SVHSuspense>
                                            <Dashboard />
                                        </SVHSuspense>
                                    }
                                />
                                <Route
                                    path="notifications"
                                    element={
                                        <SVHSuspense>
                                            <Notifications />
                                        </SVHSuspense>
                                    }
                                />
                                <Route
                                    path="members"
                                    element={
                                        <SVHSuspense>
                                            <Members />
                                        </SVHSuspense>
                                    }
                                />
                                <Route path="projects">
                                    <Route
                                        index
                                        element={
                                            <SVHSuspense>
                                                <Projects />
                                            </SVHSuspense>
                                        }
                                    />
                                    <Route
                                        path=":projectId"
                                        element={
                                            <SVHSuspense>
                                                <Project />
                                            </SVHSuspense>
                                        }
                                    />
                                </Route>
                                <Route path="profile">
                                    <Route
                                        index
                                        element={
                                            <SVHSuspense>
                                                <Profile />
                                            </SVHSuspense>
                                        }
                                    />
                                    <Route
                                        path="news"
                                        element={
                                            <SVHSuspense>
                                                <News />
                                            </SVHSuspense>
                                        }
                                    />
                                    <Route
                                        path="projects"
                                        element={
                                            <SVHSuspense>
                                                <TenantProjects />
                                            </SVHSuspense>
                                        }
                                    />
                                </Route>
                                <Route
                                    path="chat"
                                    element={
                                        <SVHSuspense>
                                            <GroupChat />
                                        </SVHSuspense>
                                    }
                                />
                                <Route
                                    path="calendar"
                                    element={
                                        <SVHSuspense>
                                            <Calendar />
                                        </SVHSuspense>
                                    }
                                />
                                <Route path="events">
                                    <Route
                                        index
                                        element={
                                            <SVHSuspense>
                                                <Events />
                                            </SVHSuspense>
                                        }
                                    />
                                    <Route
                                        path=":eventId"
                                        element={
                                            <SVHSuspense>
                                                <Event />
                                            </SVHSuspense>
                                        }
                                    />
                                </Route>
                                <Route
                                    path="settings"
                                    element={
                                        <SVHSuspense>
                                            <Settings />
                                        </SVHSuspense>
                                    }
                                />
                                <Route
                                    path="budgets"
                                    element={
                                        <SVHSuspense>
                                            <Budgets />
                                        </SVHSuspense>
                                    }
                                />
                                <Route
                                    path="budgets/:budgetId"
                                    element={
                                        <SVHSuspense>
                                            <Budget />
                                        </SVHSuspense>
                                    }
                                />
                                <Route
                                    path="knowledge"
                                    element={
                                        <SVHSuspense>
                                            <Knowledge />
                                        </SVHSuspense>
                                    }
                                />
                                <Route
                                    path="knowledge/wiki/:wikiId"
                                    element={
                                        <SVHSuspense>
                                            <Wiki />
                                        </SVHSuspense>
                                    }
                                />
                                <Route
                                    path="knowledge/contactgroup/:contactGroupId"
                                    element={
                                        <SVHSuspense>
                                            <ContactGroup />
                                        </SVHSuspense>
                                    }
                                />
                                <Route path="surveys">
                                    <Route
                                        index
                                        element={
                                            <SVHSuspense>
                                                <Surveys />
                                            </SVHSuspense>
                                        }
                                    />
                                    <Route
                                        path=":surveyId"
                                        element={
                                            <SVHSuspense>
                                                <Survey />
                                            </SVHSuspense>
                                        }
                                    />
                                </Route>
                            </Route>
                            <Route path="discover">
                                <Route
                                    path="tenants"
                                    element={
                                        <SVHSuspense>
                                            <OpenTenants />
                                        </SVHSuspense>
                                    }
                                />
                            </Route>
                            <Route path="d_admin">
                                <Route
                                    path="domains"
                                    element={
                                        <SVHSuspense>
                                            <Domains />
                                        </SVHSuspense>
                                    }
                                />
                                <Route
                                    path="domains/:domainId"
                                    element={
                                        <SVHSuspense>
                                            <Domain />
                                        </SVHSuspense>
                                    }
                                />
                            </Route>
                            <Route
                                path="admin"
                                element={
                                    <SVHSuspense>
                                        <RequirePermission
                                            permission_level={
                                                PERMISSION_LEVEL.SV_HUB_MODERATION
                                            }
                                        />
                                    </SVHSuspense>
                                }
                            >
                                <Route
                                    path="dashboard"
                                    element={
                                        <SVHSuspense>
                                            <AdminDashboard />
                                        </SVHSuspense>
                                    }
                                />
                                <Route
                                    path="reports"
                                    element={
                                        <SVHSuspense>
                                            <AdminReports />
                                        </SVHSuspense>
                                    }
                                />
                                <Route
                                    path="users"
                                    element={
                                        <SVHSuspense>
                                            <AdminUsers />
                                        </SVHSuspense>
                                    }
                                />
                                <Route
                                    path="users/:userId"
                                    element={
                                        <SVHSuspense>
                                            <AdminUser />
                                        </SVHSuspense>
                                    }
                                />
                                <Route path="tenants">
                                    <Route
                                        index
                                        element={
                                            <SVHSuspense>
                                                <Tenants />
                                            </SVHSuspense>
                                        }
                                    />
                                    <Route
                                        path=":id"
                                        element={
                                            <SVHSuspense>
                                                <Tenant />
                                            </SVHSuspense>
                                        }
                                    />
                                </Route>
                                <Route
                                    path="domains"
                                    element={
                                        <SVHSuspense>
                                            <AdminDomains />
                                        </SVHSuspense>
                                    }
                                />
                            </Route>
                            <Route path="user">
                                <Route
                                    index
                                    element={
                                        <SVHSuspense>
                                            <MyAccount />
                                        </SVHSuspense>
                                    }
                                />
                                <Route
                                    path="chat"
                                    element={
                                        <SVHSuspense>
                                            <Chats />
                                        </SVHSuspense>
                                    }
                                />
                                <Route
                                    path="chat/new"
                                    element={
                                        <SVHSuspense>
                                            <NewChat />
                                        </SVHSuspense>
                                    }
                                />
                                <Route
                                    path="chat/:userId"
                                    element={
                                        <SVHSuspense>
                                            <Chat />
                                        </SVHSuspense>
                                    }
                                />
                                <Route
                                    path="invitations"
                                    element={
                                        <SVHSuspense>
                                            <Invitations />
                                        </SVHSuspense>
                                    }
                                />
                            </Route>
                        </Route>
                    </Route>
                </Route>
            </Route>
        </Routes>
    );
};

export default SVHRouter;

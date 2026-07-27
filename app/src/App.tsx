
import './App.css'

import { appRoutes } from './utils/objects/objects'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'

import { AppAuthProvider } from './contexts/AppAuthContext'

import FirstAuth from './containers/FirstAuth/Page'
import SecondAuth from './containers/SecondAuth/Page'
import Homepage from './containers/Homepage/Page'
import InitialAuthLoadingView from './containers/LoadingPages/InitialAuthVerify/View'

import FriendsSection from './containers/Homepage/subroutes/friends/Section'
import RoomsSection from './containers/Homepage/subroutes/rooms/Section'
import ProfileSection from './containers/Homepage/subroutes/profile/Section'

import WorkingRoom from './containers/WorkingRoom/Room'

import { FriendsProvider } from './contexts/FriendsContext'
import { FriendshipRequestsProvider } from './contexts/FriendshipRequestsContext'
import { RealtimeProvider } from './contexts/RealtimeContext'
import { RoomsProvider } from './contexts/RoomsContext'
import { ProtectedRoute } from './components/utils/ProtectedRoute'

function App() {
    return (
        <BrowserRouter>
            <AppAuthProvider>
                <Routes>
                    <Route path="/" element={<InitialAuthLoadingView />} />
                    <Route path={appRoutes.FIRST_AUTH} element={<FirstAuth />} />
                    <Route path={appRoutes.SECOND_AUTH} element={<SecondAuth />} />

                    <Route element={<ProtectedRoute />}>
                        <Route
                            element={
                                <FriendsProvider>
                                    <FriendshipRequestsProvider>
                                        <RoomsProvider>
                                            <RealtimeProvider>
                                                <Outlet />
                                            </RealtimeProvider>
                                        </RoomsProvider>
                                    </FriendshipRequestsProvider>
                                </FriendsProvider>
                            }
                        >
                            <Route
                                path={appRoutes.HOMEPAGE.ROOT}
                                element={
                                    <Homepage />
                                }
                            >
                                <Route index element={<Navigate to="rooms" />} />
                                <Route path={appRoutes.HOMEPAGE.SECTIONS.FRIENDS} element={<FriendsSection />} />
                                <Route path={appRoutes.HOMEPAGE.SECTIONS.ROOMS} element={<RoomsSection />} />
                                <Route path={appRoutes.HOMEPAGE.SECTIONS.PROFILE} element={<ProfileSection />} />
                            </Route>

                            <Route path="/workingRoom/:roomId" element={<WorkingRoom />}>
                                <Route path=":pixelartId" element={<WorkingRoom />} />
                            </Route>
                        </Route>
                    </Route>

                    <Route path="*" element={<h1>Page not found</h1>} />
                </Routes>
            </AppAuthProvider>
        </BrowserRouter>
    );
}

export default App

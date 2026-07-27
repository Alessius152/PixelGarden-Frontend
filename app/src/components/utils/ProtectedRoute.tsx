import { Navigate, Outlet } from "react-router-dom";
import InitialAuthLoadingView from "../../containers/LoadingPages/InitialAuthVerify/View";
import { useAppAuth } from "../../contexts/AppAuthContext";
import { appRoutes } from "../../utils/objects/objects";
import { SnackbarProvider } from "notistack";

export const ProtectedRoute = () => {
    const { firstAuth, secondAuth } = useAppAuth();

    const serverUnauthenticatedValues = ['idle', 'loading', 'error', 'unauthorized'] as Array<typeof secondAuth.status>

    if (
        firstAuth.status === 'loading'
        || serverUnauthenticatedValues.includes(secondAuth.status)
    ) {
        return <InitialAuthLoadingView />
    }

    if (firstAuth.status === 'unauthenticated') {
        return <Navigate to={appRoutes.FIRST_AUTH} replace />
    }

    if (secondAuth.status === 'needSecondAuth') {
        return <Navigate to={appRoutes.SECOND_AUTH} replace />
    }

    return <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "top", horizontal: "right" }} style={{ borderRadius: 18 }}>
        <Outlet />
    </SnackbarProvider>
}
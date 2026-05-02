import ErrorBoundary from "@/components/pages/error/ErrorBoundary";
import { Outlet } from "react-router-dom";
export default function RootLayout() {
    return (
        <ErrorBoundary>
            <Outlet />
        </ErrorBoundary>
    )
}

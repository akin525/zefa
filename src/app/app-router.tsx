import { RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router";
import { NotFound } from "./not-found";
import RegisterPage from "./routes/auth/register";
import LoginPage from "./routes/auth/login";
import Dashboard from "./routes/dashboard/dashboard";
import { ProtectedRoute } from "./../components/ProtectedRoute";
import Maintenance from "@/app/routes/dashboard/Maintenance.tsx";
import ResetPasswordRequest from "@/app/routes/auth/ResetPasswordRequest.tsx";
import SetNewPassword from "@/app/routes/auth/SetNewPassword.tsx";
import Verification from "@/app/routes/dashboard/verification.tsx";
import VerificationHistory from "@/app/routes/dashboard/verificationHistory";
import BusinessVerification from "@/app/routes/dashboard/verifyBusiness.tsx";
import BusinessShareholderDetails from "@/app/routes/dashboard/shareholders.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
    {
    path: "/forgot-password",
    Component: ResetPasswordRequest,
  },
    {
    path: "/set-password",
    Component: SetNewPassword,
  },
    {
    path: "/maintenance",
    Component: Maintenance,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/dashboard",
      Component: () => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
      ),

  },
    {
        path: "/verification",
        Component: () => (
            <ProtectedRoute>
                <Verification/>
            </ProtectedRoute>
        ),
    },
    {
        path: "/verify-business",
        Component: () => (
            <ProtectedRoute>
                <BusinessVerification/>
            </ProtectedRoute>
        ),
    },
    {
        path: "/business-shareholder",
        Component: () => (
            <ProtectedRoute>
                <BusinessShareholderDetails/>
            </ProtectedRoute>
        ),
    },
    {
        path: "/verification-history",
        Component: () => (
            <ProtectedRoute>
                <VerificationHistory/>
            </ProtectedRoute>
        ),
    },
  {
    path: "*",
    Component: NotFound,
  },
]);
export function AppRouter() {
  return <RouterProvider router={router} />;
}

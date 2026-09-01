import { Navigate, Outlet } from "@tanstack/react-router";
import { toast } from "react-toastify";
import { useAuthStore } from "../lib/store/auth.store";

type ProtectedLayoutProps = {};

const ProtectedLayout = ({}: ProtectedLayoutProps) => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    toast.info("You need to be logged in to access this page");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedLayout;

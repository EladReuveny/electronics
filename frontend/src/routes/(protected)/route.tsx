import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { toast } from "react-toastify";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { useAuthStore } from "../../lib/store/auth.store";

export const Route = createFileRoute("/(protected)")({
  component: ProtectedRouteLayout,
  beforeLoad: ({ location }) => {
    const user = useAuthStore.getState().user;

    if (!user) {
      toast.info("You must be logged in to access this page.");
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
});

function ProtectedRouteLayout() {
  return (
    <>
      <Header />

      <main className="min-h-screen mt-26 px-4">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

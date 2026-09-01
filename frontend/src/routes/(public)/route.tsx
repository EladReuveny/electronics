import { createFileRoute, Outlet } from "@tanstack/react-router";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

export const Route = createFileRoute("/(public)")({
  component: PublicRouteLayout,
});

function PublicRouteLayout() {
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

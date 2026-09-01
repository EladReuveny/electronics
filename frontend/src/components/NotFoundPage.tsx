import { Link } from "@tanstack/react-router";
import { ArrowLeft, TriangleAlert } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen max-w-1/2 mx-auto space-y-6">
      <div className="rounded-2xl border border-red-500/35 bg-red-500/10 p-8 text-center shadow-lg shadow-red-500/30">
        <div className="mx-auto size-16 flex items-center justify-center rounded-full bg-red-500/15">
          <TriangleAlert className="size-8 text-red-500" />
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-500">
          404 Error
        </p>

        <h1 className="mt-1 text-3xl font-bold">Page not found</h1>

        <p className="mt-4 text-(--text-clr-muted)">
          Sorry, the page you're looking for doesn't exist, may have been moved,
          or the URL might be incorrect.
        </p>
      </div>

      <Link
        to="/"
        className="group flex items-center justify-center gap-2 text-lg py-3 px-4 rounded-full bg-(--accent-clr) hover:bg-(--accent-clr)/90 text-(--bg-clr) font-semibold shadow-lg shadow-(--accent-clr)/20 hover:opacity-95 active:scale-95 cursor-pointer"
      >
        <ArrowLeft className="size-5 group-hover:translate-x-1" />
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFoundPage;

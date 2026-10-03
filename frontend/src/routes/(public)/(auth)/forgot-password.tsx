import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound, Mail } from "lucide-react";
import { toast } from "react-toastify";
import z from "zod";
import FormField from "../../../components/FormField";
import PageTitle from "../../../components/PageTitle";
import { authApi } from "../../../features/auth/auth.api";
import { handleError } from "../../../lib/utils/utils";
import type { ForgotPasswordDto } from "../../../features/auth/auth.types";

const forgotPasswordFormSchema = z.object({
  email: z.email("Invalid email address"),
});

export const Route = createFileRoute("/(public)/(auth)/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const forgotPasswordMutation = useMutation({
    mutationFn: (forgotPasswordDto: ForgotPasswordDto) =>
      authApi.forgotPassword(forgotPasswordDto),
    onError: (err) => handleError(err),
  });

  const forgotPasswordForm = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: forgotPasswordFormSchema,
      onBlur: forgotPasswordFormSchema,
      onSubmit: forgotPasswordFormSchema,
    },
    onSubmit: async ({ value }) =>
      forgotPasswordMutation.mutate(value, {
        onSuccess: (data) => {
          toast.success(data.message);
          forgotPasswordForm.reset();
        },
      }),
  });

  return (
    <div className="w-1/2 mx-auto py-8">
      <PageTitle title="Forgot Password" />

      <fieldset className="border-2 border-(--primary-clr)/30 rounded-xl p-6 mt-8">
        <legend className="px-4 text-lg font-bold text-(--primary-clr) flex items-center gap-2">
          <KeyRound className="size-5" />
          User Verification
        </legend>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            forgotPasswordForm.handleSubmit();
          }}
          className="space-y-6"
        >
          <forgotPasswordForm.Field name="email">
            {(field) => (
              <FormField
                field={field}
                label="Email Address"
                type="email"
                required
              />
            )}
          </forgotPasswordForm.Field>

          <forgotPasswordForm.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="cursor-pointer flex items-center justify-center gap-2 text-xl py-3 bg-(--primary-clr) w-full rounded-lg hover:brightness-110 active:scale-[97%] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
                <Mail className="size-6" />
              </button>
            )}
          </forgotPasswordForm.Subscribe>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-(--secondary-clr) font-bold hover:underline text-sm"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      </fieldset>
    </div>
  );
}

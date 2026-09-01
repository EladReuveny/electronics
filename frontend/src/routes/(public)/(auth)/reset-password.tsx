import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import z from "zod";
import FormField from "../../../components/FormField";
import PageTitle from "../../../components/PageTitle";
import ToggleShowPasswordButton from "../../../components/ToggleShowPasswordButton";
import { authApi } from "../../../features/auth/auth.api";
import type { ResetPasswordDto } from "../../../features/auth/auth.types";
import { handleError } from "../../../lib/utils/utils";

const resetPasswordSearchSchema = z.object({
  token: z.string().nonempty("Reset token is required"),
});

const resetPasswordFormSchema = z
  .object({
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{5,}$/,
        "Password requires at least 5 characters, 1 lowercase, 1 uppercase, and 1 number",
      ),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export const Route = createFileRoute("/(public)/(auth)/reset-password")({
  validateSearch: resetPasswordSearchSchema,
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const { token } = Route.useSearch();
  const navigate = useNavigate();

  const resetPasswordMutation = useMutation({
    mutationFn: (resetPasswordDto: ResetPasswordDto) =>
      authApi.resetPassword(resetPasswordDto),
    onError: (err) => handleError(err),
  });

  const resetPasswordForm = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: resetPasswordFormSchema,
      onBlur: resetPasswordFormSchema,
      onSubmit: resetPasswordFormSchema,
    },
    onSubmit: async ({ value }) => {
      resetPasswordMutation.mutate(
        {
          token,
          ...value,
        },
        {
          onSuccess: () => {
            toast.success("Password reset successfully.");
            resetPasswordForm.reset();
            navigate({ to: "/login" });
          },
        },
      );
    },
  });

  return (
    <div className="w-1/2 mx-auto py-8">
      <PageTitle title="Reset Password" />

      <fieldset className="border-2 border-(--primary-clr)/30 rounded-xl p-6 mt-8">
        <legend className="px-4 text-lg font-bold text-(--primary-clr) flex items-center gap-2">
          <KeyRound className="size-5" />
          Secure Your Account
        </legend>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            resetPasswordForm.handleSubmit();
          }}
          className="space-y-6"
        >
          <resetPasswordForm.Field name="password">
            {(field) => (
              <FormField field={field} label="New Password" required>
                <input
                  id={field.name}
                  name={field.name}
                  type={isPasswordVisible ? "text" : "password"}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  required
                  placeholder=" "
                  className="peer w-full py-2.5 px-3 border-2 border-(--primary-clr)/20 rounded-lg outline-none focus:border-(--secondary-clr)"
                />
                <ToggleShowPasswordButton
                  isPasswordVisible={isPasswordVisible}
                  setIsPasswordVisible={setIsPasswordVisible}
                />
              </FormField>
            )}
          </resetPasswordForm.Field>

          <resetPasswordForm.Field name="confirmPassword">
            {(field) => (
              <FormField field={field} label="Confirm Password" required>
                <input
                  id={field.name}
                  name={field.name}
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  required
                  placeholder=" "
                  className="peer w-full py-2.5 px-3 border-2 border-(--primary-clr)/20 rounded-lg outline-none focus:border-(--secondary-clr)"
                />
                <ToggleShowPasswordButton
                  isPasswordVisible={isConfirmPasswordVisible}
                  setIsPasswordVisible={setIsConfirmPasswordVisible}
                />
              </FormField>
            )}
          </resetPasswordForm.Field>

          <resetPasswordForm.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="cursor-pointer flex items-center justify-center gap-2 text-xl py-3 bg-(--primary-clr) w-full rounded-lg hover:brightness-110 active:scale-[97%] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
                <KeyRound className="size-6" />
              </button>
            )}
          </resetPasswordForm.Subscribe>

          <div className="mt-4 text-center text-sm">
            <Link
              to="/login"
              className="text-(--secondary-clr) font-bold hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      </fieldset>
    </div>
  );
}

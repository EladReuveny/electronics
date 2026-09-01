import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogIn, User } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import z from "zod";
import FormField from "../../../components/FormField";
import PageTitle from "../../../components/PageTitle";
import ToggleShowPasswordButton from "../../../components/ToggleShowPasswordButton";
import { authApi } from "../../../features/auth/auth.api";
import { useAuthStore } from "../../../lib/store/auth.store";
import { handleError } from "../../../lib/utils/utils";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

const loginFormSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{5,}$/,
      "Password requires at least 5 characters, 1 lowercase, 1 uppercase, and 1 number",
    ),
});

export const Route = createFileRoute("/(public)/(auth)/login")({
  component: LoginPage,
  validateSearch: loginSearchSchema,
});

function LoginPage() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const search = Route.useSearch();

  const loginUserMutation = useMutation({
    mutationFn: (loginUserDto: { email: string; password: string }) =>
      authApi.login(loginUserDto),

    onError: (err) => handleError(err),
  });

  const loginForm = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: loginFormSchema,
      onBlur: loginFormSchema,
      onSubmit: loginFormSchema,
    },
    onSubmit: async ({ value }) =>
      loginUserMutation.mutate(value, {
        onSuccess: (data) => {
          login(data);
          navigate({
            to: search.redirect || "/",
          });
          toast.success("Logged in successfully.");
        },
      }),
  });

  return (
    <div className="w-1/2 mx-auto py-8">
      <PageTitle title="Sign In" />

      <fieldset className="border-2 border-(--primary-clr)/30 rounded-xl p-6 mt-8">
        <legend className="px-4 text-lg font-bold text-(--primary-clr) flex items-center gap-2">
          <User className="size-5" />
          User Details
        </legend>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            loginForm.handleSubmit();
          }}
          className="space-y-6"
        >
          <loginForm.Field name="email">
            {(field) => (
              <FormField
                field={field}
                label="Email Address"
                type="email"
                required
              />
            )}
          </loginForm.Field>

          <loginForm.Field name="password">
            {(field) => (
              <FormField field={field} label="Password" required>
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
          </loginForm.Field>

          <loginForm.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="cursor-pointer flex items-center justify-center gap-2 text-xl py-3 bg-(--primary-clr) w-full rounded-lg hover:brightness-110 active:scale-[97%] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Logging in..." : "Login"}
                <LogIn className="size-6" />
              </button>
            )}
          </loginForm.Subscribe>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link
              to="/forgot-password"
              className="text-(--secondary-clr) hover:underline font-medium"
            >
              Forgot password?
            </Link>

            <div>
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-(--secondary-clr) font-bold hover:underline"
              >
                Sign up
              </Link>
            </div>
          </div>
        </form>
      </fieldset>
    </div>
  );
}

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { User, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import z from "zod";
import FormField from "../../../components/FormField";
import PageTitle from "../../../components/PageTitle";
import ToggleShowPasswordButton from "../../../components/ToggleShowPasswordButton";
import { authApi } from "../../../features/auth/auth.api";
import type { CreateUserDto } from "../../../features/auth/auth.types";
import { useAuthStore } from "../../../lib/store/auth.store";
import { handleError } from "../../../lib/utils/utils";

const registerFormSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{5,}$/,
      "Password requires at least 5 characters, 1 lowercase, 1 uppercase, and 1 number",
    ),
  address: z.string(),
  phone: z.string(),
});

export const Route = createFileRoute("/(public)/(auth)/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const login = useAuthStore((state) => state.login);

  const navigate = useNavigate();

  const registerUserMutation = useMutation({
    mutationFn: (createUserDto: CreateUserDto) =>
      authApi.register(createUserDto),

    onError: (err) => handleError(err),
  });

  const registerForm = useForm({
    defaultValues: {
      email: "",
      password: "",
      address: "",
      phone: "",
    },
    validators: {
      onChange: registerFormSchema,
      onBlur: registerFormSchema,
      onSubmit: registerFormSchema,
    },
    onSubmit: async ({ value }) => {
      registerUserMutation.mutate(
        {
          email: value.email,
          password: value.password,
          address: value.address,
          phone: value.phone,
        },
        {
          onSuccess: (data) => {
            login(data);
            navigate({ to: "/profile" });
            toast.success("Account created successfully.");
          },
        },
      );
    },
  });

  return (
    <div className="w-1/2 mx-auto py-8">
      <PageTitle title="Create Account" />

      <fieldset className="border-2 border-(--primary-clr)/30 rounded-xl p-6 mt-8">
        <legend className="px-4 text-lg font-bold text-(--primary-clr) flex items-center gap-2">
          <User className="size-5" />
          User Details
        </legend>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            registerForm.handleSubmit();
          }}
          className="space-y-6"
        >
          <registerForm.Field name="email">
            {(field) => (
              <FormField
                field={field}
                label="Email Address"
                type="email"
                required
              />
            )}
          </registerForm.Field>

          <registerForm.Field name="password">
            {(field) => (
              <FormField field={field} label="Password" required>
                <input
                  id={field.name}
                  name={field.name}
                  type={isPasswordVisible ? "text" : "password"}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder=" "
                  className="peer w-full py-2.5 px-3 border-2 border-(--primary-clr)/20 rounded-lg outline-none focus:border-(--secondary-clr)"
                  required
                />
                <ToggleShowPasswordButton
                  isPasswordVisible={isPasswordVisible}
                  setIsPasswordVisible={setIsPasswordVisible}
                />
              </FormField>
            )}
          </registerForm.Field>

          <registerForm.Field name="address">
            {(field) => <FormField field={field} label="Address" />}
          </registerForm.Field>

          <registerForm.Field name="phone">
            {(field) => (
              <FormField field={field} label="Phone Number" type="tel" />
            )}
          </registerForm.Field>

          <registerForm.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="cursor-pointer flex items-center justify-center gap-2 text-xl py-3 bg-(--primary-clr) w-full rounded-lg hover:brightness-110 active:scale-[97%] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Registering..." : "Register"}
                <UserPlus className="size-6" />
              </button>
            )}
          </registerForm.Subscribe>

          <div className="mt-4 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-(--secondary-clr) font-bold hover:underline"
            >
              Sign in
            </Link>
          </div>
        </form>
      </fieldset>
    </div>
  );
}

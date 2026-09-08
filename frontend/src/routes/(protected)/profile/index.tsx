import { useForm } from "@tanstack/react-form";
import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  createFileRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import {
  AlertTriangle,
  Moon,
  Save,
  Sun,
  SunMoon,
  Trash2,
  UserPen,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import z from "zod";
import FormField from "../../../components/FormField";
import PageTitle from "../../../components/PageTitle";
import ToggleButton from "../../../components/ToggleButton";
import ToggleShowPasswordButton from "../../../components/ToggleShowPasswordButton";
import { usersApi } from "../../../features/users/users.api";
import { usersKeys } from "../../../features/users/users.keys";
import { useAuthStore } from "../../../lib/store/auth.store";
import { useThemeStore } from "../../../lib/store/theme.store";
import { handleError } from "../../../lib/utils/utils";
import type { UpdateUserDto } from "../../../features/users/user.types";

const updateUserFormSchema = z
  .object({
    email: z.email("Invalid email address"),
    password: z.string(),
    confirmPassword: z.string(),
    address: z.string(),
    phone: z.string(),
    avatarUrl: z.file("Invalid file"),
  })
  .superRefine((data, ctx) => {
    if (data.confirmPassword && data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

const findMeQuery = queryOptions({
  queryKey: usersKeys.all,
  queryFn: () => usersApi.findMe(),
});

const sidebarItems = [
  { label: "Profile Information", to: "#profile-information" },
  { label: "Theme", to: "#theme" },
  { label: "Danger Zone", to: "#danger-zone" },
];

export const Route = createFileRoute("/(protected)/profile/")({
  component: ProfilePage,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(findMeQuery);
  },
});

function ProfilePage() {
  const { data: user } = useSuspenseQuery(findMeQuery);

  const logout = useAuthStore((state) => state.logout);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: ({
      userId,
      updateUserDto,
    }: {
      userId: string;
      updateUserDto: UpdateUserDto;
    }) => usersApi.update(userId, updateUserDto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usersKeys.all }),
    onError: (err) => handleError(err),
  });
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => usersApi.remove(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usersKeys.all }),
    onError: (err) => handleError(err),
  });

  const navigate = useNavigate();
  const location = useLocation();

  const updateUserForm = useForm({
    defaultValues: {
      email: user.email ?? "",
      password: "",
      confirmPassword: "",
      phone: user.phone ?? "",
      address: user.address ?? "",
      avatarUrl: user.avatarUrl ?? "",
    },
    validators: {
      onChange: updateUserFormSchema,
      onBlur: updateUserFormSchema,
      onSubmit: updateUserFormSchema,
    },
    onSubmit: ({ value }) => {
      if (!user?.id) return;
      updateUserMutation.mutate(
        {
          userId: user.id,
          updateUserDto: value,
        },
        {
          onSuccess: () => {
            toast.success("Profile updated successfully.");
          },
        },
      );
    },
  });

  const handleDeleteAccount = () => {
    if (!user?.id) return;

    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.",
      )
    ) {
      return;
    }

    deleteUserMutation.mutate(user.id, {
      onSuccess: (data) => {
        logout();
        toast.success(data.message);
        navigate({ to: "/" });
      },
    });
  };

  return (
    <div className="mx-auto px-4 py-8">
      <PageTitle title="My Profile" />

      <div className="grid grid-cols-[300px_1fr] gap-8">
        <aside className="rounded-md shadow-lg bg-(--primary-clr)/5 py-4 h-fit overflow-y-auto border-2 border-(--primary-clr)/30 sticky top-20">
          <h3 className="font-bold text-xl uppercase text-(--secondary-clr) text-center mb-4">
            Settings
          </h3>
          <nav className="flex flex-col gap-1">
            {sidebarItems.map((item, i) => (
              <a
                key={`sidebar-item-${i}`}
                href={item.to}
                className={`py-3 px-6 font-semibold border-l-4
                    ${
                      location.hash === item.to.slice(1) ||
                      (!location.hash && item.to === "#profile-information")
                        ? "text-(--primary-clr) border-l-(--primary-clr) bg-(--primary-clr)/10"
                        : "border-transparent hover:border-l-(--primary-clr) hover:bg-(--primary-clr)/5"
                    }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="space-y-8">
          <section id="profile-information" className="scroll-mt-24">
            <fieldset className="border-2 border-(--primary-clr)/30 rounded-xl py-4 px-6 shadow-lg bg-(--primary-clr)/10">
              <legend className="px-4 text-lg font-bold text-(--primary-clr) flex items-center gap-2">
                <UserPen className="size-5" />
                Profile Information
              </legend>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateUserForm.handleSubmit();
                }}
                className="mt-4 space-y-6"
              >
                <div className="grid grid-cols-1 gap-6">
                  <updateUserForm.Field name="email">
                    {(field) => (
                      <FormField
                        field={field}
                        label="Email"
                        type="email"
                        readOnly
                      />
                    )}
                  </updateUserForm.Field>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <updateUserForm.Field name="password">
                      {(field) => (
                        <FormField field={field} label="New Password">
                          <input
                            id={field.name}
                            name={field.name}
                            type={isPasswordVisible ? "text" : "password"}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            placeholder=" "
                            className="peer w-full py-2.5 px-3 border-2 border-(--primary-clr)/20 rounded-lg outline-none focus:border-(--secondary-clr) focus:shadow-[0_0_15px_rgba(var(--secondary-clr-rgb),0.2)] bg-transparent"
                          />
                          <ToggleShowPasswordButton
                            isPasswordVisible={isPasswordVisible}
                            setIsPasswordVisible={setIsPasswordVisible}
                          />
                        </FormField>
                      )}
                    </updateUserForm.Field>

                    <updateUserForm.Field name="confirmPassword">
                      {(field) => (
                        <FormField field={field} label="Confirm Password">
                          <input
                            id={field.name}
                            name={field.name}
                            type={
                              isConfirmPasswordVisible ? "text" : "password"
                            }
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            placeholder=" "
                            className="peer w-full py-2.5 px-3 border-2 border-(--primary-clr)/20 rounded-lg outline-none focus:border-(--secondary-clr) focus:shadow-[0_0_15px_rgba(var(--secondary-clr-rgb),0.2)] bg-transparent"
                          />
                          <ToggleShowPasswordButton
                            isPasswordVisible={isConfirmPasswordVisible}
                            setIsPasswordVisible={setIsConfirmPasswordVisible}
                          />
                        </FormField>
                      )}
                    </updateUserForm.Field>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <updateUserForm.Field name="address">
                      {(field) => <FormField field={field} label="Address" />}
                    </updateUserForm.Field>

                    <updateUserForm.Field name="phone">
                      {(field) => (
                        <FormField field={field} label="Phone" type="tel" />
                      )}
                    </updateUserForm.Field>
                  </div>

                  <updateUserForm.Field name="avatarUrl">
                    {(field) => (
                      <FormField
                        field={field}
                        label="Avatar"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                      />
                    )}
                  </updateUserForm.Field>

                  <hr className="border-(--primary-clr)/20 my-2" />
                </div>

                <updateUserForm.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="cursor-pointer flex items-center justify-center gap-2 text-xl py-3 bg-(--primary-clr) w-full rounded-lg hover:brightness-110 active:scale-[97%] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-(--primary-clr)/20"
                    >
                      {isSubmitting ? "Saving Changes..." : "Save Changes"}
                      <Save className="size-5" />
                    </button>
                  )}
                </updateUserForm.Subscribe>
              </form>
            </fieldset>
          </section>

          <section id="theme" className="scroll-mt-24">
            <fieldset className="border-2 border-(--primary-clr)/30 rounded-xl py-4 px-6  shadow-lg bg-(--primary-clr)/10">
              <legend className="px-4 text-lg font-bold text-(--primary-clr) flex items-center gap-2">
                <SunMoon className="size-5" />
                Theme Settings
              </legend>

              <div>
                <ToggleButton
                  label="Theme"
                  id="toggle-theme"
                  checked={theme === "dark"}
                  onChange={toggleTheme}
                  icons={{
                    active: Sun,
                    inactive: Moon,
                  }}
                />
              </div>
            </fieldset>
          </section>

          <section id="danger-zone" className="scroll-mt-24">
            <fieldset className="border-2 border-red-500/30 rounded-xl py-4 px-6 shadow-lg bg-red-500/10">
              <legend className="px-4 text-lg font-bold text-red-500 flex items-center gap-2">
                <AlertTriangle className="size-5" />
                Danger Zone
              </legend>

              <div className="space-y-4">
                <p className="text-(--text-clr-muted)">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteUserMutation.isPending}
                  className="cursor-pointer flex items-center justify-center gap-2 px-6 py-3 bg-red-500 rounded-lg font-bold hover:brightness-90 active:scale-[97%] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="size-5" />
                  {deleteUserMutation.isPending
                    ? "Deleting Account..."
                    : "Delete Account"}
                </button>
              </div>
            </fieldset>
          </section>
        </main>
      </div>
    </div>
  );
}

import { Eye, EyeOff } from "lucide-react";

type ToggleShowPasswordButtonProps = {
  isPasswordVisible: boolean;
  setIsPasswordVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const ToggleShowPasswordButton = ({
  isPasswordVisible,
  setIsPasswordVisible,
}: ToggleShowPasswordButtonProps) => {
  return (
    <button
      type="button"
      title={isPasswordVisible ? "Hide password" : "Show password"}
      className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2"
      onClick={() => setIsPasswordVisible((prev) => !prev)}
    >
      {isPasswordVisible ? <EyeOff /> : <Eye />}
    </button>
  );
};

export default ToggleShowPasswordButton;

import axios from "axios";
import { toast } from "react-toastify";

export const handleError = (err: unknown) => {
  console.error(err);

  if (axios.isAxiosError(err)) {
    toast.error(
      String(
        err.response?.data?.message ?? err.message ?? "Something went wrong",
      ),
    );
  } else {
    toast.error("An unknown error occurred");
  }
};

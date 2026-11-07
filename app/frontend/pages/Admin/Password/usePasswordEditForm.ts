import { router } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { admin_password_path } from "@/routes";

import {
  passwordResetSchema,
  type PasswordResetFormValues,
} from "./Edit.schema";

export default function usePasswordEditForm(token: string) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
  });

  const onSubmit = handleSubmit((data) => {
    router.patch(admin_password_path(token), data);
  });

  return { register, errors, isSubmitting, onSubmit };
}

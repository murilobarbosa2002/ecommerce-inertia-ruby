import { router } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { admin_passwords_path } from "@/routes";

import {
  passwordRequestSchema,
  type PasswordRequestFormValues,
} from "./New.schema";

export default function usePasswordNewForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordRequestFormValues>({
    resolver: zodResolver(passwordRequestSchema),
  });

  const onSubmit = handleSubmit((data) => {
    router.post(admin_passwords_path(), data);
  });

  return { register, errors, isSubmitting, onSubmit };
}

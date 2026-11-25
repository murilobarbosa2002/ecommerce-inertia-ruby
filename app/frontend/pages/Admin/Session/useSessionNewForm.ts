import { router } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { admin_session_path } from "@/routes";

import { loginSchema, type LoginFormValues } from "./New.schema";

export default function useSessionNewForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember_me: false },
  });

  const onSubmit = handleSubmit((data) => {
    router.post(admin_session_path(), data);
  });

  return { register, control, errors, isSubmitting, onSubmit };
}

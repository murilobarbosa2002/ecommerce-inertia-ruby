import { router } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { admin_two_factor_authentication_path } from "@/routes";

import { twoFactorSchema, type TwoFactorFormValues } from "./New.schema";

export default function useTwoFactorAuthenticationNewForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TwoFactorFormValues>({
    resolver: zodResolver(twoFactorSchema),
  });

  const onSubmit = handleSubmit((data) => {
    router.post(admin_two_factor_authentication_path(), data);
  });

  return { register, errors, isSubmitting, onSubmit };
}

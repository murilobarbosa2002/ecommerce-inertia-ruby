import { router } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { admin_two_factor_path } from "@/routes";

import { twoFactorNewSchema, type TwoFactorNewFormValues } from "./New.schema";

export default function useTwoFactorNewForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TwoFactorNewFormValues>({
    resolver: zodResolver(twoFactorNewSchema),
    defaultValues: { otp_code: "" },
  });

  const onSubmit = handleSubmit((data) => {
    router.post(admin_two_factor_path(), data);
  });

  return { register, errors, isSubmitting, onSubmit };
}

import { router } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { admin_two_factor_path } from "@/routes";

import {
  disableTwoFactorSchema,
  type DisableTwoFactorFormValues,
} from "./DisableTwoFactor.schema";

export default function useDisableTwoFactorForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DisableTwoFactorFormValues>({
    resolver: zodResolver(disableTwoFactorSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = handleSubmit((data) => {
    router.delete(admin_two_factor_path(), { data });
  });

  return { register, errors, isSubmitting, onSubmit };
}

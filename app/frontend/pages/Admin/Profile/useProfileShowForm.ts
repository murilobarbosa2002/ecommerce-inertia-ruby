import { router } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { admin_profile_path } from "@/routes";

import { profileShowSchema, type ProfileShowFormValues } from "./Show.schema";

export default function useProfileShowForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileShowFormValues>({
    resolver: zodResolver(profileShowSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    router.patch(admin_profile_path(), data);
  });

  return { register, errors, isSubmitting, onSubmit };
}

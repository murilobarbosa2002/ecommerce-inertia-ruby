import { router } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { admin_roles_path } from "@/routes";

import { rolesNewSchema, type RolesNewFormValues } from "./New.schema";

export default function useRolesNewForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RolesNewFormValues>({
    resolver: zodResolver(rolesNewSchema),
    defaultValues: { name: "", permission_ids: [], change_reason: "" },
  });

  const onSubmit = handleSubmit((data) => {
    router.post(admin_roles_path(), data);
  });

  return { register, errors, isSubmitting, onSubmit, control };
}

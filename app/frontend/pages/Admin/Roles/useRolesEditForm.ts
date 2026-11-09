import { router } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { admin_role_path } from "@/routes";

import { rolesEditSchema, type RolesEditFormValues } from "./Edit.schema";

export default function useRolesEditForm(role: {
  id: number;
  name: string;
  permission_ids: number[];
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RolesEditFormValues>({
    resolver: zodResolver(rolesEditSchema),
    defaultValues: {
      name: role.name,
      permission_ids: role.permission_ids,
      change_reason: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    router.patch(admin_role_path(role.id), data);
  });

  return { register, errors, isSubmitting, onSubmit, control };
}

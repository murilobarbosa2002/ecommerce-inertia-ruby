import { router } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { admin_admin_path } from "@/routes";

import { adminsEditSchema, type AdminsEditFormValues } from "./Edit.schema";
import { type AdminToEdit } from "./Edit.types";

export default function useAdminsEditForm(admin: AdminToEdit) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AdminsEditFormValues>({
    resolver: zodResolver(adminsEditSchema),
    defaultValues: {
      email_address: admin.email_address,
      role_id: String(admin.role_id),
    },
  });

  const onSubmit = handleSubmit((data) => {
    router.patch(admin_admin_path(admin.id), data);
  });

  return { register, errors, isSubmitting, onSubmit, control };
}

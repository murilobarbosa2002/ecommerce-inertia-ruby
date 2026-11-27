import { router } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { admin_admin_path } from "@/routes";

import {
  deleteAdminSchema,
  type DeleteAdminFormValues,
} from "../DeleteAdmin.schema";

export default function useDeleteAdminForm(adminId: number) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DeleteAdminFormValues>({
    resolver: zodResolver(deleteAdminSchema),
    defaultValues: { password: "", change_reason: "" },
  });

  const onSubmit = handleSubmit((data) => {
    router.delete(admin_admin_path(adminId), { data });
  });

  return { register, errors, isSubmitting, onSubmit, reset };
}

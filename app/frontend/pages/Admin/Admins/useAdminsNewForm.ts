import { router } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { admin_admins_path } from "@/routes";

import { adminsNewSchema, type AdminsNewFormValues } from "./New.schema";

export default function useAdminsNewForm() {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AdminsNewFormValues>({
    resolver: zodResolver(adminsNewSchema),
    // role_id precisa de valor inicial definido (string vazia, não
    // undefined) — sem isso, o Select (Radix) começa "uncontrolled" e vira
    // "controlled" assim que uma opção é escolhida, gerando o warning real
    // do React de componente trocando de modo no meio da vida.
    defaultValues: {
      email_address: "",
      password: "",
      password_confirmation: "",
      role_id: "",
      change_reason: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    router.post(admin_admins_path(), data);
  });

  return { register, errors, isSubmitting, onSubmit, setValue, control };
}

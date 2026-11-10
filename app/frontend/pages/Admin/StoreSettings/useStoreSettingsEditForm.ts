import { router } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { admin_store_setting_path } from "@/routes";

import {
  storeSettingsEditSchema,
  type StoreSettingsEditFormValues,
} from "./Edit.schema";
import { type StoreSettingsEditProps } from "./Edit.types";

export default function useStoreSettingsEditForm({
  name,
}: StoreSettingsEditProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StoreSettingsEditFormValues>({
    resolver: zodResolver(storeSettingsEditSchema),
    defaultValues: {
      name,
      change_reason: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    // logo só vai no payload quando um arquivo novo foi escolhido — Inertia
    // detecta o File e converte a requisição pra multipart/form-data
    // automaticamente; sem isso, mandar `undefined` mantém o request como
    // texto normal (mesmo comportamento que o controller espera: campo
    // vazio não apaga o logo existente).
    router.patch(admin_store_setting_path(), {
      name: data.name,
      change_reason: data.change_reason,
      logo: data.logo?.[0],
    });
  });

  return { register, errors, isSubmitting, onSubmit };
}

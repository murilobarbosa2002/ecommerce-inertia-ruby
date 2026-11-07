import { type ReactNode } from "react";
import { usePage } from "@inertiajs/react";

import { type FlashData } from "@/types";
import { banner } from "@/components/admin/ui";

// Layout compartilhado pelas páginas pré-autenticação do admin (login, 2FA,
// reset de senha) — card centralizado + mensagem de flash. `flash` é um
// campo próprio do objeto de página do Inertia (`usePage().flash`), não um
// prop compartilhado — nunca `usePage().props.flash` (ver
// app/frontend/types/index.ts sobre esse bug real já encontrado). Tipado via
// `flashDataType` em app/frontend/types/globals.d.ts. `flash` só existe de
// fato quando há notice/alert pra mostrar (ex. depois de um redirect) — numa
// página carregada direto, o campo nem existe no objeto, apesar do tipo de
// `@inertiajs/core` (`Page.flash: FlashData`) declarar como sempre presente
// — confirmado testando no browser real. `as` corrige esse tipo incorreto
// da lib, não contorna um tipo que já estaria certo.
export default function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const { flash } = usePage() as { flash?: FlashData };

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-12">
      <div className="w-full max-w-sm animate-auth-card-in rounded-2xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-sm text-gray-500">{description}</p>
          )}
        </div>

        {flash?.notice && (
          <div role="status" className={banner({ tone: "notice" })}>
            <CheckCircleIcon />
            <span>{flash.notice}</span>
          </div>
        )}

        {flash?.alert && (
          <div role="alert" className={banner({ tone: "alert" })}>
            <ExclamationIcon />
            <span>{flash.alert}</span>
          </div>
        )}

        {children}
      </div>
    </main>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className="mt-0.5 size-4 shrink-0"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ExclamationIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className="mt-0.5 size-4 shrink-0"
    >
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

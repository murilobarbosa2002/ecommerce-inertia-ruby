import { type ReactNode } from "react";
import { usePage } from "@inertiajs/react";

import { type FlashData } from "@/types";
import Banner from "@/components/shared/banner/Banner";
import Reveal from "@/components/motion/Reveal";

// `flash` é campo próprio do objeto de página do Inertia (`usePage().flash`),
// não um prop (`usePage().props.flash` sempre undefined). Só existe quando
// há notice/alert — `as` corrige o tipo de @inertiajs/core, que o declara
// como sempre presente.
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
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-12 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      <Reveal
        direction="up"
        className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none"
      >
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        {flash?.notice && <Banner tone="notice">{flash.notice}</Banner>}
        {flash?.alert && <Banner tone="alert">{flash.alert}</Banner>}

        {children}
      </Reveal>
    </main>
  );
}

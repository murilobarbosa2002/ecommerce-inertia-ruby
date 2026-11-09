import { tv } from "tailwind-variants";

export const selectTrigger = tv({
  base: "flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100",
});

export const selectContent = tv({
  base: "overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800",
});

export const selectItem = tv({
  base: "cursor-pointer px-3.5 py-2 text-sm text-gray-900 outline-none data-highlighted:bg-indigo-50 dark:text-gray-100 dark:data-highlighted:bg-gray-700",
});

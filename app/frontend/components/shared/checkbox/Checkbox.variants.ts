import { tv } from "tailwind-variants";

export const checkbox = tv({
  base: "flex size-5 shrink-0 items-center justify-center rounded-sm border border-gray-300 bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600 dark:border-gray-700 dark:bg-gray-800 dark:data-[state=checked]:border-indigo-500 dark:data-[state=checked]:bg-indigo-500",
});

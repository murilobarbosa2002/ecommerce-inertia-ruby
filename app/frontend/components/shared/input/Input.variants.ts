import { tv } from "tailwind-variants";

export const input = tv({
  base: "block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none",
  variants: {
    invalid: {
      true: "border-red-300 focus:border-red-500 focus:ring-red-500/10",
    },
  },
});

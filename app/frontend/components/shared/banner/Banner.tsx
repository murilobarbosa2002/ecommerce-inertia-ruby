import { CircleCheck, TriangleAlert } from "lucide-react";

import { type BannerProps } from "./Banner.types";
import { banner } from "./Banner.variants";

export default function Banner({ tone, children }: BannerProps) {
  return (
    <div
      role={tone === "notice" ? "status" : "alert"}
      className={banner({ tone })}
    >
      {tone === "notice" ? (
        <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      ) : (
        <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      )}
      <span>{children}</span>
    </div>
  );
}

import CheckCircleIcon from "@/components/shared/icons/check-circle-icon/CheckCircleIcon";
import ExclamationIcon from "@/components/shared/icons/exclamation-icon/ExclamationIcon";

import { type BannerProps } from "./Banner.types";
import { banner } from "./Banner.variants";

export default function Banner({ tone, children }: BannerProps) {
  return (
    <div
      role={tone === "notice" ? "status" : "alert"}
      className={banner({ tone })}
    >
      {tone === "notice" ? <CheckCircleIcon /> : <ExclamationIcon />}
      <span>{children}</span>
    </div>
  );
}

import { type ParseKeys, type TFunction } from "i18next";

import Badge from "@/components/shared/badge/Badge";
import { type DataTableColumn } from "@/components/shared/data-table/DataTable.types";
import Tooltip from "@/components/shared/tooltip/Tooltip";
import { type AuditEventRecord } from "@/lib/audit-events/auditEvent.types";
import getAuditEventDescription from "@/lib/audit-events/getAuditEventDescription";
import {
  getAuditEventBadgeTone,
  getAuditEventIcon,
} from "@/lib/audit-events/auditEventTypes";

function formatHappenedAt(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

// Só exibição — o dado salvo continua sendo o IP real. "::1"/"127.0.0.1"
// (loopback) é o que todo request em desenvolvimento local mostra, já que
// servidor e navegador rodam na mesma máquina; "localhost" é mais claro
// que o endereço cru pra quem está lendo a tela.
const LOOPBACK_ADDRESSES = new Set(["::1", "127.0.0.1"]);

function formatIpAddress(ipAddress: string): string {
  return LOOPBACK_ADDRESSES.has(ipAddress) ? "localhost" : ipAddress;
}

export default function getAuditEventColumns(
  t: TFunction,
): DataTableColumn<AuditEventRecord>[] {
  return [
    {
      key: "event_type",
      header: t("admin.auditEvents.index.typeColumn"),
      render: (event) => {
        const Icon = getAuditEventIcon(event.event_type);
        return (
          <Badge tone={getAuditEventBadgeTone(event.event_type)}>
            <Icon className="size-3" aria-hidden="true" />
            {t(`admin.auditEvents.types.${event.event_type}` as ParseKeys)}
          </Badge>
        );
      },
    },
    {
      key: "description",
      header: t("admin.auditEvents.index.descriptionColumn"),
      render: (event) => {
        const description = getAuditEventDescription(event, t);
        return (
          <Tooltip content={description}>
            <span className="block max-w-xs truncate">{description}</span>
          </Tooltip>
        );
      },
    },
    {
      key: "performed_by_admin_email",
      header: t("admin.auditEvents.index.actorColumn"),
      render: (event) => {
        if (event.performed_by_admin_email) {
          return (
            <span>
              {event.performed_by_admin_email}
              {event.performed_by_admin_role_name && (
                <span className="block text-xs text-fg-subtle">
                  {event.performed_by_admin_role_name}
                </span>
              )}
            </span>
          );
        }

        // Sem Admin identificado (ex. login_failed com e-mail
        // inexistente): mostra o IP de quem tentou agir, em vez de só "—".
        return event.ip_address ? formatIpAddress(event.ip_address) : "—";
      },
    },
    {
      key: "happened_at",
      header: t("admin.auditEvents.index.happenedAtColumn"),
      sortable: true,
      align: "end",
      render: (event) => (
        <time dateTime={event.happened_at} className="text-fg-subtle">
          {formatHappenedAt(event.happened_at)}
        </time>
      ),
    },
  ];
}

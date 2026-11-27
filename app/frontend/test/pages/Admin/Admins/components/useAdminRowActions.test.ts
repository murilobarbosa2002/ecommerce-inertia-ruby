import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { routerPostMock, usePageMock } = vi.hoisted(() => ({
  routerPostMock: vi.fn(),
  usePageMock: vi.fn(),
}));

vi.mock("@inertiajs/react", () => ({
  router: { post: routerPostMock },
  usePage: usePageMock,
}));

import useAdminRowActions from "@/pages/Admin/Admins/components/useAdminRowActions";
import { reset_two_factor_admin_admin_path } from "@/routes";

const admin = {
  id: 7,
  email_address: "editar@example.com",
  first_name: "Carla",
  last_name: "Editada",
  phone: null,
  role_id: 1,
  role_name: "owner",
};

function mockCurrentAdmin(props: {
  permissions: string[];
  currentAdminId: number | null;
}) {
  usePageMock.mockReturnValue({
    props: {
      current_admin_permissions: props.permissions,
      current_admin_id: props.currentAdminId,
    },
  });
}

describe("useAdminRowActions", () => {
  it("não permite resetar o 2FA sem a permissão reset_two_factor", () => {
    mockCurrentAdmin({ permissions: [], currentAdminId: 1 });

    const { result } = renderHook(() => useAdminRowActions(admin));

    expect(result.current.canResetTwoFactor).toBe(false);
  });

  it("não permite resetar o próprio 2FA, mesmo com a permissão", () => {
    mockCurrentAdmin({
      permissions: ["reset_two_factor"],
      currentAdminId: admin.id,
    });

    const { result } = renderHook(() => useAdminRowActions(admin));

    expect(result.current.canResetTwoFactor).toBe(false);
  });

  it("permite resetar o 2FA de outro admin com a permissão", () => {
    mockCurrentAdmin({ permissions: ["reset_two_factor"], currentAdminId: 1 });

    const { result } = renderHook(() => useAdminRowActions(admin));

    expect(result.current.canResetTwoFactor).toBe(true);
  });

  it("pede confirmação e envia a requisição quando confirmado", () => {
    mockCurrentAdmin({ permissions: ["reset_two_factor"], currentAdminId: 1 });
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const { result } = renderHook(() => useAdminRowActions(admin));
    result.current.resetTwoFactor();

    expect(routerPostMock).toHaveBeenCalledWith(
      reset_two_factor_admin_admin_path(admin.id),
    );
  });

  it("não envia nada quando a confirmação é cancelada", () => {
    mockCurrentAdmin({ permissions: ["reset_two_factor"], currentAdminId: 1 });
    vi.spyOn(window, "confirm").mockReturnValue(false);

    const { result } = renderHook(() => useAdminRowActions(admin));
    result.current.resetTwoFactor();

    expect(routerPostMock).not.toHaveBeenCalled();
  });

  it("não permite excluir sem a permissão delete_admin", () => {
    mockCurrentAdmin({ permissions: [], currentAdminId: 1 });

    const { result } = renderHook(() => useAdminRowActions(admin));

    expect(result.current.canDelete).toBe(false);
  });

  it("não permite excluir a própria conta, mesmo com a permissão", () => {
    mockCurrentAdmin({
      permissions: ["delete_admin"],
      currentAdminId: admin.id,
    });

    const { result } = renderHook(() => useAdminRowActions(admin));

    expect(result.current.canDelete).toBe(false);
  });

  it("permite excluir outro admin com a permissão", () => {
    mockCurrentAdmin({ permissions: ["delete_admin"], currentAdminId: 1 });

    const { result } = renderHook(() => useAdminRowActions(admin));

    expect(result.current.canDelete).toBe(true);
  });
});

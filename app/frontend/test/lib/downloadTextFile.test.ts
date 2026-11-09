import { describe, expect, it, vi } from "vitest";

import downloadTextFile from "@/lib/downloadTextFile";

describe("downloadTextFile", () => {
  it("gera um blob de texto e dispara o download com o nome do arquivo certo", () => {
    const createObjectURLSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:mock-url");
    const revokeObjectURLSpy = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => undefined);
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    const createElementSpy = vi.spyOn(document, "createElement");

    downloadTextFile("codigos.txt", "codigo-1\ncodigo-2");

    const createdAnchor = createElementSpy.mock.results.find(
      (result) => result.value instanceof HTMLAnchorElement,
    )?.value as HTMLAnchorElement | undefined;

    expect(createObjectURLSpy).toHaveBeenCalledOnce();
    const blob = createObjectURLSpy.mock.calls[0]?.[0] as Blob;
    expect(blob.type).toBe("text/plain;charset=utf-8");
    expect(createdAnchor?.download).toBe("codigos.txt");
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");

    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
    clickSpy.mockRestore();
    createElementSpy.mockRestore();
  });
});

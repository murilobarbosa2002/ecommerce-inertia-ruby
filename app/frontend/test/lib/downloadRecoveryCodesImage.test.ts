import { describe, expect, it, vi } from "vitest";

import downloadRecoveryCodesImage from "@/lib/downloadRecoveryCodesImage";

describe("downloadRecoveryCodesImage", () => {
  it("desenha cada código no canvas e dispara o download como imagem", () => {
    const fillTextSpy = vi.fn();
    const fillRectSpy = vi.fn();
    const fakeContext = {
      fillRect: fillRectSpy,
      fillText: fillTextSpy,
      fillStyle: "",
      font: "",
    };

    const getContextSpy = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(fakeContext as unknown as CanvasRenderingContext2D);
    const toBlobSpy = vi
      .spyOn(HTMLCanvasElement.prototype, "toBlob")
      .mockImplementation((callback: BlobCallback) => {
        callback(new Blob(["fake-png"], { type: "image/png" }));
      });
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

    downloadRecoveryCodesImage(
      ["codigo-1", "codigo-2"],
      "Códigos de recuperação",
      "codigos.png",
    );

    const createdAnchor = createElementSpy.mock.results.find(
      (result) => result.value instanceof HTMLAnchorElement,
    )?.value as HTMLAnchorElement | undefined;

    expect(fillTextSpy).toHaveBeenCalledWith(
      "codigo-1",
      expect.any(Number),
      expect.any(Number),
    );
    expect(fillTextSpy).toHaveBeenCalledWith(
      "codigo-2",
      expect.any(Number),
      expect.any(Number),
    );
    expect(createdAnchor?.download).toBe("codigos.png");
    expect(clickSpy).toHaveBeenCalledOnce();

    getContextSpy.mockRestore();
    toBlobSpy.mockRestore();
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
    clickSpy.mockRestore();
    createElementSpy.mockRestore();
  });
});

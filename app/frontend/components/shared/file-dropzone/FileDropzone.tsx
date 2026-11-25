import { useEffect, useState, type DragEvent } from "react";
import { ImageUp, X } from "lucide-react";

import Button from "@/components/shared/button/Button";
import FieldError from "@/components/shared/field-error/FieldError";

import { type FileDropzoneProps } from "./FileDropzone.types";
import { dropzone } from "./FileDropzone.variants";

export default function FileDropzone({
  id,
  value,
  onChange,
  accept,
  maxSize,
  previewUrl,
  previewAlt,
  instructions,
  removeLabel,
  invalidTypeError,
  tooLargeError,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Criada nos próprios handlers que escolhem o arquivo (não via useEffect
  // reagindo a `value`), pra não chamar setState dentro de um efeito. O
  // useEffect abaixo só revoga (nenhum setState) a URL anterior sempre que
  // `objectUrl` muda, e a última na desmontagem — cleanup normal de
  // recurso do navegador, não derivação de estado.
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const previewSrc = objectUrl ?? previewUrl ?? null;

  const handleFile = (file: File) => {
    if (!accept.includes(file.type)) {
      setError(invalidTypeError);
      return;
    }

    if (file.size > maxSize) {
      setError(tooLargeError);
      return;
    }

    setError(null);
    setObjectUrl(URL.createObjectURL(file));
    onChange(file);
  };

  const cancelSelection = () => {
    setError(null);
    setObjectUrl(null);
    onChange(null);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    // O índice de FileList do lib.dom.d.ts não é tipado como nullable (sem
    // noUncheckedIndexedAccess), mas dataTransfer.files pode vir vazio de
    // fato — o check abaixo é real, não redundante.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (file) handleFile(file);
  };

  return (
    <div>
      {/* role="presentation": área de arrastar-e-soltar é só reforço de
          mouse/touch — o input real (abaixo, sr-only) já é focável e
          operável por teclado/leitor de tela sozinho via o label. */}
      <div
        role="presentation"
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => {
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        className={dropzone({ dragging: isDragging, invalid: Boolean(error) })}
      >
        <label htmlFor={id} className="contents cursor-pointer">
          {previewSrc ? (
            <img
              src={previewSrc}
              alt={previewAlt}
              className="size-16 rounded-sm object-contain"
            />
          ) : (
            <ImageUp className="size-6 text-fg-subtle" aria-hidden="true" />
          )}
          <span className="text-sm text-fg-muted">{instructions}</span>
          <input
            id={id}
            type="file"
            accept={accept.join(",")}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleFile(file);
              event.target.value = "";
            }}
          />
        </label>
      </div>

      {/* Só quando há um arquivo novo escolhido — cancela a seleção e volta
          a mostrar o preview existente (previewUrl), não apaga um logo já
          salvo (essa tela não tem ação de "remover logo"). */}
      {value && (
        <Button
          type="button"
          intent="ghost"
          size="sm"
          className="mt-2"
          onClick={cancelSelection}
        >
          <X className="size-4" aria-hidden="true" />
          {removeLabel}
        </Button>
      )}

      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

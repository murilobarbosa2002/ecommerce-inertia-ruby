import GradientBlob from "./GradientBlob";

// Composição pronta de duas GradientBlob, pro fundo decorativo de uma
// seção "hero" (ex. PageHeader) — qualquer outra tela que precisar do
// mesmo efeito usa este componente, não reimplementa os blobs à mão.
export default function GradientBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <GradientBlob
        className="absolute -top-24 -left-16 size-72 bg-accent/25"
        movement={{
          x: [0, 40, -20, 0],
          y: [0, 24, -28, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        duration={18}
      />
      <GradientBlob
        className="absolute -right-10 -bottom-24 size-80 bg-accent/15"
        movement={{
          x: [0, -30, 20, 0],
          y: [0, -20, 28, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        duration={22}
      />
    </div>
  );
}

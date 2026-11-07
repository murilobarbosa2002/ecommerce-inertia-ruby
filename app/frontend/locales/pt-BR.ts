// Conteúdo de produto visível a humano no frontend, organizado por página —
// mesma lógica de separação já aplicada no backend (docs/adr/0014), só que
// aqui não há arquivo separado pra "ferramenta interna" (não existe CLI no
// frontend). `as const` preserva o tipo literal, usado pela augmentation em
// app/frontend/types/i18next.d.ts pra validar em compile-time toda chave
// passada a `t("...")` (ver CONTRIBUTING.md sobre a sintaxe `t($ => $.chave)`
// dos exemplos oficiais do react-i18next não type-checkar nesta versão).
export const ptBR = {
  admin: {
    session: {
      new: {
        title: "Entrar",
        emailLabel: "E-mail",
        passwordLabel: "Senha",
        emailRequired: "Informe o e-mail",
        passwordRequired: "Informe a senha",
        submit: "Entrar",
        submitting: "Entrando...",
        forgotPassword: "Esqueci minha senha",
      },
    },
    password: {
      new: {
        title: "Esqueci minha senha",
        emailLabel: "E-mail",
        emailRequired: "Informe o e-mail",
        submit: "Enviar instruções",
        submitting: "Enviando...",
        backToLogin: "Voltar pro login",
      },
      edit: {
        title: "Nova senha",
        passwordLabel: "Nova senha",
        passwordConfirmationLabel: "Confirme a nova senha",
        passwordRequired: "Informe a nova senha",
        passwordConfirmationRequired: "A confirmação de senha é obrigatória",
        passwordMismatch: "As senhas não coincidem",
        submit: "Redefinir senha",
        submitting: "Redefinindo...",
      },
    },
    twoFactorAuthentication: {
      new: {
        title: "Verificação em duas etapas",
        description:
          "Digite o código do seu aplicativo autenticador ou um código de recuperação.",
        codeLabel: "Código",
        codeRequired: "Informe o código",
        submit: "Verificar",
        submitting: "Verificando...",
      },
    },
  },
} as const;

// Organizado por página, igual ao backend (docs/adr/0014). `as const`
// preserva o tipo literal usado por app/frontend/types/i18next.d.ts pra
// validar toda chave passada a `t("...")` em compile-time.
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

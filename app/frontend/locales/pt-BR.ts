// Organizado por página, igual ao backend (docs/adr/0014). `as const`
// preserva o tipo literal usado por app/frontend/types/i18next.d.ts pra
// validar toda chave passada a `t("...")` em compile-time.
export const ptBR = {
  shared: {
    themeToggle: {
      switchToLight: "Ativar tema claro",
      switchToDark: "Ativar tema escuro",
    },
    panelLayout: {
      brand: "Ecommerce Inertia Ruby",
      signOut: "Sair",
      manageAdmins: "Gerenciar admins",
    },
    passwordGenerator: {
      includeUppercase: "Maiúsculas",
      includeNumbers: "Números",
      includeSpecialCharacters: "Caracteres especiais",
      length: "Quantidade de caracteres",
      generate: "Gerar senha",
      copy: "Copiar",
      copied: "Copiado!",
    },
  },
  admin: {
    dashboard: {
      show: {
        title: "Painel",
        placeholder: "Em construção — mais telas chegam nas próximas fases.",
      },
    },
    admins: {
      index: {
        title: "Admins",
        newButtonLabel: "Novo admin",
        emailColumn: "E-mail",
        roleColumn: "Papel",
        editLink: "Editar",
      },
      new: {
        title: "Novo admin",
        emailLabel: "E-mail",
        emailRequired: "Informe o e-mail",
        passwordLabel: "Senha",
        passwordRequired: "Informe a senha",
        passwordConfirmationLabel: "Confirme a senha",
        passwordConfirmationRequired: "A confirmação de senha é obrigatória",
        passwordMismatch: "As senhas não coincidem",
        roleLabel: "Papel",
        rolePlaceholder: "Selecione um papel",
        roleRequired: "O papel é obrigatório",
        changeReasonLabel: "Motivo da criação",
        changeReasonRequired: "Informe o motivo da criação",
        submit: "Criar admin",
        submitting: "Criando...",
        backToList: "Voltar pra lista",
      },
      edit: {
        title: "Editar admin",
        emailLabel: "E-mail",
        emailRequired: "Informe o e-mail",
        roleLabel: "Papel",
        rolePlaceholder: "Selecione um papel",
        roleRequired: "O papel é obrigatório",
        changeReasonLabel: "Motivo da alteração",
        changeReasonRequired: "Informe o motivo da alteração",
        submit: "Salvar alterações",
        submitting: "Salvando...",
        backToList: "Voltar pra lista",
      },
    },
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

require "rails_helper"

# Fluxo completo de ativar o 2FA numa conta que ainda não tem, dirigindo o
# navegador de verdade pelas páginas React reais: dashboard (aviso
# obrigatório) → configurar 2FA (QR code + código) → códigos de
# recuperação, incluindo as três ações da tela de códigos (copiar, baixar
# .txt, baixar imagem) que só fazem sentido verificadas num navegador de
# verdade (clipboard e download de arquivo não existem em jsdom).
RSpec.describe "Fluxo de ativar o 2FA", type: :system do
  it "ativa o 2FA, mostra os códigos de recuperação e cobre copiar/baixar .txt/baixar imagem" do
    admin = create(:admin)

    visit new_admin_session_path
    fill_in "E-mail", with: admin.email_address
    fill_in "Senha", with: AdminCredentials::VALID_PASSWORD
    click_button "Entrar"

    expect(page).to have_content("Autenticação de dois fatores obrigatória")
    click_link "Configurar agora"

    expect(page).to have_current_path(new_admin_two_factor_path)
    expect(page).to have_content("Configurar autenticação de dois fatores")

    otp_secret = admin.reload.otp_secret
    fill_in "Código de confirmação", with: ROTP::TOTP.new(otp_secret).now
    click_button "Ativar"

    expect(page).to have_content("Guarde seus códigos de recuperação")
    # count: 10 (não minimum: 1) — a tela agora anima os códigos em
    # cascata (StaggerGroup/StaggerItem); sem isso, o Capybara para de
    # esperar assim que o primeiro aparecer, pegando a lista pela metade.
    recovery_codes = within("main") { all("li", count: 10).map(&:text) }
    expect(recovery_codes.size).to eq(10)

    # Em vez de conceder permissão de clipboard-read (frágil em Chromium
    # headless, timeout mesmo depois de Browser.grantPermissions),
    # intercepta a própria chamada de navigator.clipboard.writeText —
    # continua chamando a função real (pra "Copiado!" aparecer de
    # verdade), só grava o texto recebido pra conferir depois.
    page.execute_script(<<~JS)
      window.__copiedText = null;
      const originalWriteText = navigator.clipboard.writeText.bind(navigator.clipboard);
      navigator.clipboard.writeText = (text) => {
        window.__copiedText = text;
        return originalWriteText(text);
      };
    JS

    click_button "Copiar"
    expect(page).to have_button("Copiado!")
    clipboard_text = page.evaluate_script("window.__copiedText")
    expect(clipboard_text.split("\n")).to match_array(recovery_codes)

    # O Chromium deste ambiente roda sandboxed (confinamento snap) e grava
    # o download num diretório que o processo do RSpec não enxerga —
    # `filePath`/`save_path` não são um caminho compartilhado de verdade
    # aqui, só dentro do próprio Chromium. A verificação real possível é
    # via os metadados que o Chrome reporta por CDP (Browser.downloadWillBegin/
    # downloadProgress): nome sugerido batendo com o esperado, download
    # concluído (não cancelado/parcial) e com conteúdo de fato (bytes > 0).
    downloads = page.driver.browser.page.downloads
    downloads.set_behavior(save_path: Dir.mktmpdir)

    downloads.wait { click_button "Baixar .txt" }
    txt_download = downloads.files.find { |file| file["suggestedFilename"] == "codigos-de-recuperacao.txt" }
    expect(txt_download).to include("state" => "completed")
    expect(txt_download["receivedBytes"]).to eq(txt_download["totalBytes"])
    expect(txt_download["totalBytes"]).to be_positive

    downloads.wait { click_button "Salvar como imagem" }
    image_download = downloads.files.find { |file| file["suggestedFilename"] == "codigos-de-recuperacao.png" }
    expect(image_download).to include("state" => "completed")
    expect(image_download["receivedBytes"]).to eq(image_download["totalBytes"])
    expect(image_download["totalBytes"]).to be_positive

    click_button "Continuar"

    expect(page).to have_current_path(root_path)
    expect(page).to have_content("Painel")
    expect(admin.reload.otp_required_for_login?).to be true
  end
end

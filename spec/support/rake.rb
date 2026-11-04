require "rake"

Rails.application.load_tasks if Rake::Task.tasks.empty?

# Chamada de Kernel#exit em código sob teste levanta SystemExit, que o runner
# do RSpec não resgata por padrão (propaga e derruba o processo inteiro da
# suíte, não só o example atual) — achado real ao testar lib/tasks/admin.rake:
# um teste de caminho feliz que não esperava exit travava a suíte inteira em
# vez de falhar de forma limpa quando a implementação quebrava. Stubar exit
# pra levantar este erro normal (StandardError) em todo spec type: :task
# garante que qualquer exit inesperado vira uma falha de teste legível, não um
# processo morto sem explicação.
RakeTaskExited = Class.new(StandardError)

RSpec.configure do |config|
  config.before(:each, type: :task) do
    Rake::Task.tasks.each(&:reenable)
    allow_any_instance_of(Object).to receive(:exit) do |_receiver, status = 0|
      raise RakeTaskExited, "exit(#{status.inspect}) chamado"
    end
  end
end

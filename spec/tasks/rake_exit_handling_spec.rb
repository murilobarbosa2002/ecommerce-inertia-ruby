require "rails_helper"

RSpec.describe "stub de exit em specs de rake task", type: :task do
  it "converte exit em RakeTaskExited em vez de derrubar o processo inteiro" do
    task = Rake::Task.define_task("spec_sandbox:chama_exit") { exit 1 }

    expect { task.invoke }.to raise_error(RakeTaskExited, "exit(1) chamado")
  end
end

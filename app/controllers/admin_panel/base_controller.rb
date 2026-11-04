module AdminPanel
  class BaseController < ApplicationController
    include AdminPanel::Authentication
  end
end

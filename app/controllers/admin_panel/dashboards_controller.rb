module AdminPanel
  class DashboardsController < AdminPanel::BaseController
    def show
      render inertia: "Admin/Dashboard/Show"
    end
  end
end

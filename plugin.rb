# name: discourse-element-hider
# about: Скрывает элементы страницы по CSS-селекторам, заданным администратором через настройки сайта
# version: 0.1.0
# authors: calayx
# url: https://github.com/ban2zai/discourse-element-hider

add_admin_route "element_hider.admin_title", "element-hider"

Discourse::Application.routes.append do
  get "/admin/plugins/element-hider" => "admin/plugins#index",
      constraints: StaffConstraint.new
end

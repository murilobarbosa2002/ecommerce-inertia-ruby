# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_11_09_190738) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "admin_recovery_codes", force: :cascade do |t|
    t.bigint "admin_id", null: false
    t.string "code_digest", null: false
    t.datetime "used_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index [ "admin_id" ], name: "index_admin_recovery_codes_on_admin_id"
    t.index [ "code_digest" ], name: "index_admin_recovery_codes_on_code_digest", unique: true
  end

  create_table "admin_sessions", force: :cascade do |t|
    t.bigint "admin_id", null: false
    t.string "ip_address"
    t.string "user_agent"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index [ "admin_id" ], name: "index_admin_sessions_on_admin_id"
  end

  create_table "admins", force: :cascade do |t|
    t.string "email_address", null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "failed_login_attempts", default: 0, null: false
    t.datetime "locked_at"
    t.string "otp_secret"
    t.boolean "otp_required_for_login", default: false, null: false
    t.datetime "last_otp_at"
    t.bigint "role_id", null: false
    t.index [ "email_address" ], name: "index_admins_on_email_address", unique: true
    t.index [ "role_id" ], name: "index_admins_on_role_id"
  end

  create_table "audit_events", force: :cascade do |t|
    t.integer "event_type", null: false
    t.bigint "admin_id"
    t.inet "ip_address"
    t.string "user_agent"
    t.jsonb "metadata", default: {}, null: false
    t.datetime "created_at", null: false
    t.bigint "performed_by_admin_id"
    t.index [ "admin_id" ], name: "index_audit_events_on_admin_id"
    t.index [ "event_type" ], name: "index_audit_events_on_event_type"
    t.index [ "performed_by_admin_id" ], name: "index_audit_events_on_performed_by_admin_id"
  end

  create_table "permissions", force: :cascade do |t|
    t.string "key", limit: 100, null: false
    t.string "description", limit: 500, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index [ "key" ], name: "index_permissions_on_key", unique: true
  end

  create_table "role_permissions", force: :cascade do |t|
    t.bigint "role_id", null: false
    t.bigint "permission_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index [ "permission_id" ], name: "index_role_permissions_on_permission_id"
    t.index [ "role_id", "permission_id" ], name: "index_role_permissions_on_role_id_and_permission_id", unique: true
    t.index [ "role_id" ], name: "index_role_permissions_on_role_id"
  end

  create_table "roles", force: :cascade do |t|
    t.string "name", limit: 100, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index [ "name" ], name: "index_roles_on_name", unique: true
  end

  create_table "versions", force: :cascade do |t|
    t.string "whodunnit"
    t.datetime "created_at"
    t.bigint "item_id", null: false
    t.string "item_type", null: false
    t.string "event", null: false
    t.text "object"
    t.text "object_changes"
    t.string "change_reason", limit: 500
    t.index [ "item_type", "item_id" ], name: "index_versions_on_item_type_and_item_id"
  end

  add_foreign_key "admin_recovery_codes", "admins"
  add_foreign_key "admin_sessions", "admins"
  add_foreign_key "admins", "roles"
  add_foreign_key "audit_events", "admins"
  add_foreign_key "audit_events", "admins", column: "performed_by_admin_id", on_delete: :nullify
  add_foreign_key "role_permissions", "permissions"
  add_foreign_key "role_permissions", "roles"
end

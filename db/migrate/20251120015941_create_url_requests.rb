class CreateUrlRequests < ActiveRecord::Migration[8.0]
  def change
    create_table :url_requests, id: :uuid do |t|
      t.string :url
      t.integer :status, default: 0
      t.string :result

      t.timestamps
    end
  end
end

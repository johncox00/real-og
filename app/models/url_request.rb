class UrlRequest < ApplicationRecord
  enum :status, [:requested, :processing, :success, :error]
  before_create :generate_uuid

  def generate_uuid
    self.id = SecureRandom.uuid
  end
end

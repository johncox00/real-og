class UrlRequest < ApplicationRecord
  enum :status, [ :requested, :processing, :success, :error ]
  before_create :generate_uuid
  after_commit :broadcast

  def generate_uuid
    self.id = SecureRandom.uuid
  end

  def broadcast
    UrlRequestUpdatesChannel.broadcast_to(self, as_json)
  end
end

class UrlRequestUpdatesChannel < ApplicationCable::Channel
  def subscribed
    @url_request = UrlRequest.find(params[:id])
    puts "Subscribed to UrlRequestUpdatesChannel id=#{@url_request.id}"
    stream_for @url_request
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end

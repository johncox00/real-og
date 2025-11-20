class UrlRequestsController < ApplicationController
  def index
    page = pagination_params[:page].to_i || 1
    per = pagination_params[:per_page].to_i || 10
    per = 10 if per < 1
    per = 100 if per > 100
    @url_requests = UrlRequest.order(created_at: :desc).limit(per).offset((page-1)*per)
    total_pages = UrlRequest.count / per + 1

    respond_to do |format|
      format.json { render json: { page: page, total_pages: total_pages, data: @url_requests } }
    end
  end

  def create
    puts params
    @url_request = UrlRequest.new(url_request_params)
    if @url_request.save
      ProcessRequestJob.perform_later @url_request.id
      respond_to do |format|
        format.json { render json: @url_request.to_json }
      end
    end
  end

  private
    # Using a private method to encapsulate the permitted parameters is a good
    # pattern. You can use the same list for both create and update.
    def url_request_params
      params.expect(url_request: [:url])
    end

    def pagination_params
      params.permit(:page, :per_page)
    end
end

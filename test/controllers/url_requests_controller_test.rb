require "test_helper"

class UrlRequestsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get url_requests_index_url
    assert_response :success
  end

  test "should get create" do
    get url_requests_create_url
    assert_response :success
  end
end

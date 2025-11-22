
class ProcessRequestJob < ApplicationJob
  queue_as :default

  def perform(url_request_id)
    puts "Processing request #{url_request_id}"
    url_request = UrlRequest.find(url_request_id)
    begin
      url_request.update(status: :processing)
      response = HTTParty.get(
        url_request.url,
        headers: {
          "User-Agent" => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " \
                          "AppleWebKit/537.36 (KHTML, like Gecko) " \
                          "Chrome/119.0.0.0 Safari/537.36",
          "Accept-Language" => "en-US,en;q=0.9"
        }
      )
      doc = Nokogiri::HTML(response.body)
      og_tags = {}
      doc.css('meta[property^="og"]').each do |meta_tag|
        property = meta_tag["property"]
        content = meta_tag["content"]
        og_tags[property] = content
      end
      # if og_tags.empty? we could abort and queue up another job here that uses Playwright or Selenium to render the site in case it's a SPA that needs JS to render the actual page
      if og_tags["og:image"] then
        puts "Found OpenGraph image: #{og_tags["og:image"]}"
        url_request.update(status: :success, result: og_tags["og:image"])
      else
        puts "No OpenGraph image found"
        url_request.update(status: :error, result: "No OpenGraph image found")
      end
    rescue StandardError => e
      puts "ERROR! #{e.message}"
      e.backtrace[0, 10].each do |line|
        puts line
      end
      url_request.update(status: :error, result: e.message)
    end
  end
end

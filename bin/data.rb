require "net/http"
require "JSON"

url = "https://json-loewen-sundown-towns.pantheonsite.io/sundown/database/geojson.php"
resp = Net::HTTP.get_response(URI.parse(url))
data = JSON.parse(resp.body)
features = data["features"]

File.open("./towns.geojson", 'w') { |file| file.write(resp.body) }
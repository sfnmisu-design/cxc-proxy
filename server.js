const https = require("https");

const API_KEY = "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";

function handleRequest(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405);
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  let body = "";
  req.on("data", function(chunk) { body += chunk; });
  req.on("end", function() {
    const options = {
      hostname: "api.anthropic.com",
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Length": Buffer.byteLength(body)
      }
    };

    const apiReq = https.request(options, function(apiRes) {
      let data = "";
      apiRes.on("data", function(chunk) { data += chunk; });
      apiRes.on("end", function() {
        res.writeHead(apiRes.statusCode, { "Content-Type": "application/json" });
        res.end(data);
      });
    });

    apiReq.on("error", function(err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    });

    apiReq.write(body);
    apiReq.end();
  });
}

const PORT = process.env.PORT || 3000;
require("http").createServer(handleRequest).listen(PORT, function() {
  console.log("CXC Proxy running on port " + PORT);
});

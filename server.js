const https = require("https");
const http = require("http");

const API_KEY = process.env.ANTHROPIC_API_KEY;

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
    res.writeHead(405, {"Content-Type":"application/json"});
    res.end(JSON.stringify({error:"Method not allowed"}));
    return;
  }

  if (!API_KEY) {
    res.writeHead(500, {"Content-Type":"application/json"});
    res.end(JSON.stringify({error:"API key not configured"}));
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
        res.writeHead(apiRes.statusCode, {"Content-Type":"application/json"});
        res.end(data);
      });
    });

    apiReq.on("error", function(err) {
      res.writeHead(500, {"Content-Type":"application/json"});
      res.end(JSON.stringify({error:err.message}));
    });

    apiReq.write(body);
    apiReq.end();
  });
}

const PORT = process.env.PORT || 3000;
http.createServer(handleRequest).listen(PORT, function() {
  console.log("CXC Proxy running on port " + PORT);
});

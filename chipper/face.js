var body = $response.body;
var obj = JSON.parse(body);
obj['isFrozen'] = false
body = JSON.stringify(obj);
$done({body});

var body = $response.body;
let url = $request.url;
const regex_rul_statues = /^https:\/\/auth\.chippercash\.com\/session\/status/;
const regex_rul_unfreeze = /^https:\/\/auth\.chippercash\.com\/session\/unfreeze/;

if (regex_rul_statues.test(url)) {
    var obj = JSON.parse(body);
    obj['isFrozen'] = false
    body = JSON.stringify(obj);
    $done({body});
} else if (regex_rul_unfreeze.test(url)) {
    var obj = JSON.parse(body);
    obj['success'] = true
    body = JSON.stringify(obj);
    $done({body});
} else {
    $done({body});
}

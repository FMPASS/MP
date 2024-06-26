let headers = $request.headers;

// 替换请求头中的值
if (headers['client-version']) {
    headers['client-version'] = '1.6.5';
}

// 返回修改后的请求
$done({headers});

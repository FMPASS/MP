const $tool = new Tool()

let body = ''

if ($response.headers['Content-Encoding'] === 'gzip') {
    // 使用 $utils.ungzip 解压数据
    let decompressedData = $utils.ungzip($response.body);
    // 将解压后的数据转换为字符串
    body = new TextDecoder('utf-8').decode(decompressedData);
} else {
    body = $response.body;
}

//正则匹配内容获取cartId
let cartId = extractFirstNonEmptyKeywordId('cartId', body)

if (cartId == null || cartId === '') {
    let statusText = extractFirstNonEmptyKeywordId('statusText', body)
    $tool.notify('注意', '家庭组购买提示', '购买出错，没有获取到cartId，错误信息:' + statusText)
} else {
    //保存购物车id
    $tool.write(cartId, 'cartId')
}

$done({})

function extractFirstNonEmptyKeywordId(keyword, htmlContent) {
    const regex = new RegExp(`[\'"]${keyword}[\'"]:\\s*[\'"]([^\'"]*)[\'"]`, "ig");
    let match;
    while ((match = regex.exec(htmlContent)) !== null) {
        const id = match[1];
        if (id) {
            return id;
        }
    }
    return null;
}


function Tool() {
    _node = (() => {
        if (typeof require == "function") {
            const request = require('request')
            return ({request})
        } else {
            return (null)
        }
    })()
    _isSurge = typeof $httpClient != "undefined"
    _isQuanX = typeof $task != "undefined"
    this.isSurge = _isSurge
    this.isQuanX = _isQuanX
    this.isResponse = typeof $response != "undefined"
    this.notify = (title, subtitle, message) => {
        if (_isQuanX) $notify(title, subtitle, message)
        if (_isSurge) $notification.post(title, subtitle, message)
        if (_node) console.log(JSON.stringify({title, subtitle, message}));
    }
    this.write = (value, key) => {
        if (_isQuanX) return $prefs.setValueForKey(value, key)
        if (_isSurge) return $persistentStore.write(value, key)
    }
    this.read = (key) => {
        if (_isQuanX) return $prefs.valueForKey(key)
        if (_isSurge) return $persistentStore.read(key)
    }
    this.get = (options, callback) => {
        if (_isQuanX) {
            if (typeof options == "string") options = {url: options}
            options["method"] = "GET"
            $task.fetch(options).then(response => {
                callback(null, adapterStatus(response), response.body)
            }, reason => callback(reason.error, null, null))
        }

        if (_isSurge) {
            options.timeout = 60
            $httpClient.get(options, (error, response, body) => {
                callback(error, adapterStatus(response), body)
            })
        }

        if (_node) _node.request(options, (error, response, body) => {
            callback(error, adapterStatus(response), body)
        })
    }
    this.post = (options, callback) => {
        if (_isQuanX) {
            if (typeof options == "string") options = {url: options}
            options["method"] = "POST"
            $task.fetch(options).then(response => {
                callback(null, adapterStatus(response), response.body)
            }, reason => callback(reason.error, null, null))
        }

        if (_isSurge) {
            options.timeout = 60
            $httpClient.post(options, (error, response, body) => {
                callback(error, adapterStatus(response), body)
            })
        }

        if (_node) _node.request.post(options, (error, response, body) => {
            callback(error, adapterStatus(response), body)
        })
    }
    const adapterStatus = (response) => {
        if (response) {
            if (response.status) {
                response["statusCode"] = response.status
            } else if (response.statusCode) {
                response["status"] = response.statusCode
            }
        }
        return response
    }
}


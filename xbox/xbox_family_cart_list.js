if ($request.method.toUpperCase() !== 'OPTIONS') {
    const $tool = new Tool()
    let headers = $request.headers;
    delete headers['Content-Encoding'];
    delete headers['content-encoding'];
    const bodyString = $request.body;

    const params = new URLSearchParams(bodyString);
    if (params.has('market')) {
        params.set('market', 'NG');
    }

    $done({body: params.toString(), headers});

} else {
    $done({})
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


class HttpRequest {

    static get(route, params = {}) {
        return HttpRequest.request('GET', route, params);
    }

    static post(route, params = {}) {
        return HttpRequest.request('POST', route, params);
    }

    static delete(route, params = {}) {
        return HttpRequest.request('DELETE', route, params);
    }

    static put(route, params = {}) {
        return HttpRequest.request('PUT', route, params);
    }

    static request(method, url, params = {}) {
        return new Promise((resolve, reject) => {
            let ajax = new XMLHttpRequest();
            ajax.open(method.toUpperCase(), url);
            ajax.onerror = event => {
                reject(event);
            }
            ajax.onload = event => {
                let obj = {};
                try {
                    obj = JSON.parse(ajax.responseText);
                } catch(e) {
                    console.log(e)
                    reject(e);
                }
                console.log("OBJ",obj)
                resolve(obj)
            }

            ajax.setRequestHeader('Content-Type', 'application/json');
            console.log("PARAMS = ",params)
            //chama o ajax
            ajax.send(JSON.stringify(params));
        })
    }
}
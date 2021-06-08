class Fetch {

    static get(route, params = {}) {
        return Fetch.request('GET', route, params);
    }

    static post(route, params = {}) {
        return Fetch.request('POST', route, params);
    }

    static delete(route, params = {}) {
        return Fetch.request('DELETE', route, params);
    }

    static put(route, params = {}) {
        return Fetch.request('PUT', route, params);
    }

    static request(method, url, params = {}) {
        return new Promise((resolve, reject) => {
            let request;

            switch(method.toLowerCase()) {
                //passado a url caso for get
                case 'get':
                    request = url;
                break
                default:
                    //caso contrário é montado uma requisição com mais informações
                    request = new Request(url, {
                        method,
                        body: JSON.stringify(params),
                        headers: new Headers({
                            'Content-Type': 'application/json'
                        })
                    });
                break;
            }

            fetch(request).then(response => {
                response.json().then(json => {
                    resolve(json);
                }).catch(e => {
                    reject(e);
                });
            }).catch(e => {
                reject(e);
            });
        })
    }
}
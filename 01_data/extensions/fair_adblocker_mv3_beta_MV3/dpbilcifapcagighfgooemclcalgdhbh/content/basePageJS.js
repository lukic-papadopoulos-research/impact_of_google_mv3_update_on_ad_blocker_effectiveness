function basePageJs() {
    // @ts-ignore
    if (window.googletag) {
        const proxy = new Proxy(
        // @ts-ignore
        window.googletag, {
            get: function (a, b, c) {
                return "pubads" === b || "display" === b ?
                    function () {
                        return {};
                    } :
                    a[b];
            }
        });
        // @ts-ignore
        window.googletag = proxy;
    }
    else {
        let pak = undefined;
        Object.defineProperty(window, "googletag", {
            configurable: !1,
            get: function () {
                return pak && (pak.pubads = function () {
                    return {};
                }),
                    pak;
            },
            set: function (a) {
                return pak = a;
            }
        });
    }
    let tmp = undefined;
    Object.defineProperty(window, "websredir", {
        configurable: false,
        get: function () {
            return tmp;
        },
        set: function (obj) {
            if (obj instanceof Array) {
                throw "";
            }
            else {
                tmp = obj;
                return tmp;
            }
        }
    });
}

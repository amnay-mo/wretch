import { mix } from "./mix";
import conf from "./config";
export var resolver = function (url) { return function (opts) {
    if (opts === void 0) { opts = {}; }
    var req = fetch(url, mix(conf.defaults, opts));
    var wrapper = req.then(function (response) {
        if (!response.ok) {
            return response[conf.errorType || "text"]().then(function (_) {
                var err = new Error(_);
                err[conf.errorType] = _;
                err["status"] = response.status;
                err["response"] = response;
                throw err;
            });
        }
        return response;
    });
    var catchers = [];
    var doCatch = function (promise) {
        return catchers.reduce(function (accumulator, catcher) { return accumulator.catch(catcher); }, promise);
    };
    var wrapTypeParser = function (funName) { return function (cb) { return funName ?
        doCatch(wrapper.then(function (_) { return _ && _[funName](); }).then(function (_) { return _ && cb && cb(_) || _; })) :
        doCatch(wrapper.then(function (_) { return _ && cb && cb(_) || _; })); }; };
    var responseTypes = {
        /**
         * Retrieves the raw result as a promise.
         */
        res: wrapTypeParser(null),
        /**
         * Retrieves the result as a parsed JSON object.
         */
        json: wrapTypeParser("json"),
        /**
         * Retrieves the result as a Blob object.
         */
        blob: wrapTypeParser("blob"),
        /**
         * Retrieves the result as a FormData object.
         */
        formData: wrapTypeParser("formData"),
        /**
         * Retrieves the result as an ArrayBuffer object.
         */
        arrayBuffer: wrapTypeParser("arrayBuffer"),
        /**
         * Retrieves the result as a string.
         */
        text: wrapTypeParser("text"),
        /**
         * Catches an http response with a specific error code and performs a callback.
         */
        error: function (code, cb) {
            catchers.push(function (err) {
                if (err.status === code)
                    cb(err);
                else
                    throw err;
            });
            return responseTypes;
        },
        /**
         * Catches a bad request (http code 400) and performs a callback.
         */
        badRequest: function (cb) { return responseTypes.error(400, cb); },
        /**
         * Catches an unauthorized request (http code 401) and performs a callback.
         */
        unauthorized: function (cb) { return responseTypes.error(401, cb); },
        /**
         * Catches a forbidden request (http code 403) and performs a callback.
         */
        forbidden: function (cb) { return responseTypes.error(403, cb); },
        /**
         * Catches a "not found" request (http code 404) and performs a callback.
         */
        notFound: function (cb) { return responseTypes.error(404, cb); },
        /**
         * Catches a timeout (http code 408) and performs a callback.
         */
        timeout: function (cb) { return responseTypes.error(408, cb); },
        /**
         * Catches an internal server error (http code 500) and performs a callback.
         */
        internalError: function (cb) { return responseTypes.error(500, cb); }
    };
    return responseTypes;
}; };
//# sourceMappingURL=resolver.js.map
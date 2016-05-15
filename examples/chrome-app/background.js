var appid = "nbkaplidonnphljpmolopeigkfjihdoh"; // ID of API Proxy extension

function getClosure(methods = [], property = null) {
    if (typeof methods == "string") methods = [methods];
    if (property) methods.push(property)
    return {
        apply: function(target, thisArg, argumentsList) {
            console.log("Call func " + methods.join(".") + " with arguments ", argumentsList);
            var callback = argumentsList.pop();
            typesOfArgs = [];
            for (var i in argumentsList) {
                if (!(argumentsList.hasOwnProperty(i))) continue;
                typesOfArgs.push(typeof argumentsList[i]);
                if (argumentsList[i] instanceof Function)
                    argumentsList[i] = argumentsList[i].toString();
            }
            chrome.runtime.sendMessage(appid, {
                method: "api_proxy",
                args: {
                    path: methods,
                    args: argumentsList,
                    types: typesOfArgs
                }
            }, cb)

            function cb() {
                methods = [];
                callback.apply(null, Array.from(arguments));
            }
        },
        get: function(target, property, receiver) {
            if (property in target) return target[property];
            //console.log("Get " + property);
            return new Proxy(function(){}, getClosure(Array.from(methods), property));
        }
    }
}

// create the proxy over the existing object "chrome"
// existing property of the initial chrome object ('target') are returned if defined (see handler get)
// else we call remote ones (see handler apply)
var chromeProxy = new Proxy(chrome, getClosure('chrome'));

// here we need to ADD a callback because messaging is async so we even sync method are async through the proxy
chromeProxy.extension.getURL('i/background.js', console.log.bind(console));

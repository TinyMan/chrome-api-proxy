function listener(msg, sender, sendResponse) {
    var ret = false;
    switch (msg.method) {
        case "api_proxy":
            ret = proxyAPI(Array.from(msg.args.path), Array.from(msg.args.args), sendResponse);
            break;
        default:
            break;
    }
    return ret;
}

function proxyAPI(path, args, sendResponse) {
    args.push(sendResponse);
    callRecursive(window, path, args);
    return true;
}

function callRecursive(current, methods, args) {
    var method = methods.shift();
    //console.log("Calling " + method)
    try {
        if (methods.length) {
            return callRecursive(current[method], methods, args);
        } else {
            //console.log("arguments: ");
            //console.log(args);
            try {
                return current[method].apply(current, args);
            } catch (e) {
                var cb = args.pop();
                if (e instanceof TypeError) {
                    return cb(current[method]);
                }
                return cb(current[method].apply(current, args));
            }
        }
    } catch (e) {
        args[args.length - 1](e.toString());
    }
}

chrome.extension.onMessageExternal.addListener(listener)

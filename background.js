function listener(msg, sender, sendResponse) {
    var ret = false;
    switch (msg.method) {
        case "api_proxy":
            ret = proxyAPI(Array.from(msg.args.path), Array.from(msg.args.args), Array.from(msg.args.types), sendResponse);
            break;
        default:
            break;
    }
    return ret;
}

function proxyAPI(path, args, types, sendResponse) {
    args.push(sendResponse);
    console.log(types);
    for (var i in types) {
        if (types[i] == "function") {
            //console.log("creating function: " + i);
            //console.log("return " + args[i]);
            args[i] = new Function("return " + args[i])();
        }
    }
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

chrome.runtime.onStartup.addListener(function() {
    chrome.storage.local.get('startupScripts', function(data) {
        for (i in data.startupScripts) {
            if (!(data.startupScripts.hasOwnProperty(i))) continue;
            (new Function(data.startupScripts[i]))();
        }
    })
})

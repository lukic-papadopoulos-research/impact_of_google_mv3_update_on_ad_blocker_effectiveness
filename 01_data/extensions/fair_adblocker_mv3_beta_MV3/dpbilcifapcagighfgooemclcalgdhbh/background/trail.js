function getTrailText(trail) {
    let result = "";
    if (trail) {
        for (let i = 0; i < trail.length; i++) {
            if (i > 0) {
                let extraSymbol = '';
                switch (trail[i].type) {
                    case stndz.trailTypes.opener:
                        extraSymbol = "*";
                        break;
                    case stndz.trailTypes.user:
                        extraSymbol = ">";
                        break;
                    case stndz.trailTypes.client:
                        extraSymbol = "#";
                        break;
                    case stndz.trailTypes.server:
                        extraSymbol = "!";
                        break;
                    case stndz.trailTypes.javascript:
                        extraSymbol = "~";
                        break;
                    case stndz.trailTypes.app:
                        extraSymbol = "<";
                        break;
                    default:
                        extraSymbol = "?";
                        break;
                }
                result += extraSymbol + trail[i].host;
            }
            else {
                result += trail[i].host;
            }
        }
    }
    return result;
}
function getTrailType(transitionType, transitionQualifiers) {
    if (transitionType === "auto_bookmark" || transitionType == "typed")
        return stndz.trailTypes.user;
    const qualifiers = transitionQualifiers.toString();
    if (qualifiers.indexOf('forward_back') > -1 || qualifiers.indexOf('from_address_bar') > -1)
        return stndz.trailTypes.user;
    if (transitionType === "link")
        return qualifiers.indexOf('server_redirect') > -1 ? stndz.trailTypes.javascript : stndz.trailTypes.client;
    if (qualifiers.indexOf('server_redirect') > -1)
        return stndz.trailTypes.server;
    return stndz.trailTypes.client;
}
function setTrailType(tabId, transitionType, transitionQualifiers) {
    const trailType = getTrailType(transitionType, transitionQualifiers);
    const pageData = pagesDataComponent.getData(tabId);
    pageData.trt = transitionType;
    pageData.trq = transitionQualifiers;
    if (pageData.trail && pageData.trail.length > 0) {
        // filling the latest one that is null is done to handle cases where you click a link that takes to a domain
        // that redirects and the onCommited doesn't trigger for them
        for (let i = pageData.trail.length - 1; i >= 0; i--) {
            if (pageData.trail[i].type === null) {
                pageData.trail[i].type = trailType;
                return trailType;
            }
        }
    }
}

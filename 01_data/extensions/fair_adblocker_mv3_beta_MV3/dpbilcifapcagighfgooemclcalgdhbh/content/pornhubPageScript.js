const pornhubPageScript = () => {
    const hiddenCSS = {
        'pornhub.com': [
            '.sponsor-text',
            '#abAlert'
        ],
    };
    const hideElements = (hostname) => {
        if (hostname.substr(hostname.indexOf('.') + 1) !== 'com') {
            hostname = hostname.substr(hostname.indexOf('.') + 1);
        }
        const selectors = hiddenCSS[hostname];
        if (!selectors) {
            return;
        }
        const rule = `${selectors.join(', ')} { display: none!important; }`;
        const style = document.createElement('style');
        style.innerHTML = rule;
        document.head.appendChild(style);
    };
    const hideSidebarAds = () => {
        const sidebar = document.getElementById('vpContentContainer');
        if (sidebar) {
            const sidebarChildren = sidebar.children;
            for (let child of sidebarChildren) {
                if (child.id !== 'hd-leftColVideoPage' && child.id !== 'hd-rightColVideoPage') {
                    const elems = child.children;
                    let flag = false;
                    for (let elem of elems) {
                        const classes = elem.classList;
                        for (let cl of classes) {
                            if (cl === 'clearfix') {
                                const rule = `.${classes[0]} { display: none!important; }`;
                                const style = document.createElement('style');
                                style.innerHTML = rule;
                                document.head.appendChild(style);
                                flag = true;
                                break;
                            }
                        }
                        if (flag) {
                            break;
                        }
                    }
                    break;
                }
            }
        }
        else {
            return;
        }
    };
    const hideUnderVideosAds = () => {
        const empty = document.getElementsByClassName('empty_uBlock');
        if (empty.length > 0) {
            const elem = empty[0].nextElementSibling;
            if (elem.classList[3] === 'clear') {
                const rule = `.${elem.classList[0]} { display: none!important; }`;
                const style = document.createElement('style');
                style.innerHTML = rule;
                document.head.appendChild(style);
            }
        }
        else {
            return;
        }
    };
    const hideMainListAds = () => {
        const alpha = document.querySelectorAll('.display-grid.videos > .alpha');
        if (alpha.length > 0) {
            const elem = alpha[0].firstChild;
            if (elem) {
                // @ts-ignore
                const rule = `.${elem.classList[0]} { display: none!important; }`;
                const style = document.createElement('style');
                style.innerHTML = rule;
                document.head.appendChild(style);
            }
        }
        else {
            return;
        }
    };
    const hideAboveFooterAds = () => {
        const footer = document.getElementsByClassName('footerContentWrapper');
        if (footer.length > 0) {
            const elem = footer[0].previousElementSibling.previousElementSibling.firstChild;
            if (elem) {
                // @ts-ignore
                const rule = `.${elem.classList[0]} { display: none!important; }`;
                const style = document.createElement('style');
                style.innerHTML = rule;
                document.head.appendChild(style);
            }
        }
        else {
            return;
        }
    };
    const observeDomChanges = (callback) => {
        const domMutationObserver = new MutationObserver((mutations) => {
            callback(mutations);
        });
        domMutationObserver.observe(document.documentElement, {
            childList: true,
            subtree: true,
        });
    };
    const autoSkipAds = () => {
        setTimeout(() => {
            const skipBtn = document.querySelector('#pb_close_button');
            if (skipBtn) {
                // @ts-ignore
                skipBtn.click();
            }
        }, 20);
    };
    hideSidebarAds();
    hideUnderVideosAds();
    hideMainListAds();
    hideAboveFooterAds();
    hideElements(window.location.hostname);
    observeDomChanges(() => {
        autoSkipAds();
    });
};
pornhubPageScript();

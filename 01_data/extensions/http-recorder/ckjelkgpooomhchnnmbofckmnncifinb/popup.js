function getActiveExtensions(callback) {
    chrome.management.getAll(function(exts) {
        let activeNames = [];
        for(let i=0; i<exts.length; i++) {
            if (exts[i].enabled) {
                activeNames.push(exts[i].name.replace(/\s/g, '_'));  
            }
        }
        callback(activeNames);
    });
}

function cookiesToCSV(cookies) {
    let csvContent = 'name,value,domain,path,expires,httpOnly,secure,sameSite\n';
    cookies.forEach(cookie => {
        csvContent += `${cookie.name},${cookie.value},${cookie.domain},${cookie.path},${cookie.expirationDate ? new Date(cookie.expirationDate * 1000).toISOString() : 'N/A'},${cookie.httpOnly},${cookie.secure},${cookie.sameSite}\n`;
    });
    return csvContent;
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('exportButton').addEventListener('click', function() {
        chrome.runtime.sendMessage({cmd: "getLastVisitedPage"}, function(response) {
            var url = new URL(response);
            var hostname = url.hostname;
            var date = new Date();
            date.setUTCHours(date.getUTCHours() + 1);  // CEST offset
            var datetime = `${date.getUTCFullYear()}-${("0" + (date.getUTCMonth() + 1)).slice(-2)}-${("0" + date.getUTCDate()).slice(-2)}_${("0" + date.getUTCHours()).slice(-2)}-${("0" + date.getUTCMinutes()).slice(-2)}-${("0" + date.getUTCSeconds()).slice(-2)}`;
            
            chrome.cookies.getAll({}, function(cookies) {
                var csv = cookiesToCSV(cookies);
                var downloadLink = document.createElement('a');
                var blob = new Blob(["\ufeff", csv]);
                var url = URL.createObjectURL(blob);

                getActiveExtensions(function(activeExtensions) {  // Fetch active extensions
                    var filename = [hostname, datetime].concat(activeExtensions).join('-') + `-cookies.csv`;  // Create filename
                    downloadLink.href = url;
                    downloadLink.download = filename;
                    document.body.appendChild(downloadLink);

                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                });
            });

            getActiveExtensions(function(activeExtensions) {
                chrome.runtime.sendMessage({cmd: "getData"}, function(httpData) {
                    var csv = $.csv.fromObjects(httpData);
                    var downloadLink = document.createElement('a');
                    var blob = new Blob(["\ufeff", csv]);
                    var url = URL.createObjectURL(blob);

                    var filename = [hostname, datetime].concat(activeExtensions).join('-') + `-trackers.csv`;  // Create filename 

                    downloadLink.href = url;
                    downloadLink.download = filename;
                    document.body.appendChild(downloadLink);

                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                });
            });

        });
    });
});

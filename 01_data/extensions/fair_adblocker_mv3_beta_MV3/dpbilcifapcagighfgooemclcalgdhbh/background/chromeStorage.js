// this object is to handle with chrome.storage via promises
const chromeStorageService = {
    check: async () => {
        chrome.storage.local.get()
            .then(items => console.log('chromeStorageService check:', items))
            .catch(error => console.error('Error in chromeStorageService check', error));
    },
    set: async (key, value) => {
        const data = {};
        data[key] = value;
        chrome.storage.local.set(data)
            .catch(error => console.error('Error in chromeStorageService set', error));
    },
    get: async (keys) => {
        return await chrome.storage.local.get(keys);
    },
    remove: async (keys) => {
        chrome.storage.local.remove(keys)
            .catch(error => console.error('Error in chromeStorageService remove', error));
    },
    clear: async () => {
        chrome.storage.local.clear()
            .catch(error => console.error('Error in chromeStorageService clear', error));
    }
};

// Ponte de segurança para usar o chrome.storage.local mantendo a mesma facilidade
const db = {
    getItem: async function(key) {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get([key], function(result) {
                    resolve(result[key] ? JSON.parse(result[key]) : null);
                });
            } else {
                let val = localStorage.getItem(key);
                resolve(val ? JSON.parse(val) : null);
            }
        });
    },
    setItem: async function(key, value) {
        return new Promise((resolve) => {
            let stringData = JSON.stringify(value);
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ [key]: stringData }, function() {
                    resolve();
                });
            } else {
                localStorage.setItem(key, stringData);
                resolve();
            }
        });
    }
};
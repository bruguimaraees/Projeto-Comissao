// Ponte de sincronização inteligente para o chrome.storage.local
const db = {
    // Carrega instantaneamente da memória local da extensão
    getItem: function(key) {
        let val = localStorage.getItem(key);
        return val ? JSON.parse(val) : null;
    },

    // Salva instantaneamente na tela e sincroniza com o storage seguro do Chrome
    setItem: function(key, value) {
        let stringData = JSON.stringify(value);
        localStorage.setItem(key, stringData); // Mantém compatibilidade síncrona imediata
        
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ [key]: stringData }); // Salva de forma permanente no Chrome
        }
    },

    // Função de inicialização para resgatar os dados do Chrome ao abrir a extensão pela primeira vez
    inicializar: async function(callback) {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(null, function(items) {
                for (let key in items) {
                    if (items.hasOwnProperty(key)) {
                        localStorage.setItem(key, items[key]);
                    }
                }
                if (callback) callback();
            });
        } else {
            if (callback) callback();
        }
    }
};
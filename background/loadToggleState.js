function loadToggleState(id) {
    return new Promise((resolve, reject) => {
        openDatabase().then((db) => {
            const transaction = db.transaction(["toggleStore"], "readonly");
            const store = transaction.objectStore("toggleStore");
            const request = store.get(id);

            request.onsuccess = () => {
                const status = request.result ? request.result.status : 'Off';
                resolve(status);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    });
}

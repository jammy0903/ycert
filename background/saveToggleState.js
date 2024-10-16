function saveToggleState(id, status) {
    openDatabase().then((db) => {
        const transaction = db.transaction(["toggleStore"], "readwrite");
        const store = transaction.objectStore("toggleStore");

        store.put({ id: id, status: status });

        transaction.oncomplete = () => {
            console.log(`Toggle state for ${id} saved:`, status);
        };

        transaction.onerror = (event) => {
            console.error(`Error saving toggle state for ${id}:`, event.target.error);
        };
    });
}

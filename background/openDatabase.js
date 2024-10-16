// 데이터 베이스 열기
function openDatabase() {
    return new Promise((resolve, reject) => {
        // "ToggleDatabase"라는 이름으로 데이터베이스를 열거나 생성
        const request = indexedDB.open("ToggleDatabase", 1);

        // 데이터베이스가 처음 생성되거나 버전이 변경될 때 실행
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // "toggleStore"라는 이름의 오브젝트 스토어가 없으면 생성
            if (!db.objectStoreNames.contains("toggleStore")) {
                db.createObjectStore("toggleStore", { keyPath: "id" });
            }
        };
        request.onsuccess = (event) => {
            resolve(event.target.result); 
        };

        // 실패 힝잉잉
        request.onerror = (event) => {
            reject(event.target.error); 
        };
    });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded event fired");

    const checkboxes = document.querySelectorAll('.nameCheckbox');

    // 라벨 초기화 함수 호출
    initializeLabels();

    checkboxes.forEach(checkbox => {
        const id = checkbox.id;
        loadToggleState(id).then((data) => {
            if (data) {
                console.log(`Loaded data for ${id} from DB:`, data);
                checkbox.checked = (data.status === 'On');
                // 필요 시 추가 데이터를 사용하여 UI 업데이트 가능
            } else {
                checkbox.checked = false;
            }
        }).catch((error) => {
            console.error(`Error loading toggle state for ${id}:`, error);
        });

        checkbox.addEventListener('change', function() {
            const status = checkbox.checked ? 'On' : 'Off';
            console.log(`Toggle for ${id} changed to:`, status);
            saveToggleState(id, status);
        });
    });

    document.getElementById('saveButton').addEventListener('click', function() {
        chrome.windows.getCurrent(function(window) {
            chrome.runtime.sendMessage({ action: "closePopup", windowId: window.id });
        });
    });
});

// 라벨 초기화 함수
function initializeLabels() {
    const labelData = {
        marketingCheckbox: ["마케팅", "동의", "문자"],
        serviceCheckbox: ["서비스", "동의", "맞춤형"],
        othersCheckbox: ["정보 공유", "동의", "파트너사"],
        locationCheckbox: ["위치 정보", "동의", "GPS"],
        mediaCheckbox: ["사진", "동영상", "동의", "사진"],
        purchaseCheckbox: ["구매내역", "동의", "분석"],
        analysisCheckbox: ["서비스개발", "동의", "분석"],
        keepingCheckbox: ["정보", "보관", "동의", "1년", "2년", "3년", "4년", "5년"],
        abroadCheckbox: ["해외", "전송", "동의", "정보"]
    };

    openDatabase().then((db) => {
        const transaction = db.transaction(["toggleStore"], "readwrite");
        const store = transaction.objectStore("toggleStore");

        for (const [id, texts] of Object.entries(labelData)) {
            const request = store.get(id);

            request.onsuccess = (event) => {
                if (!event.target.result) {
                    // 데이터가 없을 때만 저장
                    store.put({ id: id, status: 'Off', texts: texts });
                    console.log(`Initialized label for ${id} with texts:`, texts);
                }
            };

            request.onerror = (event) => {
                console.error(`Error initializing label for ${id}:`, event.target.error);
            };
        }
    });
}

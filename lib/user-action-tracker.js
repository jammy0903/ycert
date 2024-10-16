class UserActionTracker {
    constructor() {
        this.userActions = [];
        this.initialText = "";
        this.initialSettings = {};
        this.db = null;
    }

    async initialize() {
        this.db = await this.openDatabase();
        await this.loadInitialText();
        this.initialSettings = await this.getUserSettings();
        if (!this.initialSettings) {
            this.initialSettings = this.getCurrentSettings();
            await this.updateUserSettings(this.initialSettings);
        }
    }

    async loadInitialText() {
        try {
            const onLabels = await this.getOnLabels();
            this.initialText = onLabels.join(" ");
            console.log(`Initial text loaded: ${this.initialText}`);
        } catch (error) {
            console.error("Error loading initial text:", error);
        }
    }

    addUserAction(action) {
        this.userActions.push(action);
        Utils.debugLog('User action added:', action);
    }

    getUserActions() {
        return this.userActions;
    }

    calculateMaxSimilarity(baseText, texts) {
        const cleanText = (text) => text.toLowerCase().replace(/[:\s]+/g, ' ').trim();
        const tokenize = (text) => cleanText(text).split(/\s+/);

        const baseTokens = new Set(tokenize(baseText));

        let maxSimilarity = 0;

        texts.forEach(text => {
            const tokens = new Set(tokenize(text));

            const intersection = new Set([...baseTokens].filter(token => tokens.has(token)));
            const union = new Set([...baseTokens, ...tokens]);

            let partialMatches = 0;
            baseTokens.forEach(baseToken => {
                tokens.forEach(token => {
                    if (baseToken.includes(token) || token.includes(baseToken)) {
                        partialMatches++;
                    }
                });
            });

            const overlapSimilarity = intersection.size / union.size;
            const partialMatchBonus = partialMatches / (baseTokens.size + tokens.size);

            const similarity = overlapSimilarity + partialMatchBonus * 0.5;

            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
            }
        });
        return maxSimilarity;
    }

    compareCheckboxWithInitialText() {
        const checkedActions = this.userActions.filter(action => action.type === 'checkbox' && action.checked);

        const checkedLabels = checkedActions.map(action => {
            const labelElement = document.querySelector(`label[for='${action.checkboxId}']`);
            return labelElement ? labelElement.textContent.trim() : "";
        });

        console.log(`사용자가 체크한 체크박스의 레이블 텍스트들: ${checkedLabels.join(", ")}`);

        const maxSimilarity = this.calculateMaxSimilarity(this.initialText, checkedLabels);
        console.log(`최대 유사도: ${maxSimilarity}`);

        return maxSimilarity > 0.5;  // 임계값 0.5
    }

    getCurrentSettings() {
        const settings = {};
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            settings[this.getCheckboxId(checkbox)] = checkbox.checked;
        });
        return settings;
    }

    compareWithInitialSettings() {
        const currentSettings = this.getCurrentSettings();
        const differences = [];

        for (const [id, checked] of Object.entries(currentSettings)) {
            if (this.initialSettings[id] !== checked) {
                differences.push({
                    id,
                    label: this.getCheckboxLabelText(document.getElementById(id)),
                    initialValue: this.initialSettings[id],
                    currentValue: checked
                });
            }
        }

        return differences;
    }

    getCheckboxId(checkbox) {
        return checkbox.id || checkbox.name || checkbox.value || 'unknown';
    }

    getCheckboxLabelText(checkbox) {
        const label = document.querySelector(`label[for="${checkbox.id}"]`);
        if (label) return label.textContent.trim();
        
        const parentLabel = checkbox.closest('label');
        if (parentLabel) return parentLabel.textContent.trim();
        
        return 'Unknown Label';
    }

    // IndexedDB 관련 메서드
    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("ToggleDatabase", 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains("toggleStore")) {
                    db.createObjectStore("toggleStore", { keyPath: "id" });
                }
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    async getUserSettings() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(["toggleStore"], "readonly");
            const objectStore = transaction.objectStore("toggleStore");
            const request = objectStore.get("userSettings");

            request.onerror = (event) => {
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                resolve(event.target.result ? event.target.result.settings : null);
            };
        });
    }

    async updateUserSettings(settings) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(["toggleStore"], "readwrite");
            const objectStore = transaction.objectStore("toggleStore");
            const request = objectStore.put({ id: "userSettings", settings: settings });

            request.onerror = (event) => {
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                resolve();
            };
        });
    }

    async getOnLabels() {
        // 이 메서드는 데이터베이스에서 'on' 상태의 레이블을 가져오는 로직을 구현해야 합니다.
        // 예시 구현:
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(["toggleStore"], "readonly");
            const objectStore = transaction.objectStore("toggleStore");
            const request = objectStore.get("onLabels");

            request.onerror = (event) => {
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                resolve(event.target.result ? event.target.result.labels : []);
            };
        });
    }
}

function detectUserAction() {
    const tracker = new UserActionTracker();
    tracker.initialize().then(() => {
        const checkboxes = document.querySelectorAll("input[type='checkbox']");
        const nextButton = document.getElementById('nextButton');

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                const action = {
                    type: 'checkbox',
                    checkboxId: checkbox.id,
                    checked: checkbox.checked
                };
                tracker.addUserAction(action);
            });
        });

        nextButton.addEventListener('click', () => {
            const similarityWithCheckbox = tracker.compareCheckboxWithInitialText();
            const differences = tracker.compareWithInitialSettings();

            if (similarityWithCheckbox || differences.length > 0) {
                document.getElementById('warningMessage').textContent = "안돼!";
                document.getElementById('warningMessage').style.color = "red";
            } else {
                document.getElementById('warningMessage').textContent = "그래!";
                document.getElementById('warningMessage').style.color = "green";
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', detectUserAction);
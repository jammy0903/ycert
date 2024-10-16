// 유틸리티 함수
const Utils = {
    debugLog: (...args) => console.log('[Signup Detector]', ...args),
    debounce: (func, wait) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },
    tokenize: (() => {
        const cache = new Map();
        return (text) => {
            if (cache.has(text)) return cache.get(text);
            const tokens = text.toLowerCase().replace(/[\n\r]+/g, ' ').split(/\s+/);
            cache.set(text, tokens);
            return tokens;
        };
    })(),
    computeTF: (tokens) => {
        const tf = new Map();
        const totalTokens = tokens.length;
        tokens.forEach(token => tf.set(token, (tf.get(token) || 0) + 1 / totalTokens));
        return tf;
    },
    getInputId: (input) => {
        return input.id || input.name || input.value || 'unknown';
    },
    getInputLabelText: (input) => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) return label.textContent.trim();
        
        const parentLabel = input.closest('label');
        if (parentLabel) return parentLabel.textContent.trim();
        
        const closestLabel = input.closest('.el-radio, .el-checkbox')?.querySelector('.el-radio__label, .el-checkbox__label');
        if (closestLabel) return closestLabel.textContent.trim();

        return 'Unknown Label';
    }
};

// 회원가입 감지 모듈
const SignupDetector = {
    keywords: new Set(['마케팅', '이용약관', '동의', '모두', '회원가입', '필수', '선택', '혜택', '개인정보', '탈퇴', '인증']),
    analyze: (text) => {
        const tokens = Utils.tokenize(text);
        const tf = Utils.computeTF(tokens);
        
        let keywordCount = 0;
        for (const [token, frequency] of tf) {
            if (SignupDetector.keywords.has(token)) {
                keywordCount += frequency * 5;
            }
        }

        return {
            isSignup: keywordCount > 0.01,
            keywordFrequency: keywordCount,
            tf: Object.fromEntries(tf)
        };
    },
    extractRelevantText: () => {
        const relevantElements = document.querySelectorAll('form, label, button');
        return Array.from(relevantElements).map(el => el.textContent).join(' ').trim();
    },
    detect: Utils.debounce(() => {
        const text = SignupDetector.extractRelevantText();
        const result = SignupDetector.analyze(text);
        isSignupPage = result.isSignup;
        Utils.debugLog(isSignupPage ? "회원가입 페이지입니다!" : "회원가입 페이지가 아닙니다.");
    }, 300)
};

// UserActionTracker 클래스 수정
class UserActionTracker {
    constructor(initialSettings) {
        this.userActions = [];
        this.initialSettings = initialSettings;
    }

    addUserAction(action) {
        this.userActions.push(action);
        Utils.debugLog('User action added:', action);
    }

    compareWithInitialSettings() {
        const currentSettings = this.getCurrentSettings();
        const differences = [];

        for (const [id, value] of Object.entries(currentSettings)) {
            if (this.initialSettings[id] !== value) {
                const input = document.getElementById(id);
                differences.push({
                    id,
                    label: Utils.getInputLabelText(input),
                    initialValue: this.initialSettings[id],
                    currentValue: value,
                    type: input.type
                });
            }
        }

        return differences;
    }

    getCurrentSettings() {
        const settings = {};
        document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
            const id = Utils.getInputId(input);
            if (input.type === 'radio') {
                if (input.checked) {
                    settings[input.name] = id;
                }
            } else {
                settings[id] = input.checked;
            }
        });
        return settings;
    }
}

// 전역 변수 및 인스턴스
let isSignupPage = false;
let tracker;

// DOM 변화 감지
const observer = new MutationObserver(SignupDetector.detect);
observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['checked']
});

// 이벤트 리스너
document.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox' || e.target.type === 'radio') {
        const inputId = Utils.getInputId(e.target);
        const labelText = Utils.getInputLabelText(e.target);
        tracker.addUserAction({
            type: e.target.type,
            inputId: inputId,
            label: labelText,
            value: e.target.type === 'checkbox' ? e.target.checked : e.target.value
        });

        const differences = tracker.compareWithInitialSettings();
        if (differences.length > 0) {
            differences.forEach(diff => {
                let message = `주의: "${diff.label}" 설정이 변경되었습니다.`;
                if (diff.label.includes('마케팅') || diff.label.includes('선택')) {
                    message += ' 개인정보 활용에 주의하세요.';
                }
                Utils.debugLog(message);
                // 여기에 실제 알림 로직 추가 (예: 크롬 알림 API 사용)
            });
        }
    }
});

document.addEventListener('submit', (e) => {
    if (isSignupPage) {
        e.preventDefault();
        updateWarningMessage(tracker.compareWithInitialSettings());
    }
});

// 경고 메시지 업데이트 함수
function updateWarningMessage(differences) {
    const warningElement = document.getElementById('warningMessage');
    if (warningElement) {
        if (differences.length > 0) {
            warningElement.textContent = "주의: 설정이 변경되었습니다!";
            warningElement.style.color = "red";
        } else {
            warningElement.textContent = "설정이 초기 상태와 일치합니다.";
            warningElement.style.color = "green";
        }
        Utils.debugLog(`Warning message updated: ${warningElement.textContent}`);
    }
}

// 초기화
window.addEventListener('load', () => {
    Utils.debugLog('페이지 로드됨. 회원가입 감지 및 초기 설정 저장 시작...');
    SignupDetector.detect();

    const initialSettings = {};
    document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
        const id = Utils.getInputId(input);
        if (input.type === 'radio') {
            if (input.checked) {
                initialSettings[input.name] = id;
            }
        } else {
            initialSettings[id] = input.checked;
        }
    });
    tracker = new UserActionTracker(initialSettings);
});
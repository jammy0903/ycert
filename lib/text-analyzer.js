// class TextAnalyzer {
//     tokenize(text) { /* ... */ }
//     computeTFIDF(tokens) { /* ... */ }
//     vectorize(tfidf) { /* ... */ }
//     cluster(vector) { /* ... */ }
//     analyzeText(text) { /* ... */ }
//   }

// Helper function to tokenize the text
function tokenize(text) {
  // 텍스트를 소문자로 변환하고, 줄바꿈을 공백으로 변환한 후 공백을 기준으로 나누기
  return text.toLowerCase()
             .replace(/[\n\r]+/g, ' ') // 줄바꿈을 공백으로 변환
             .split(/\s+/);            // 공백 기준으로 분리
}



// Helper function to compute Term Frequency (TF)
function computeTF(tokens) {
  let tf = new Map();
  tokens.forEach(token => {
      if (!tf.has(token)) {
          tf.set(token, 0);
      }
      tf.set(token, tf.get(token) + 1);
  });

  const totalTokens = tokens.length;
  tf.forEach((value, key) => {
      tf.set(key, value / totalTokens);
  });

  console.log("Token Frequency Map:", tf);  // TF 맵 출력
  return tf;
}

// Keywords to detect signup forms
const signupKeywords = ['마케팅', '이용약관', '동의', '모두', '회원가입', '필수', '선택', '혜택', '개인정보', '탈퇴', '인증'];

// Function to detect signup based on keyword frequency
function analyzeForSignup(text) {
  const tokens = tokenize(text);
  console.log("Tokens:", tokens);  // 토큰 출력

  const tf = computeTF(tokens);

  // Count occurrences of signup-related keywords
  let keywordCount = 0;
  signupKeywords.forEach(keyword => {
      if (tf.has(keyword)) {
          console.log(`Keyword "${keyword}" found with frequency:`, tf.get(keyword));  // 키워드와 빈도 출력
          keywordCount += tf.get(keyword) * 5; // 가중치를 크게 설정
      } else {
          console.log(`Keyword "${keyword}" not found in text.`);
      }
  });

  console.log("Total keyword frequency score:", keywordCount);  // 최종 키워드 점수 출력

  // Further lower the threshold to ensure detection
  const isSignup = keywordCount > 0.01; // 아주 낮은 임계값 설정

  return {
      isSignup: isSignup,
      keywordFrequency: keywordCount,
      tf: Object.fromEntries(tf)
  };
}

// Function to get text from the textarea and analyze it
function detectSignup() {
  const text = document.getElementById("inputText").value;
  const result = analyzeForSignup(text);

  const resultMessage = document.getElementById("resultMessage");
  if (result.isSignup) {
      resultMessage.textContent = "회원가입 페이지입니다!";
      resultMessage.style.color = "green";
  } else {
      resultMessage.textContent = "회원가입 페이지가 아닙니다.";
      resultMessage.style.color = "red";
  }

  document.getElementById("result").textContent = JSON.stringify(result, null, 2);
}

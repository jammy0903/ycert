  //WebsiteAnalysisResult 인터페이스 정의
  //웹사이트 분석 결과를 나타내는 데이터 구조
  class WebsiteAnalysisResult {
      constructor(privacyScore, safetyFeatures, textAnalysisResult) {
        this._privacyScore = privacyScore;
        this._safetyFeatures = Object.freeze({ ...safetyFeatures });
        this._textAnalysisResult = textAnalysisResult;
        Object.freeze(this);
      }
    
      get privacyScore() {
        return this._privacyScore;
      } // 개인정보 보호 점수
    
      get safetyFeatures() { 
        return this._safetyFeatures;
      } //사이트 안전성 점수
    
      get textAnalysisResult() {
        return this._textAnalysisResult;
      }//개인정보 수집 지침 - 텍스트 분석 결과
    
      toString() {
        return JSON.stringify({
          privacyScore: this._privacyScore,
          safetyFeatures: this._safetyFeatures,
          textAnalysisResult: this._textAnalysisResult.toString(),
        }, null, 2);
      }
    }
    
    class SafetyFeatures {
      constructor(https, privacyPolicy, twoFactorAuth, cookieConsent, critCheck) {
        this.https = https;
        this.privacyPolicy = privacyPolicy; //  개인정보 보호 정책 위법 유무
        this.twoFactorAuth = twoFactorAuth;// 2단계 인증 사용 여부
        this.cookieConsent = cookieConsent;// 쿠키 동의 여부
        this.critCheck = critCheck;// crt인증회사?
        this.isms = isms; //isms 인증 여부
        Object.freeze(this);
      }
    }
    
    class TextAnalysisResult {
      constructor(keyTerms, sentimentScore, privacyRelatedPhrases) {
        this._keyTerms = Object.freeze([...keyTerms]);
        this._sentimentScore = sentimentScore;
        this._privacyRelatedPhrases = Object.freeze([...privacyRelatedPhrases]);
        Object.freeze(this);
      }
    
      get keyTerms() {
        return this._keyTerms;
      }
    
      get sentimentScore() {
        return this._sentimentScore;
      }
    
      get privacyRelatedPhrases() {
        return this._privacyRelatedPhrases;
      }
    
      toString() {
        return JSON.stringify({
          keyTerms: this._keyTerms,
          sentimentScore: this._sentimentScore,
          privacyRelatedPhrases: this._privacyRelatedPhrases,
        }, null, 2);
      }
    }
    
    // 사용 예시
    function analyzeWebsite(url) {
      // 실제 분석 로직은 여기에 구현
      const privacyScore = 85;
      const safetyFeatures = new SafetyFeatures(
        true,  // https
        true,  // privacyPolicy
        false, // twoFactorAuth
        true,  // cookieConsent
        true   // dataEncryption
      );
      const textAnalysisResult = new TextAnalysisResult(
        ["privacy", "security", "data protection"],
        0.75,
        ["We respect your privacy", "Your data is encrypted"]
      );
    
      return new WebsiteAnalysisResult(privacyScore, safetyFeatures, textAnalysisResult);
    }
    
    // 사용 예
    const result = analyzeWebsite("https://example.com");
    console.log(result.toString());
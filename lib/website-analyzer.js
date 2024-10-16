class WebsiteAnalyzer {
  constructor() {
    this.cache = new Map(); // URL별 분석 결과 캐싱
  }

  async analyzeWebsite(url) {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    } // 캐시에 결과가 있으면 캐시에서 반환

    const result = {
      https: await this.checkHttps(url),
      privacyPolicy: await this.checkPrivacyPolicy(url),
      twoFactorAuth: await this.check2FA(url),
      cookieConsent: await this.checkCookieConsent(url),
      crt_cert: await this.crtCheck(url),
      isms_cert: await this.ismsCheck(url),
    };

    this.showResultsAsNotifications(result); // 결과를 알림으로 표시
    this.cache.set(url, result); // 결과를 캐시에 저장
    return analysisResult;
  }

  async checkHttps(url) {
    try {
      const response = await fetch(url);
      return response.url.startsWith('https://');
    } catch (error) {
      console.error('Error checking HTTPS:', error);
      return false;
    }
  }

  async checkPrivacyPolicy(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      return html.toLowerCase().includes('privacy policy') || html.toLowerCase().includes('개인정보처리방침');
    } catch (error) {
      console.error('Error checking privacy policy:', error);
      return false;
    }
  }

  async check2FA(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      return html.toLowerCase().includes('two-factor authentication') || html.toLowerCase().includes('2fa');
    } catch (error) {
      console.error('Error checking 2FA:', error);
      return false;
    }
  }

  async checkCookieConsent(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      return html.toLowerCase().includes('cookie consent') || html.toLowerCase().includes('쿠키 동의');
    } catch (error) {
      console.error('Error checking cookie consent:', error);
      return false;
    }
  }

  async crtCheck(url) {
    const domain = new URL(url).hostname; // URL에서 도메인만 추출
    const crtShUrl = `https://crt.sh/?q=${domain}`;

    try {
      const response = await fetch(crtShUrl);
      const html = await response.text();

      if (html.includes("No certificates found")) {
        return false; // SSL 인증서가 존재하지 않음
      }

      const isExpired = html.includes("Expired");
      if (isExpired) {
        return false; // SSL 인증서가 만료됨
      }

      return true; // SSL 인증서가 유효함
    } catch (error) {
      console.error('Error checking SSL certificate:', error);
      return false; // SSL 인증서 확인 불가 (기본적으로 유효하지 않음으로 처리)
    }
  }


  async ismsCheck(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      return html.toLowerCase().includes('isms') || html.toLowerCase().includes('정보보호');
    } catch (error) {
      console.error('Error checking ISMS:', error);
      return false;
    }
  }

  
  showResultsAsNotifications(result) {
    const notificationManager = new NotificationManager();
    
    if (result.https) {
      notificationManager.showNotification("HTTPS 사용: 이 사이트는 HTTPS를 사용하고 있습니다.");
    } else {
      notificationManager.showNotification("주의: 이 사이트는 HTTPS를 사용하지 않습니다.");
    }

    if (result.privacyPolicy) {
      notificationManager.showNotification("개인정보 처리 방침: 이 사이트는 개인정보 처리 방침을 명시하고 있습니다.");
    } else {
      notificationManager.showNotification("경고: 이 사이트는 개인정보 처리 방침이 없습니다.");
    }

    if (result.twoFactorAuth) {
      notificationManager.showNotification("2단계 인증: 이 사이트는 2단계 인증을 지원합니다.");
    } else {
      notificationManager.showNotification("주의: 이 사이트는 2단계 인증을 지원하지 않습니다.");
    }

    if (result.cookieConsent) {
      notificationManager.showNotification("쿠키 동의: 이 사이트는 쿠키 동의 절차를 따릅니다.");
    } else {
      notificationManager.showNotification("주의: 이 사이트는 쿠키 동의 절차가 없습니다.");
    }

    if (result.crtCheck) {
      notificationManager.showNotification("SSL 인증: 이 사이트의 SSL 인증서가 유효합니다.");
    } else {
      notificationManager.showNotification("경고: 이 사이트의 SSL 인증서가 유효하지 않거나 존재하지 않습니다.");
    }
      notificationManager.showNotification(result.crtCheck); // SSL 인증서 상태
    if (result.isms_cert) {
      notificationManager.showNotification("ISMS 인증: 이 사이트는 ISMS 인증을 보유하고 있습니다.");
    } else {
      notificationManager.showNotification("주의: 이 사이트는 ISMS 인증이 없습니다.");
    }
  }
}
class NotificationManager {
  showNotification(message) {
    console.log(message); // 여기를 실제 알림 시스템으로 변경 가능
  }
}


// 사용 예:
const analyzer = new WebsiteAnalyzer();
analyzer.analyzeWebsite('https://example.com')
  .then(result => console.log(result))
  .catch(error => console.error('Analysis failed:', error));
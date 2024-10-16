// 확장 프로그램이 설치될 때 options.html을 엽니다.
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
      chrome.windows.create({
          url: '../html/init_option.html',
          type: 'normal',  // 완전히 새로운 브라우저 창을 엽니다.
          width: 800,
          height: 600,
          left: 100,       // 창의 위치 설정 (화면 왼쪽으로부터)
          top: 100,        // 창의 위치 설정 (화면 위쪽으로부터)
          focused: true    // 새 창이 열리면서 자동으로 포커스가 가도록 설정
      });
  }
});

// 팝업 창을 닫기 위한 메시지 리스너
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "closePopup") {
      // 요청된 창 ID를 사용하여 해당 창만 닫기
      chrome.windows.remove(request.windowId, () => {
          if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError.message);
          } else {
              console.log('Window closed successfully.');
          }
      });
  }
});

// 팝업 창 크기 계산
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
      // 화면 크기를 기반으로 창 크기 계산
      const screenWidth = screen.availWidth;
      const screenHeight = screen.availHeight;

      const width = Math.round(screenWidth / 3);  // 가로 1/3 크기
      const height = Math.round(screenHeight * 0.8);  // 세로 80% 크기

      // 새 창으로 options.html을 엶
      chrome.windows.create({
          url: 'options.html',
          type: 'popup',
          width: width,
          height: height
      });
  }
});
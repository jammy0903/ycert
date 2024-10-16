class NotificationManager {
  showNotification(message) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: '개인정보 보호 알림',
      message: message
    });
  }
}
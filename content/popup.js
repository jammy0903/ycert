document.getElementById('viewDataBtn').addEventListener('click', function() {
  // viewData.html의 내용을 로드하여 팝업의 내용으로 삽입
  fetch('viewData.html')
      .then(response => response.text())
      .then(html => {
          document.getElementById('content').innerHTML = html;
      });
});
window.onload = function() {
  window.resizeTo(800, 600); // 팝업 창을 가로 400px, 세로 600px로 설정
};

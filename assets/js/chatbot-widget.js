function initChatbotWidget() {
    const $widget = $("#chatbotWidget");
    const $openBtn = $("#openChatbotBtn");
    const $closeBtn = $("#closeChatbotBtn");
    const $form = $("#chatbotForm");
    const $input = $("#chatbotInput");
    const $body = $("#chatbotBody");
  
    $widget.hide();
  
    $openBtn.on("click", function () {
      $widget.fadeIn(160);
      $openBtn.hide();
    });
  
    $closeBtn.on("click", function () {
      $widget.fadeOut(160);
      $openBtn.show();
    });
  
    $form.on("submit", function (event) {
      event.preventDefault();
  
      const message = $input.val().trim();
  
      if (!message) {
        return;
      }
  
      appendMessage("user", message);
      $input.val("");
  
      /**
       * TODO: RAG 챗봇 API 연동 예정
       * POST /api/chat
       * request: {
       *   message: string,
       *   sessionId: string
       * }
       * response: {
       *   answer: string,
       *   recommendedProducts: Product[]
       * }
       */
  
      setTimeout(function () {
        const answer = getMockChatbotAnswer(message);
        appendMessage("bot", answer);
      }, 500);
    });
  
    function appendMessage(role, text) {
      const messageHtml = `
        <div class="chat-message ${role}">
          ${text}
        </div>
      `;
  
      $body.append(messageHtml);
      $body.scrollTop($body[0].scrollHeight);
    }
  
    function getMockChatbotAnswer(message) {
      if (message.includes("제습기")) {
        return "현재 상품 중 '1인 가구 미니 제습기'가 적합합니다. 소비전력 180W라 전기세 부담이 낮고, 10평 이하 공간에 적합합니다.";
      }
  
      if (message.includes("수박") || message.includes("과일")) {
        return "여름 시즌 상품으로는 '고당도 수박 6kg'과 '프리미엄 복숭아 2kg'을 추천합니다.";
      }
  
      if (message.includes("공기청정기")) {
        return "'저소음 공기청정기'를 추천합니다. 원룸과 침실에 적합하고 미세먼지 시즌 대응 상품입니다.";
      }
  
      return "현재 등록된 상품 기준으로 조건을 분석했습니다. 가격, 사용 공간, 계절성 기준을 함께 알려주시면 더 정확히 추천할 수 있습니다.";
    }
  }
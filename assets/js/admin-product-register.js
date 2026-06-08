$(document).ready(function () {
    let uploadedImageUrl = null;
    let generatedProduct = null;
  
    bindImagePreview();
    bindAgentForm();
    bindPublishButton();
  
    function bindImagePreview() {
      $("#productImageInput").on("change", function (event) {
        const file = event.target.files[0];
  
        if (!file) {
          return;
        }
  
        uploadedImageUrl = URL.createObjectURL(file);
  
        $("#imagePreviewBox")
          .addClass("has-image")
          .css("background-image", `url(${uploadedImageUrl})`);
  
        $("#finalPreviewImage")
          .css({
            "background-image": `url(${uploadedImageUrl})`,
            "background-size": "cover",
            "background-position": "center"
          })
          .text("");
      });
    }
  
    function bindAgentForm() {
      $("#productRegisterForm").on("submit", function (event) {
        event.preventDefault();
  
        const category = $("#categoryInput").val();
        const supplyPrice = Number($("#supplyPriceInput").val());
        const mdMemo = $("#mdMemoInput").val().trim();
  
        if (!category || !supplyPrice || !mdMemo) {
          alert("카테고리, 공급가, MD 메모를 모두 입력해주세요.");
          return;
        }
  
        resetAgentSteps();
  
        runMockAgents({
          category,
          supplyPrice,
          mdMemo
        });
      });
    }
  
    function resetAgentSteps() {
      $(".agent-step")
        .removeClass("is-running is-done")
        .find(".agent-status")
        .text("대기");
  
      $("#marketResult").text("시장·경쟁 상품 분석 결과가 표시됩니다.");
      $("#pricingResult").text("공급가와 목표 마진 기반 판매가가 표시됩니다.");
      $("#copyResult").text("상품명과 판매 카피가 표시됩니다.");
      $("#seoResult").text("검색 키워드와 태그가 표시됩니다.");
      $("#qaResult").text("오탈자, 과장 표현, 등록 가능 여부 검수 결과가 표시됩니다.");
  
      $("#publishProductBtn").prop("disabled", true);
    }
  
    function runMockAgents(input) {
      const context = createMockProductContext(input);
  
      runAgentStep("market", 500, function () {
        $("#marketResult").text(context.marketAnalysis);
      });
  
      runAgentStep("pricing", 1100, function () {
        $("#pricingResult").text(context.pricingAnalysis);
      });
  
      runAgentStep("copy", 1700, function () {
        $("#copyResult").text(context.copywriting);
      });
  
      runAgentStep("seo", 2300, function () {
        $("#seoResult").text(context.seoTags.join(", "));
      });
  
      runAgentStep("qa", 2900, function () {
        $("#qaResult").text("상품명, 가격, 태그, 카피 검수 완료. 과장 표현 없이 등록 가능한 상태입니다.");
  
        generatedProduct = context;
  
        renderFinalPreview(context);
        $("#publishProductBtn").prop("disabled", false);
      });
    }
  
    function runAgentStep(agentName, delay, callback) {
      setTimeout(function () {
        const $step = $(`.agent-step[data-agent="${agentName}"]`);
  
        $step.addClass("is-running");
        $step.find(".agent-status").text("실행중");
  
        setTimeout(function () {
          callback();
  
          $step.removeClass("is-running").addClass("is-done");
          $step.find(".agent-status").text("완료");
        }, 450);
      }, delay);
    }
  
    function createMockProductContext(input) {
      const categoryName = input.category === "small_appliance"
        ? "소형가전"
        : "신선식품";
  
      const marginRate = input.category === "small_appliance" ? 1.55 : 1.45;
      const recommendedPrice = roundToPrice(input.supplyPrice * marginRate);
      const productName = extractProductName(
        input.mdMemo,
        input.category === "small_appliance"
          ? "AI 추천 실속형 소형가전"
          : "AI 추천 산지직송 신선식품"
      );
  
      if (input.category === "small_appliance") {
        return {
          category: input.category,
          categoryName,
          productName,
          supplyPrice: input.supplyPrice,
          recommendedPrice,
          marketAnalysis:
            "소형가전 카테고리는 사용 공간, 소비전력, 가격대가 구매 결정에 큰 영향을 줍니다. 1인 가구와 원룸 타깃으로 포지셔닝하는 것이 적합합니다.",
          pricingAnalysis:
            `공급가 ${input.supplyPrice.toLocaleString("ko-KR")}원 기준, 목표 마진과 가격 저항선을 고려한 권장 판매가는 ${recommendedPrice.toLocaleString("ko-KR")}원입니다.`,
          copywriting:
            "좁은 공간에서도 부담 없이 사용하는 실속형 소형가전. 필요한 기능만 담아 가격 부담을 낮췄습니다.",
          seoTags: ["#소형가전", "#1인가구", "#원룸추천", "#AI추천상품", "#실속가전"],
          description:
            "AI가 MD 메모를 기반으로 생성한 소형가전 상품 설명입니다. 사용 목적, 공간 효율, 가격 경쟁력을 중심으로 구성되었습니다."
        };
      }
  
      return {
        category: input.category,
        categoryName,
        productName,
        supplyPrice: input.supplyPrice,
        recommendedPrice,
        marketAnalysis:
          "신선식품 카테고리는 산지, 당도, 신선도, 배송 안정성이 구매 전환에 중요합니다. 시즌성과 선물 수요를 함께 강조하는 전략이 적합합니다.",
        pricingAnalysis:
          `공급가 ${input.supplyPrice.toLocaleString("ko-KR")}원 기준, 폐기율과 배송비 리스크를 반영한 권장 판매가는 ${recommendedPrice.toLocaleString("ko-KR")}원입니다.`,
        copywriting:
          "산지의 신선함을 그대로 담은 시즌 신선식품. 당일 선별과 안정적인 포장으로 만족도를 높였습니다.",
        seoTags: ["#신선식품", "#산지직송", "#시즌상품", "#선물추천", "#AI추천상품"],
        description:
          "AI가 MD 메모를 기반으로 생성한 신선식품 상품 설명입니다. 산지, 신선도, 시즌성, 배송 안정성을 중심으로 구성되었습니다."
      };
    }
  
    function extractProductName(memo, fallbackName) {
      const firstLine = memo
        .split("\n")[0]
        .replace(/[0-9,]+원/g, "")
        .trim();
  
      return firstLine.length >= 3 ? firstLine : fallbackName;
    }
  
    function roundToPrice(price) {
      return Math.ceil(price / 100) * 100;
    }
  
    function renderFinalPreview(product) {
      $("#finalCategory").text(product.categoryName);
      $("#finalProductName").text(product.productName);
      $("#finalPrice").text(`${product.recommendedPrice.toLocaleString("ko-KR")}원`);
      $("#finalDescription").text(product.description);
  
      const $tagList = $("#finalTags");
      $tagList.empty();
  
      product.seoTags.forEach(function (tag) {
        $tagList.append(`<span>${tag}</span>`);
      });
    }
  
    function bindPublishButton() {
      $("#publishProductBtn").on("click", async function () {
        if (!generatedProduct) {
          alert("먼저 AI 에이전트를 실행해주세요.");
          return;
        }
  
        const productPayload = {
          name: generatedProduct.productName,
          category: generatedProduct.category,
          category_name: generatedProduct.categoryName,
          price: generatedProduct.recommendedPrice,
          badge: "AI 등록",
          description: generatedProduct.description,
          spec_json: {
            supply_price: generatedProduct.supplyPrice,
            seo_tags: generatedProduct.seoTags,
            copywriting: generatedProduct.copywriting
          },
          image_url: null,
          is_public: true,
          created_by: "AI Agent"
        };
  
        try {
          $("#publishProductBtn")
            .prop("disabled", true)
            .text("등록 중...");
  
          const insertedProduct = await insertProductToDb(productPayload);
  
          alert("상품이 DB에 등록되었습니다.");
  
          window.location.href = `../product-detail.html?id=${insertedProduct.id}`;
        } catch (error) {
          console.error(error);
          alert("상품 등록 중 오류가 발생했습니다. Console을 확인해주세요.");
  
          $("#publishProductBtn")
            .prop("disabled", false)
            .text("상품 등록");
        }
      });
    }
  });
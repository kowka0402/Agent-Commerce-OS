$(document).ready(async function () {
  let uploadedImageUrl = null;
  let generatedProduct = null;
  let uploadedImageFile = null;
  let categories = [];

  try {
    categories = await fetchCategoriesFromDb();
    renderCategoryOptions(categories);
  } catch (error) {
    console.error("카테고리 조회 실패:", error);
  }

  bindImagePreview();
  bindAgentForm();
  bindPublishButton();

  function renderCategoryOptions(categories) {
    const $categoryInput = $("#categoryInput");

    $categoryInput.empty();
    $categoryInput.append(`<option value="">카테고리 선택</option>`);

    categories.forEach(function (category) {
      $categoryInput.append(`
        <option value="${category.code}">
          ${category.name}
        </option>
      `);
    });
  }

  function getCategoryNameByCode(code) {
    const category = categories.find(function (item) {
      return item.code === code;
    });

    return category ? category.name : "기타";
  }

  function bindImagePreview() {
    $("#productImageInput").on("change", function (event) {
      const file = event.target.files[0];

      if (!file) {
        return;
      }

      uploadedImageFile = file;
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
    const categoryName = getCategoryNameByCode(input.category);
    const marginRate = getMarginRateByCategory(input.category);
    const recommendedPrice = roundToPrice(input.supplyPrice * marginRate);

    const productName = extractProductName(
      input.mdMemo,
      `AI 추천 ${categoryName} 상품`
    );

    return {
      category: input.category,
      categoryName,
      productName,
      supplyPrice: input.supplyPrice,
      recommendedPrice,
      marketAnalysis:
        `${categoryName} 카테고리는 고객 수요, 가격 저항선, 시즌성, 상세페이지 카피 품질이 구매 전환에 영향을 줍니다. MD 메모를 기준으로 상품 포지셔닝을 구성했습니다.`,
      pricingAnalysis:
        `공급가 ${input.supplyPrice.toLocaleString("ko-KR")}원 기준, 목표 마진과 가격 저항선을 고려한 권장 판매가는 ${recommendedPrice.toLocaleString("ko-KR")}원입니다.`,
      copywriting:
        `${categoryName} 카테고리에 적합한 실속형 상품입니다. 핵심 장점과 구매 이유를 명확히 전달하도록 구성했습니다.`,
      seoTags: [
        `#${categoryName}`,
        "#AI추천상품",
        "#MD추천",
        "#실속상품",
        "#온라인전용"
      ],
      description:
        `AI가 MD 메모를 기반으로 생성한 ${categoryName} 상품 설명입니다. 상품 특성, 구매 포인트, 가격 경쟁력을 중심으로 구성되었습니다.`
    };
  }

  function getMarginRateByCategory(categoryCode) {
    if (categoryCode === "small_appliance") {
      return 1.55;
    }

    if (categoryCode === "fresh_food") {
      return 1.45;
    }

    return 1.5;
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

      try {
        $("#publishProductBtn")
          .prop("disabled", true)
          .text("등록 중...");

        let imageUrl = null;

        if (uploadedImageFile) {
          imageUrl = await uploadProductImageToStorage(uploadedImageFile);
        }

        const cleanTags = generatedProduct.seoTags.map(function (tag) {
          return tag.replace(/^#/, "");
        });

        const productPayload = {
          name: generatedProduct.productName,
          category: generatedProduct.category,
          category_name: generatedProduct.categoryName,
          price: generatedProduct.recommendedPrice,
          badge: "AI 등록",
          description: generatedProduct.description,
          tags: cleanTags,
          spec_json: {
            supply_price: generatedProduct.supplyPrice,
            seo_tags: generatedProduct.seoTags,
            copywriting: generatedProduct.copywriting
          },
          image_url: imageUrl,
          is_public: true,
          created_by: "AI Agent"
        };

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
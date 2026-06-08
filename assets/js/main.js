$(document).ready(async function () {
    let currentCategory = "all";
    let products = [];
  
    try {
      products = await fetchProductsFromDb();
      renderProducts(products);
    } catch (error) {
      console.error("상품 목록 로딩 실패:", error);
      renderProducts([]);
    }
  
    bindCategoryEvents();
    bindBannerEvent();
    bindOpenChatbotButton();
    bindProductCardEvents();
  
    /**
     * Supabase DB 상품 목록
     * GET /rest/v1/products
     */
    function fetchProducts() {
      return products;
    }
  
    function renderProducts(products) {
      const $productGrid = $("#productGrid");
      const $productCount = $("#productCount");
  
      $productGrid.empty();
      $productCount.text(`${products.length}개 상품`);
  
      if (products.length === 0) {
        $productGrid.append(`
          <div class="empty-product-message">
            상품 데이터를 불러오지 못했습니다.
          </div>
        `);
        return;
      }
  
      products.forEach(function (product) {
        const productCard = createProductCard(product);
        $productGrid.append(productCard);
      });
    }
  
    function createProductCard(product) {
      const formattedPrice = product.price.toLocaleString("ko-KR");
  
      return `
        <article 
          class="product-card" 
          data-product-id="${product.id}"
        >
        <div class="product-img">
            ${
            product.imageUrl
                ? `<img src="${product.imageUrl}" alt="${product.name}" />`
                : product.categoryName
            }
        </div>
  
          <div class="product-info">
            <span class="product-badge">${product.badge || "추천"}</span>
  
            <h3>${product.name}</h3>
  
            <p>${product.description || ""}</p>
  
            <strong class="product-price">${formattedPrice}원</strong>
  
            <div class="product-actions">
              <button 
                type="button" 
                class="btn-cart" 
                data-product-id="${product.id}"
              >
                장바구니
              </button>
            </div>
          </div>
        </article>
      `;
    }
  
    function bindCategoryEvents() {
      $(".category-card").on("click", function () {
        $(".category-card").removeClass("active");
        $(this).addClass("active");
  
        currentCategory = $(this).data("category");
  
        const filteredProducts = currentCategory === "all"
          ? fetchProducts()
          : fetchProducts().filter(function (product) {
              return product.category === currentCategory;
            });
  
        renderProducts(filteredProducts);
      });
    }
  
    function bindBannerEvent() {
      $("#refreshBannerBtn").on("click", function () {
        const bannerData = getMockBannerRecommendation();
  
        $("#bannerTitle").text(bannerData.title);
        $("#bannerDescription").text(bannerData.description);
        $("#weatherText").text(bannerData.weather);
        $("#trendText").text(bannerData.trend);
        $("#recommendText").text(bannerData.recommendedProduct);
      });
    }
  
    function bindOpenChatbotButton() {
      $("#openChatbotFromSection").on("click", function () {
        $("#openChatbotBtn").trigger("click");
      });
    }
  
    function bindProductCardEvents() {
      $(document).on("click", ".product-card", function () {
        const productId = $(this).data("product-id");
  
        window.location.href = `./product-detail.html?id=${productId}`;
      });
  
      $(document).on("click", ".btn-cart", function (event) {
        event.stopPropagation();
  
        const productId = $(this).data("product-id");
  
        const product = products.find(function (item) {
          return item.id === productId;
        });
  
        if (!product) {
          alert("상품 정보를 찾을 수 없습니다.");
          return;
        }
  
        addProductToCart(product, 1);
        openCartConfirmModal(product.name);
      });
    }
  
    /**
     * TODO: 날씨/트렌드 API 연동 예정
     * GET /api/banner/recommendation
     */
    function getMockBannerRecommendation() {
      const mockBanners = [
        {
          title: "폭염 대비 AI 추천 냉방가전",
          description: "현재 기온과 검색 트렌드를 기반으로 미니 냉풍기를 추천합니다.",
          weather: "폭염 / 33℃",
          trend: "냉풍기 검색량 상승",
          recommendedProduct: "미니 냉풍기"
        },
        {
          title: "장마철 습도 관리 추천",
          description: "높은 습도와 계절 수요를 기반으로 미니 제습기를 추천합니다.",
          weather: "비 / 습도 82%",
          trend: "제습기 검색량 상승",
          recommendedProduct: "1인 가구 미니 제습기"
        },
        {
          title: "여름 시즌 신선식품 추천",
          description: "기온 상승에 따라 고당도 수박과 복숭아 상품을 추천합니다.",
          weather: "맑음 / 31℃",
          trend: "수박·복숭아 검색량 상승",
          recommendedProduct: "고당도 수박 6kg"
        }
      ];
  
      const randomIndex = Math.floor(Math.random() * mockBanners.length);
      return mockBanners[randomIndex];
    }
  });
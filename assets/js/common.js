$(document).ready(function () {
    const isAdminPage = window.location.pathname.includes("/admin/");
    const basePath = isAdminPage ? "../" : "./";
  
    $("#header").load(`${basePath}components/header.html`, function () {
      initAuthHeader(basePath);
    });
  
    $("#footer").load(`${basePath}components/footer.html`);
  
    $("#chatbotWidgetArea").load(`${basePath}components/chatbot-widget.html`, function () {
      initChatbotWidget();
    });
  
    $(document).on("click", "#continueShoppingBtn, #cartConfirmDim", function () {
      closeCartConfirmModal();
    });
  });
  
  function initAuthHeader(basePath) {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
  
    fixHeaderLinks(basePath);
    updateAdminMenu(isAdmin);
    bindMobileMenu();
    bindHeaderSearch(basePath);
    updateCartCountBadge();
  
    $("#mockAdminLoginBtn").on("click", function () {
      localStorage.setItem("isAdmin", "true");
      updateAdminMenu(true);
    });
  
    $("#mockAdminLogoutBtn").on("click", function () {
      localStorage.removeItem("isAdmin");
      updateAdminMenu(false);
    });
  }
  
  function fixHeaderLinks(basePath) {
    $(".logo a").attr("href", `${basePath}index.html`);
    $('.gnb a[href="./index.html#products"]').attr("href", `${basePath}index.html#products`);
    $('.gnb a[href="./index.html#ai-shopper"]').attr("href", `${basePath}index.html#ai-shopper`);
    $('.gnb a[href="./cart.html"]').attr("href", `${basePath}cart.html`);
    $('.gnb a[href="./admin/dashboard.html"]').attr("href", `${basePath}admin/dashboard.html`);
  }
  
  function updateAdminMenu(isAdmin) {
    if (isAdmin) {
      $(".admin-only").show();
      $("#mockAdminLoginBtn").hide();
    } else {
      $(".admin-only").hide();
      $("#mockAdminLoginBtn").show();
    }
  }
  
  function bindMobileMenu() {
    $("#mobileMenuBtn").on("click", function () {
      $("#gnb").toggleClass("is-open");
    });
  
    $("#gnb a, #gnb button").on("click", function () {
      $("#gnb").removeClass("is-open");
    });
  }
  
  function bindHeaderSearch(basePath) {
    $("#headerSearchForm").on("submit", function (event) {
      event.preventDefault();
  
      const keyword = $("#headerSearchInput").val().trim();
  
      if (!keyword) {
        alert("검색어를 입력해주세요.");
        return;
      }
  
      window.location.href = `${basePath}category.html?keyword=${encodeURIComponent(keyword)}`;
    });
  }
  
  function addProductToCart(product, quantity = 1, optionName = "기본 옵션") {
    const savedCart = localStorage.getItem("cart");
    const cartItems = savedCart ? JSON.parse(savedCart) : [];
  
    const existingItem = cartItems.find(function (item) {
      return item.productId === product.id && item.optionName === optionName;
    });
  
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cartItems.push({
        id: Date.now(),
        productId: product.id,
        name: product.name,
        category: product.category,
        categoryName: product.categoryName,
        price: product.price,
        badge: product.badge,
        description: product.description,
        optionName,
        quantity,
        checked: true
      });
    }
  
    localStorage.setItem("cart", JSON.stringify(cartItems));
    updateCartCountBadge();
  }
  
  function openCartConfirmModal(productName) {
    $("#cartConfirmProductName").text(productName);
    $("#cartConfirmDim").addClass("is-open");
    $("#cartConfirmModal").addClass("is-open");
  }
  
  function closeCartConfirmModal() {
    $("#cartConfirmDim").removeClass("is-open");
    $("#cartConfirmModal").removeClass("is-open");
  }
  
  function updateCartCountBadge() {
    const savedCart = localStorage.getItem("cart");
    const cartItems = savedCart ? JSON.parse(savedCart) : [];
  
    const totalQuantity = cartItems.reduce(function (sum, item) {
      return sum + item.quantity;
    }, 0);
  
    const $badge = $("#cartCountBadge");
  
    if (!$badge.length) {
      return;
    }
  
    if (totalQuantity > 0) {
      $badge.text(totalQuantity);
      $badge.show();
    } else {
      $badge.hide();
    }
  }
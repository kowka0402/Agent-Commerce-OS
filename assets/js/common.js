$(document).ready(function () {
    const isAdminPage = window.location.pathname.includes("/admin/");
    const basePath = isAdminPage ? "../" : "./";
  
    $("#header").load(`${basePath}components/header.html`, async function () {
      await initAuthHeader(basePath);
  
      if (isAdminPage) {
        await protectAdminPage(basePath);
      }
    });
  
    $("#footer").load(`${basePath}components/footer.html`);
  
    $("#chatbotWidgetArea").load(`${basePath}components/chatbot-widget.html`, function () {
      initChatbotWidget();
    });
  
    $(document).on("click", "#continueShoppingBtn, #cartConfirmDim", function () {
      closeCartConfirmModal();
    });
  });
  
  async function initAuthHeader(basePath) {
    fixHeaderLinks(basePath);
    bindMobileMenu();
    bindHeaderSearch(basePath);
    updateCartCountBadge();
  
    const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  
    if (!user) {
      $(".admin-only").hide();
      $("#loginMenuBtn").show();
      $("#logoutMenuBtn").hide();
      return;
    }
  
    $("#loginMenuBtn").hide();
    $("#logoutMenuBtn").show();
  
    let isAdmin = false;
  
    if (typeof checkIsAdmin === "function") {
      isAdmin = await checkIsAdmin(user.email);
    }
  
    localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
  
    if (isAdmin) {
      $(".admin-only").show();
    } else {
      $(".admin-only").hide();
    }
  
    $("#logoutMenuBtn").on("click", function () {
      if (typeof logout === "function") {
        logout();
        return;
      }
  
      localStorage.clear();
      window.location.href = `${basePath}index.html`;
    });
  }
  
  function fixHeaderLinks(basePath) {
    $(".logo a").attr("href", `${basePath}index.html`);
    $('.gnb a[href="./index.html#products"]').attr("href", `${basePath}index.html#products`);
    $('.gnb a[href="./index.html#ai-shopper"]').attr("href", `${basePath}index.html#ai-shopper`);
    $('.gnb a[href="./cart.html"]').attr("href", `${basePath}cart.html`);
    $('.gnb a[href="./admin/dashboard.html"]').attr("href", `${basePath}admin/dashboard.html`);
    $('.gnb a[href="./login.html"]').attr("href", `${basePath}login.html`);
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
  
  async function protectAdminPage(basePath) {
    const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  
    if (!user) {
      alert("로그인이 필요합니다.");
      window.location.href = `${basePath}login.html`;
      return false;
    }
  
    const isAdmin = await checkIsAdmin(user.email);
  
    if (!isAdmin) {
      alert("관리자 권한이 없습니다.");
      window.location.href = `${basePath}index.html`;
      return false;
    }
  
    return true;
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
        imageUrl: product.imageUrl,
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
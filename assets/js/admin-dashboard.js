$(document).ready(async function () {
    let products = [];
  
    try {
      products = await fetchProductsFromDb();
    } catch (error) {
      console.error("대시보드 상품 조회 실패:", error);
      products = [];
    }
  
    const dashboardData = createDashboardData(products);
  
    renderKpis(dashboardData);
    renderRecentOrders(dashboardData.orders);
    renderCategoryStatus(dashboardData.categoryStats);
    renderAgentLogs(dashboardData.agentLogs);
  
    function createDashboardData(products) {
      const totalProducts = products.length;
  
      const orders = [
        {
          id: "ORD-20260608-001",
          productName: products[0]?.name || "1인 가구 미니 제습기",
          customer: "김**",
          status: "결제완료",
          amount: products[0]?.price || 89000,
          createdAt: "오늘 10:12"
        },
        {
          id: "ORD-20260608-002",
          productName: products[6]?.name || "제주 하우스 감귤 3kg",
          customer: "이**",
          status: "배송준비",
          amount: products[6]?.price || 19900,
          createdAt: "오늘 11:03"
        },
        {
          id: "ORD-20260608-003",
          productName: products[8]?.name || "고당도 수박 6kg",
          customer: "박**",
          status: "결제완료",
          amount: products[8]?.price || 22900,
          createdAt: "오늘 12:41"
        }
      ];
  
      const revenue = orders.reduce(function (sum, order) {
        return sum + order.amount;
      }, 0);
  
      const smallApplianceCount = products.filter(function (product) {
        return product.category === "small_appliance";
      }).length;
  
      const freshFoodCount = products.filter(function (product) {
        return product.category === "fresh_food";
      }).length;
  
      return {
        kpis: {
          totalProducts,
          todayOrders: orders.length,
          revenue,
          agentRuns: 17
        },
        orders,
        categoryStats: [
          {
            name: "소형가전",
            count: smallApplianceCount,
            ratio: calculateRatio(smallApplianceCount, totalProducts)
          },
          {
            name: "신선식품",
            count: freshFoodCount,
            ratio: calculateRatio(freshFoodCount, totalProducts)
          }
        ],
        agentLogs: [
          {
            agent: "Market Analyst",
            message: "DB 상품 데이터를 기준으로 카테고리별 상품 현황 분석 완료",
            status: "완료",
            time: "10분 전"
          },
          {
            agent: "Pricing Agent",
            message: "상품 가격대 분포 및 할인 정책 검토 완료",
            status: "완료",
            time: "9분 전"
          },
          {
            agent: "Copywriter Agent",
            message: "상품 상세 카피 및 추천 문구 생성 준비 완료",
            status: "완료",
            time: "8분 전"
          },
          {
            agent: "SEO Agent",
            message: "상품명, 카테고리, 배지 기반 검색 키워드 추출 완료",
            status: "완료",
            time: "7분 전"
          },
          {
            agent: "QA Reviewer",
            message: "상품 데이터 누락값 및 공개 상태 검수 완료",
            status: "완료",
            time: "6분 전"
          }
        ]
      };
    }
  
    function calculateRatio(count, total) {
      if (!total) {
        return 0;
      }
  
      return Math.round((count / total) * 100);
    }
  
    function renderKpis(data) {
      $("#kpiTotalProducts").text(data.kpis.totalProducts);
      $("#kpiTodayOrders").text(data.kpis.todayOrders);
      $("#kpiRevenue").text(`${data.kpis.revenue.toLocaleString("ko-KR")}원`);
      $("#kpiAgentRuns").text(data.kpis.agentRuns);
    }
  
    function renderRecentOrders(orders) {
      const $list = $("#recentOrderList");
  
      $list.empty();
  
      orders.forEach(function (order) {
        const row = `
          <div class="dashboard-order-item">
            <div>
              <strong>${order.productName}</strong>
              <p>${order.id} · ${order.customer}</p>
            </div>
  
            <div class="order-meta">
              <span class="order-status">${order.status}</span>
              <strong>${order.amount.toLocaleString("ko-KR")}원</strong>
              <small>${order.createdAt}</small>
            </div>
          </div>
        `;
  
        $list.append(row);
      });
    }
  
    function renderCategoryStatus(categories) {
      const $list = $("#categoryStatusList");
  
      $list.empty();
  
      categories.forEach(function (category) {
        const item = `
          <div class="category-status-item">
            <div class="category-status-head">
              <strong>${category.name}</strong>
              <span>${category.count}개 / ${category.ratio}%</span>
            </div>
  
            <div class="category-progress">
              <div style="width: ${category.ratio}%"></div>
            </div>
          </div>
        `;
  
        $list.append(item);
      });
    }
  
    function renderAgentLogs(logs) {
      const $list = $("#agentLogList");
  
      $list.empty();
  
      logs.forEach(function (log) {
        const item = `
          <div class="agent-log-item">
            <div>
              <strong>${log.agent}</strong>
              <p>${log.message}</p>
            </div>
  
            <div class="agent-log-meta">
              <span>${log.status}</span>
              <small>${log.time}</small>
            </div>
          </div>
        `;
  
        $list.append(item);
      });
    }
  });
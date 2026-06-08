$(document).ready(function () {
    const dashboardData = createMockDashboardData();
  
    renderKpis(dashboardData);
    renderRecentOrders(dashboardData.orders);
    renderCategoryStatus(dashboardData.categoryStats);
    renderAgentLogs(dashboardData.agentLogs);
  
    /**
     * TODO: FastAPI 연동 예정
     * GET /api/admin/dashboard
     * response: {
     *   kpis,
     *   recentOrders,
     *   categoryStats,
     *   agentLogs
     * }
     */
    function createMockDashboardData() {
      const totalProducts = PRODUCTS.length;
  
      const orders = [
        {
          id: "ORD-20260608-001",
          productName: "1인 가구 미니 제습기",
          customer: "김**",
          status: "결제완료",
          amount: 89000,
          createdAt: "오늘 10:12"
        },
        {
          id: "ORD-20260608-002",
          productName: "제주 하우스 감귤 3kg",
          customer: "이**",
          status: "배송준비",
          amount: 19900,
          createdAt: "오늘 11:03"
        },
        {
          id: "ORD-20260608-003",
          productName: "고당도 수박 6kg",
          customer: "박**",
          status: "결제완료",
          amount: 22900,
          createdAt: "오늘 12:41"
        }
      ];
  
      const revenue = orders.reduce(function (sum, order) {
        return sum + order.amount;
      }, 0);
  
      const smallApplianceCount = PRODUCTS.filter(function (product) {
        return product.category === "small_appliance";
      }).length;
  
      const freshFoodCount = PRODUCTS.filter(function (product) {
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
            ratio: Math.round((smallApplianceCount / totalProducts) * 100)
          },
          {
            name: "신선식품",
            count: freshFoodCount,
            ratio: Math.round((freshFoodCount / totalProducts) * 100)
          }
        ],
        agentLogs: [
          {
            agent: "Market Analyst",
            message: "제주 감귤 3kg 경쟁가 분석 완료",
            status: "완료",
            time: "10분 전"
          },
          {
            agent: "Pricing Agent",
            message: "공급가 12,000원 기준 권장 판매가 산출",
            status: "완료",
            time: "9분 전"
          },
          {
            agent: "Copywriter Agent",
            message: "신선식품 상세 카피 생성 완료",
            status: "완료",
            time: "8분 전"
          },
          {
            agent: "SEO Agent",
            message: "산지직송, 시즌과일, 선물추천 태그 생성",
            status: "완료",
            time: "7분 전"
          },
          {
            agent: "QA Reviewer",
            message: "과장 표현 및 금칙어 검수 완료",
            status: "완료",
            time: "6분 전"
          }
        ]
      };
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
async function loginWithEmail(email, password) {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`로그인 실패: ${errorText}`);
    }
  
    const data = await response.json();
  
    saveAuthSession(data);
  
    return data.user;
  }
  
  async function signupWithEmail(email, password) {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`회원가입 실패: ${errorText}`);
    }
  
    const data = await response.json();
  
    if (data.access_token && data.user) {
      saveAuthSession(data);
    }
  
    return data.user;
  }
  
  async function insertUserProfile(profile) {
    const token = getAccessToken();
  
    if (!token) {
      throw new Error("프로필 저장을 위한 로그인 토큰이 없습니다.");
    }
  
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify(profile)
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`프로필 저장 실패: ${errorText}`);
    }
  
    const data = await response.json();
    return data[0];
  }
  
  function saveAuthSession(data) {
    localStorage.setItem("supabaseAccessToken", data.access_token);
    localStorage.setItem("supabaseRefreshToken", data.refresh_token);
    localStorage.setItem("supabaseUser", JSON.stringify(data.user));
  }
  
  function getCurrentUser() {
    const savedUser = localStorage.getItem("supabaseUser");
    return savedUser ? JSON.parse(savedUser) : null;
  }
  
  function getAccessToken() {
    return localStorage.getItem("supabaseAccessToken");
  }
  
  function logout() {
    localStorage.removeItem("supabaseAccessToken");
    localStorage.removeItem("supabaseRefreshToken");
    localStorage.removeItem("supabaseUser");
    localStorage.removeItem("isAdmin");
  
    const isAdminPage = window.location.pathname.includes("/admin/");
    const basePath = isAdminPage ? "../" : "./";
  
    window.location.href = `${basePath}index.html`;
  }
  
  async function checkIsAdmin(email) {
    const token = getAccessToken();
  
    if (!token || !email) {
      return false;
    }
  
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/admin_users?email=eq.${encodeURIComponent(email)}&select=email&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`
        }
      }
    );
  
    if (!response.ok) {
      return false;
    }
  
    const data = await response.json();
    return data.length > 0;
  }
  
  async function requireAdmin() {
    const user = getCurrentUser();
  
    if (!user) {
      window.location.href = "../login.html";
      return false;
    }
  
    const isAdmin = await checkIsAdmin(user.email);
  
    if (!isAdmin) {
      alert("관리자 권한이 없습니다.");
      window.location.href = "../index.html";
      return false;
    }
  
    return true;
  }
  
  $(document).ready(function () {
    $("#loginForm").on("submit", async function (event) {
      event.preventDefault();
  
      const email = $("#loginEmail").val().trim();
      const password = $("#loginPassword").val().trim();
  
      if (!email || !password) {
        alert("이메일과 비밀번호를 입력해주세요.");
        return;
      }
  
      try {
        $("#loginSubmitBtn")
          .prop("disabled", true)
          .text("로그인 중...");
  
        const user = await loginWithEmail(email, password);
        const isAdmin = await checkIsAdmin(user.email);
  
        localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
  
        if (isAdmin) {
          window.location.href = "./admin/dashboard.html";
        } else {
          window.location.href = "./index.html";
        }
      } catch (error) {
        console.error(error);
        alert("로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해주세요.");
  
        $("#loginSubmitBtn")
          .prop("disabled", false)
          .text("로그인");
      }
    });
  });
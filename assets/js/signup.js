$(document).ready(function () {
    $("#signupForm").on("submit", async function (event) {
      event.preventDefault();
  
      const email = $("#signupEmail").val().trim();
      const password = $("#signupPassword").val().trim();
      const passwordConfirm = $("#signupPasswordConfirm").val().trim();
      const name = $("#signupName").val().trim();
      const phone = $("#signupPhone").val().trim();
      const birthDate = $("#signupBirthDate").val();
      const gender = $("#signupGender").val();
      const address = $("#signupAddress").val().trim();
      const addressDetail = $("#signupAddressDetail").val().trim();
      const marketingAgreed = $("#agreeMarketing").is(":checked");
  
      if (!email || !password || !passwordConfirm || !name) {
        alert("이메일, 비밀번호, 이름은 필수입니다.");
        return;
      }
  
      if (password.length < 8) {
        alert("비밀번호는 8자 이상 입력해주세요.");
        return;
      }
  
      if (password !== passwordConfirm) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }
  
      if (!$("#agreeTerms").is(":checked")) {
        alert("이용약관에 동의해주세요.");
        return;
      }
  
      if (!$("#agreePrivacy").is(":checked")) {
        alert("개인정보 수집 및 이용에 동의해주세요.");
        return;
      }
  
      try {
        $("#signupSubmitBtn")
          .prop("disabled", true)
          .text("가입 중...");
  
        const user = await signupWithEmail(email, password);
  
        if (!user) {
          alert("회원가입 요청이 완료되었습니다. 이메일 인증 설정을 확인해주세요.");
          window.location.href = "./login.html";
          return;
        }
  
        await insertUserProfile({
          id: user.id,
          email,
          name,
          phone,
          birth_date: birthDate || null,
          gender: gender || null,
          address,
          address_detail: addressDetail,
          marketing_agreed: marketingAgreed
        });
  
        alert("회원가입이 완료되었습니다. 로그인 후 이용해주세요.");

        localStorage.removeItem("supabaseAccessToken");
        localStorage.removeItem("supabaseRefreshToken");
        localStorage.removeItem("supabaseUser");
        localStorage.removeItem("isAdmin");
        
        window.location.href = "./login.html";
      } catch (error) {
        console.error(error);
        alert(error.message || "회원가입 중 오류가 발생했습니다.");
  
        $("#signupSubmitBtn")
          .prop("disabled", false)
          .text("회원가입");
      }
    });
  });
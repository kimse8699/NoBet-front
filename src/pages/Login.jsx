import { useState, useEffect } from "react";
import "../pages_styles/Login.css"; // ✅ 스타일 적용
import loginIcon from "../assets/login-icon.png"; // ✅ 아이콘 추가
import KakaoLogo from "../assets/kakao-logo.png";
import { useCookieManager } from "../customHook/useCookieManager"; // ✅ 쿠키 관리 훅
import { useNavigate } from "react-router-dom";

const kakaoURL = `${import.meta.env.VITE_SERVER_URL}/oauth2/authorization/kakao`;

export default function Login() {
  const { getCookies, removeCookies } = useCookieManager();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
      const checkLoginStatus = async () => {
          const cookies = await getCookies(); // ✅ 비동기적으로 쿠키 가져오기
          if (cookies && cookies.accessToken) {
              console.log("✅ 로그인 상태 확인됨:", cookies.accessToken);
              setIsLoggedIn(true);
          } else {
              console.warn("❌ 로그인되지 않음");
              setIsLoggedIn(false);
          }
      };

      checkLoginStatus();
  }, []);

  // ✅ 로그인 버튼 클릭 (카카오 로그인 페이지 이동)
  const handleLogin = (e) => {
      e.preventDefault();
      console.log(kakaoURL);
      window.location.href = kakaoURL;
  };

  // ✅ 로그아웃 버튼 클릭 (쿠키 삭제 후 로그인 페이지 이동)
  const handleLogout = () => {
      removeCookies();
      setIsLoggedIn(false); // ✅ 상태 업데이트
      navigate("/login");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* ✅ 아이콘 추가 */}
        <img src={loginIcon} alt="로그인 아이콘" className="login-icon" />

        <h2>{isLoggedIn ? "로그아웃" : "로그인"}</h2>
        <p>{isLoggedIn ? "로그아웃하시겠습니까?" : "간편하게 로그인하고 서비스를 이용하세요."}</p>

        {/* ✅ 로그인 상태에 따라 버튼 변경 */}
        {isLoggedIn ? (
          <button onClick={handleLogout} className="logout-btn">
            로그아웃
          </button>
        ) : (
          <button onClick={handleLogin} className="kakao-btn">
            <img src={KakaoLogo} alt="카카오 로고" className="kakao-icon" />
            카카오톡으로 계속하기
          </button>
        )}
      </div>
    </div>
  );
}

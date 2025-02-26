import React, { useState, useEffect } from "react";
import ToggleButton from "../components/ToggleButton";
import ButtonGroup from "../components/ButtonGroup.jsx";
import "../pages_styles/Home.css";
import { useCookieManager } from "../customHook/useCookieManager";

function Home() {
  const { getCookies, setCookies, removeCookies } = useCookieManager();
  const findUser = async () => {
    try {
        const cookies = await getCookies(); // ✅ 비동기적으로 쿠키 가져오기
        const localAccessToken = cookies.accessToken;

        if (!localAccessToken) {
            console.warn("❌ AccessToken이 없습니다. 로그인 필요.");
            return;
        }

        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/user`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localAccessToken}`
            }
        });

        if (!response.ok) {
            throw new Error("사용자 정보를 가져오는데 실패했습니다.");
        }

        const data = await response.json();
        console.log("✅ 사용자 정보:", data);
    } catch (error) {
        console.error("❌ 사용자 정보 조회 오류:", error);
    }
};
  useEffect(()=>{
    findUser();
  }, []);

  const [isBlocked, setIsBlocked] = useState(false);
  const [blockCount, setBlockCount] = useState(0);

  // ✅ 크롬 스토리지에서 `isBlocked` 및 `blockCount` 값 불러오기
  useEffect(() => {
    chrome.storage.local.get(["isBlocked", "blockCount"], (result) => {
      if (result.isBlocked !== undefined) {
        setIsBlocked(result.isBlocked);
      }
      if (result.blockCount !== undefined) {
        setBlockCount(result.blockCount); // 차단 횟수도 불러오기
      }
    });
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.blockCount) {
        setBlockCount(changes.blockCount.newValue);
      }
    });

    return () => {
      chrome.storage.onChanged.removeListener();
    };
  }, []);

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.blockCount) {
      setBlockCount(changes.blockCount.newValue);
    }
  });

  // ✅ 토글 상태가 변경될 때 차단 횟수를 0으로 초기화
  useEffect(() => {
    if (!isBlocked) {
      setBlockCount(0);
      chrome.storage.local.set({ blockCount: 0 }); // 크롬 스토리지에서도 초기화
    }
  }, [isBlocked]);

  return (
    <div>
      <div className="main-function">
        <h1 className="intro-text">Gambling Site Blocker</h1>
        <h1 className="blocked-state">
          {isBlocked ? "차단 활성화" : "차단 비활성화"}
        </h1>
        <p className="blocked-total-count">총 차단됨 : {blockCount}</p>
        <ToggleButton isBlocked={isBlocked} setIsBlocked={setIsBlocked} />
      </div>
      <ButtonGroup></ButtonGroup>
    </div>
  );
}

export default Home;

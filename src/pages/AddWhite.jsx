import React, { useState, useEffect } from "react";
import { X } from "lucide-react"; // ❌ 아이콘 적용
import '../pages_styles/AddWhite.css';
import {useCookieManager} from '../customHook/useCookieManager'

function AddWhite() {
  const [site, setSite] = useState(""); // 입력 값
  const [whitelist, setWhitelist] = useState([]); // 차단 제외 목록
  const { getCookies, setCookies, removeCookies } = useCookieManager();
  // 🔹 입력 필드 값 변경 핸들러
  const handleChange = (e) => {
    setSite(e.target.value);
  };

  async function refreshAccessToken() {
    const refreshToken = await getCookies().refreshToken;
    if (!refreshToken) return removeCookies("accessToken"), removeCookies("refreshToken");
    const localAccessToken = cookies.accessToken;

    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/reissue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" ,
          'Authorization': `Bearer ${localAccessToken}`
        },
        body: JSON.stringify({ "accessToken":accessToken,"refreshToken":refreshToken }),
    });

    if (!res.ok) return removeCookies("accessToken"), removeCookies("refreshToken");

    const { accessToken, refreshToken: newRefreshToken } = await res.json();
    setCookies("accessToken", accessToken);
    setCookies("refreshToken", newRefreshToken);
  }
  const fetchWhiteList = async () => {
    const cookies = await getCookies();
    const localAccessToken = cookies.accessToken;
    if (!localAccessToken) {
        console.warn("AccessToken이 존재하지 않습니다.");
        return;
    }

    try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/whiteUrls/getWhiteUrls`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localAccessToken}`
            }
        });

        if (!response.ok) throw new Error('화이트 리스트 불러오기 실패');

        const data = await response.json();
        console.log('화이트 리스트 가져오기:', data.resultData); 

        // 🔹 API 응답 데이터를 `whitelist` 상태에 저장
        setWhitelist(data.resultData.map(item => item.whiteUrl));

    } catch (error) {
        console.error('화이트 리스트 불러오기 오류:', error);
        refreshAccessToken();
    }
  };

  

  // 🔹 차단 제외 목록에 추가 (입력 값 그대로 추가)
  const isValidUrl = (url) => {
    const urlPattern = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return urlPattern.test(url);
  };
  
  const handleAdd = async () => {
      if (site.trim() === "" || whitelist.includes(site)) {
          console.warn("이미 존재하거나 빈 값입니다.");
          return;
      }
  
      if (!isValidUrl(site)) {
          alert("올바른 URL 형식이 아닙니다. (예: naver.com, google.co.kr)");
          return;
      }
    
      const cookies = await getCookies();
      const localAccessToken = cookies.accessToken;
      if (!localAccessToken) {
          console.warn("AccessToken이 존재하지 않습니다.");
          return;
      }
  
      try {
          const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/whiteUrls/newWhiteUrls`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${localAccessToken}`
              },
              body: JSON.stringify({ whiteUrl: site })
          });
  
          if (!response.ok) throw new Error("화이트 리스트 추가 실패");
  
          // ✅ 성공 시 상태 업데이트
          setWhitelist([...whitelist, site]);
          setSite("");
      } catch (error) {
          console.error("화이트 리스트 추가 오류:", error);
      }
  };
  
  
  // 🔹 Enter 키 입력 시 자동 추가
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  // 🔹 목록에서 제거
  const handleRemove = async (index) => {
    const siteToRemove = whitelist[index];

    const cookies = await getCookies();
    const localAccessToken = cookies.accessToken;
    if (!localAccessToken) {
        console.warn("AccessToken이 존재하지 않습니다.");
        return;
    }

    try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/whiteUrls/deleteWhiteUrls`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localAccessToken}`
            },
            body: JSON.stringify({ whiteUrl: siteToRemove }) // ✅ JSON 객체로 감싸서 보냄
        });

        if (!response.ok) throw new Error("화이트 리스트 삭제 실패");

        // ✅ 성공 시 상태 업데이트
        setWhitelist(whitelist.filter((_, i) => i !== index));
    } catch (error) {
        console.error("화이트 리스트 삭제 오류:", error);
    }
};


  useEffect(() => {
    fetchWhiteList();
  },[])

  return (
    <div className="whitelist-container">
      <h1 className="page-title">차단 제외 리스트</h1>

      {/* 입력 필드 & 추가 버튼 */}
      <div className="input-group">
        <input
          type="text"
          placeholder="예: example.com"
          value={site}
          onChange={handleChange}
          onKeyPress={handleKeyPress} // Enter 키 이벤트 추가
        />
        <button onClick={handleAdd}>추가</button>
      </div>

      {/* URL 리스트 (스크롤 가능) */}
      <div className="whitelist-box">
        <table className="whitelist-table">
          <thead>
            <tr>
              <th>사이트 URL</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {whitelist.length === 0 ? (
              <tr>
                <td colSpan="2" className="empty-message">차단 제외 사이트가 없습니다</td>
              </tr>
            ) : (
              whitelist.map((item, index) => (
                <tr key={index}>
                  <td className="url-cell">{item}</td>
                  <td className="delete-cell">
                    <button onClick={() => handleRemove(index)} className="delete-button">
                      <X size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AddWhite;

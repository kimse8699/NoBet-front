export const useCookieManager = () => {
    // ✅ 쿠키 저장 (로컬 스토리지 활용)
    const setCookies = (accessToken, refreshToken) => {
        chrome.storage.local.set({ 
            accessToken, 
            refreshToken 
        }, () => {
            if (chrome.runtime.lastError) {
                console.error("❌ 쿠키 저장 오류:", chrome.runtime.lastError);
            } else {
                console.log("✅ 쿠키 저장 완료", { accessToken, refreshToken });
            }
        });
    };

    // ✅ 쿠키 가져오기 (비동기 함수)
    const getCookies = async () => {
        return new Promise((resolve) => {
            chrome.storage.local.get(["accessToken", "refreshToken"], (result) => {
                if (chrome.runtime.lastError) {
                    console.error("❌ 쿠키 가져오기 오류:", chrome.runtime.lastError);
                    resolve(null);
                } else {
                    console.log("🍪 쿠키 가져오기 완료", result);
                    resolve(result); // 비동기적으로 쿠키 반환
                }
            });
        });
    };

    // ✅ 쿠키 삭제
    const removeCookies = () => {
        chrome.storage.local.remove(["accessToken", "refreshToken"], () => {
            if (chrome.runtime.lastError) {
                console.error("❌ 쿠키 삭제 오류:", chrome.runtime.lastError);
            } else {
                console.log("🗑️ 쿠키 삭제 완료");
            }
        });
    };

    return { setCookies, getCookies, removeCookies };
};

import { useEffect } from "react";
import { Check, X } from "lucide-react";
import "../components_styles/ToggleButton.css";

const TOGGLE_STORAGE_KEY = "isBlocked"; // ✅ LocalStorage 키

export default function ToggleButton({ isBlocked, setIsBlocked }) {
  // ✅ 저장된 토글 상태를 불러오는 함수
  useEffect(() => {
    chrome.storage.local.get([TOGGLE_STORAGE_KEY], (result) => {
      if (result[TOGGLE_STORAGE_KEY] !== undefined) {
        setIsBlocked(result[TOGGLE_STORAGE_KEY]); // ✅ 저장된 상태 복원
      }
    });
  }, []);

  // ✅ 토글 버튼 클릭 시 실행되는 함수
  const handleToggle = (event) => {
    event.preventDefault(); // ✅ 팝업 닫힘 방지
    event.stopPropagation(); // ✅ 이벤트 전파 방지

    const newBlockedState = !isBlocked; // ✅ 상태 변경
    setIsBlocked(newBlockedState); // ✅ UI 업데이트
    chrome.storage.local.set({ [TOGGLE_STORAGE_KEY]: newBlockedState }, () => {
      if (!newBlockedState) {
        // ✅ 차단 비활성화 시 차단 횟수 초기화
        chrome.storage.local.set({ blockCount: 0 });
      }
    });
  };

  return (
    <div className="toggle-container" onClick={handleToggle}>
      <div className={`toggle-track ${isBlocked ? "enabled" : "disabled"}`}>
        <div className="toggle-circle">
          {isBlocked ? <Check className="icon" size={20} /> : <X className="icon" size={20} />}
        </div>
      </div>
    </div>
  );
}

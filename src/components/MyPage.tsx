// MyPage.jsx
export default function MyPage() {
    return (
        <div className="w-full h-screen bg-gray-100 flex items-center justify-center relative">
            <div className="absolute top-6 left-6 z-30">
                <button
                    className="bg-white shadow-md px-4 py-2 rounded-xl font-semibold hover:bg-indigo-500 hover:text-white transition"
                    onClick={() => window.fullpage_api.moveSlideLeft()} // ← 왼쪽으로 슬라이드 이동
                >
                    ← 돌아가기
                </button>
            </div>

            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">마이페이지</h1>
                <p className="text-lg text-gray-600">개인 정보, 설정, 방문 기록 등을 여기에 표시하세요.</p>
            </div>
        </div>
    );
}
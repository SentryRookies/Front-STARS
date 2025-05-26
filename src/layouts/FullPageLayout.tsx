import { useEffect, useState } from "react";
import ReactFullpage from "@fullpage/react-fullpage";
import MapSection from "../pages/stars/MapSectionPage";
import Dashboard from "../pages/stars/DashboardPage";
import { initializeAppHeight } from "../utils/setAppHeight";
import MyPage from "../pages/user/MyPage";
import useCustomLogin from "../hooks/useCustomLogin";

export default function FullPageLayout() {
    const { isLogin } = useCustomLogin();
    const [searchKeyword, setSearchKeyword] = useState<string | null>(null);

    useEffect(() => {
        initializeAppHeight();
        const disableScroll = () => {
            if (window.fullpage_api) {
                window.fullpage_api.setAllowScrolling(false);
                window.fullpage_api.setKeyboardScrolling(false);
            }
        };
        setTimeout(disableScroll, 500);
    }, []);

    return (
        <ReactFullpage
            licenseKey="YOUR_KEY_HERE"
            autoScrolling={true}
            scrollingSpeed={700}
            controlArrows={false}
            scrollOverflow={false}
            credits={{ enabled: false }}
            render={() => (
                <ReactFullpage.Wrapper>
                    <div className="section">
                        <div className="slide">
                            <MapSection
                                searchKeyword={searchKeyword}
                                onSearchComplete={() => setSearchKeyword(null)}
                            />
                        </div>
                        <div className="slide">
                            {isLogin ? (
                                <MyPage onMapView={setSearchKeyword} />
                            ) : (
                                <div />
                            )}
                        </div>
                    </div>
                    <div className="section">
                        <Dashboard />
                    </div>
                    <div className="section"></div>
                </ReactFullpage.Wrapper>
            )}
        />
    );
}

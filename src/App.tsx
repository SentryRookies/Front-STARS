// src/App.tsx
import { useEffect } from 'react';
import ReactFullpage from '@fullpage/react-fullpage';
import MapSection from './components/MapSection';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import MyPage from './components/MyPage';

function App(): JSX.Element {
    useEffect(() => {
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
            scrollingSpeed={700}
            controlArrows={false}
            render={() => {
                return (
                    <ReactFullpage.Wrapper>
                        {/* 첫 번째 섹션: 가로 슬라이드 2개 (지도, 마이페이지) */}
                        <div className="section">
                            <div className="slide"><MapSection /></div>
                            <div className="slide"><MyPage /></div>
                        </div>

                        {/* 이후 세로 섹션들 (About, Projects, Contact) */}
                        <div className="section"><About /></div>
                        <div className="section"><Projects /></div>
                        <div className="section"><Contact /></div>
                    </ReactFullpage.Wrapper>
                );
            }}
        />
    );
}

export default App;
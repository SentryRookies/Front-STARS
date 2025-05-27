export class LocationControl {
    // Declare class properties
    private center: [number, number];
    private zoom: number;
    private title: string;
    private className: string;
    private map: mapboxgl.Map | undefined;
    private container: HTMLDivElement | undefined;
    private button: HTMLButtonElement | undefined;

    constructor() {
        this.center = [126.9779692, 37.566535];
        this.zoom = 10.8;
        this.title = "서울 중심으로 이동";
        this.className = "mapboxgl-ctrl-location";
    }

    onAdd(map: mapboxgl.Map): HTMLElement {
        this.map = map;

        // 컨트롤 컨테이너 생성
        this.container = document.createElement("div");
        this.container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";

        // 버튼 생성
        this.button = document.createElement("button");
        this.button.className = this.className;
        this.button.type = "button";
        this.button.title = this.title;
        this.button.setAttribute("aria-label", this.title);

        this.button.innerHTML = "🏠";

        // 클릭 이벤트 리스너
        this.button.addEventListener("click", this.onClick.bind(this));

        this.container.appendChild(this.button);
        return this.container;
    }

    onRemove(): void {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.map = undefined;
    }

    private onClick(): void {
        if (!this.map) return;

        // 지정된 위치로 애니메이션과 함께 이동하며 기울기도 초기화
        this.map.flyTo({
            center: this.center,
            zoom: this.zoom,
            pitch: 0, // 기울기 초기화 (0도 = 수직 보기)
            bearing: 0, // 회전도 초기화 (0도 = 북쪽이 위)
            essential: true, // 접근성을 위해 애니메이션을 건너뛸 수 있음
        });
    }
}

// CSS 스타일을 자동으로 추가하는 함수
export function addLocationControlStyles(): void {
    // 이미 스타일이 추가되었는지 확인
    if (document.getElementById("location-control-styles")) {
        return;
    }

    const style = document.createElement("style");
    style.id = "location-control-styles";
    style.textContent = `
        .mapboxgl-ctrl-location {
            background-color: #fff;
            border: none;
            border-radius: 2px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 29px;
            height: 29px;
            transition: background-color 0.2s ease;
        }
        
        .mapboxgl-ctrl-location:hover {
            background-color: #f0f0f0;
        }
        
        .mapboxgl-ctrl-location:active {
            background-color: #e0e0e0;
        }
        
        .custom-location-btn {
            background-color: #007cbf;
            color: white;
        }
        
        .custom-location-btn:hover {
            background-color: #005a87;
        }
    `;
    document.head.appendChild(style);
}

// 기본 export (선택사항)
export default LocationControl;

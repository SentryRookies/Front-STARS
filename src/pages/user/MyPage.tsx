import MyPageComponent from "../../components/user/MyPageComponent";

export default function MyPage({
    onMapView,
}: {
    onMapView: (name: string) => void;
}) {
    return <MyPageComponent onMapView={onMapView} />;
}

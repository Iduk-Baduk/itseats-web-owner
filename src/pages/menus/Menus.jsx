import Header from "../../components/common/Header";
import useFetchMenus from "../../hooks/useFetchMenus";

export default function Menus() {
  const { menu, status, error } = useFetchMenus();

  if (status === "loading") {
    return <div>메뉴를 불러오는 중...</div>;
  }

  if (error) {
    return <p> 에러 발생: {error}</p>;
  }

  console.log("메뉴", menu);

  return (
    <>
      <Header
        nickname="홍길동"
        showBackButton={true}
        onLeftClick={() => {
          console.log("뒤로가기 클릭됨");
        }}
      />
    </>
  );
}

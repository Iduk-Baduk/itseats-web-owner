import Header from "../../components/common/Header";
import useFetchMenus from "../../hooks/useFetchMenus";
import MenuStore from "../../components/menu/MenuStore";
import MenusSummaryCard from "../../components/menu/MenuSummaryCard";
import MenuList from "../../components/menu/MenuList";
import MenuActions from "../../components/menu/MenuActions";
import MenuGroupModal from "../../components/menu/MenuGroupModal";

import styles from "./Menus.module.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Menus() {
  const { menu, status, error } = useFetchMenus();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [menuGroupModal, setMenuGroupModal] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const groupNames = useSelector((state) => state.menu.groupNames);

  const handleMenuSelect = (menuId) => {
    setSelectedMenuId(menuId);
  };

  const handleAddOrEditMenu = () => {
    if (selectedMenuId) {
      navigate(`/menus/edit/${selectedMenuId}`);
    } else {
      navigate("/menus/add");
    }
  };

  if (status === "loading") {
    return <div>메뉴를 불러오는 중...</div>;
  }

  if (error) {
    return <p>에러 발생: {error}</p>;
  }

  return (
    <div className={styles.container}>
      <Header
        showBackButton={true}
        onLeftClick={() => {
          console.log("뒤로가기 클릭됨");
        }}
      />

      <h1 className={styles.title}>메뉴 관리</h1>
      {/* 매장 선택 */}
      <MenuStore menu={menu} />
      {/* 요약 카드 */}
      <MenusSummaryCard menu={menu} />
      {/* 메뉴 리스트 */}
      <MenuList 
        menu={menu} 
        onMenuSelect={handleMenuSelect}
      />
      {/* 메뉴 추가 및 관리 버튼 */}
      <MenuActions
        handleAddMenu={handleAddOrEditMenu}
        handleManageMenuGroup={() => {
          setMenuGroupModal(true);
        }}
        selectedMenuId={selectedMenuId}
      />

      {/* 메뉴 그룹 관리 모달 */}
      <MenuGroupModal
        groupNames={groupNames}
        modalState={menuGroupModal}
        setModalState={setMenuGroupModal}
        setGroupNames={(newGroups) => {
          // 메뉴 그룹 업데이트 로직은 모달 내부에서 처리됨
        }}
        onclose={() => setMenuGroupModal(false)}
      />
    </div>
  );
}

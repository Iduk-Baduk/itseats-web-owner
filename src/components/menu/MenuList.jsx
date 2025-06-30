import { useState } from "react";
import styles from "./MenuList.module.css";
import { groupMenusByCategory } from "../../utils/groupMenus";
import { useSelector, useDispatch } from "react-redux";
import { updateMenuPriority } from "../../store/menuSlice";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableMenuItem = ({ item, selectedMenuId, onMenuClick, menuStatuses, onStatusChange }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(item.menuId),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 'auto',
    position: 'relative',
    opacity: isDragging ? 0.5 : 1,
    boxShadow: isDragging ? '0 0 10px rgba(0,0,0,0.2)' : 'none',
  };

  const handleClick = (e) => {
    // select 요소 클릭 시 이벤트 전파 중단
    if (e.target.tagName.toLowerCase() === 'select') {
      return;
    }
    // 드래그 중이 아닐 때만 클릭 이벤트 처리
    if (!isDragging) {
      onMenuClick(item.menuId || item.id);
    }
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${styles.menuItem} ${selectedMenuId === (item.menuId || item.id) ? styles.selected : ''}`}
      onClick={handleClick}
      data-id={String(item.menuId || item.id)}
    >
      <div className={styles.imageBox}></div>
      <span className={styles.menuName}>{item.menuName}</span>
      <select
        className={styles.statusSelect}
        value={menuStatuses[item.menuId || item.id] || item.menuStatus}
        onChange={(e) => {
          e.stopPropagation();
          onStatusChange(item.menuId || item.id, e.target.value);
        }}
      >
        <option value="ONSALE">판매중</option>
        <option value="OUT_OF_STOCK">오늘만 품절</option>
        <option value="HIDDEN">메뉴숨김</option>
      </select>
    </li>
  );
};

export default function MenuList({ menu, onMenuSelect }) {
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [menuStatuses, setMenuStatuses] = useState({});
  const groupNames = useSelector((state) => state.menu.groupNames);
  const dispatch = useDispatch();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleStatusChange = (menuId, status) => {
    setMenuStatuses(prev => ({ ...prev, [menuId]: status }));
  };

  const handleMenuClick = (menuId) => {
    console.log("Menu clicked:", menuId);
    const newSelectedId = selectedMenuId === menuId ? null : menuId;
    setSelectedMenuId(newSelectedId);
    onMenuSelect(newSelectedId);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const draggedMenuId = Number(active.id);
    setSelectedMenuId(draggedMenuId);
    onMenuSelect(draggedMenuId);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeGroupName = groupNames.find(groupName => 
      groupedMenus[groupName]?.some(menu => String(menu.menuId || menu.id) === active.id)
    );

    if (!activeGroupName || !groupedMenus[activeGroupName]) return;

    const oldIndex = groupedMenus[activeGroupName].findIndex(menu => String(menu.menuId || menu.id) === active.id);
    const newIndex = groupedMenus[activeGroupName].findIndex(menu => String(menu.menuId || menu.id) === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const updatedMenus = [...groupedMenus[activeGroupName]];
    const [movedMenu] = updatedMenus.splice(oldIndex, 1);
    updatedMenus.splice(newIndex, 0, movedMenu);

    const menusWithNewPriority = updatedMenus.map((menu, index) => ({
      ...menu,
      menuPriority: index + 1
    }));

    dispatch(updateMenuPriority({ 
      groupName: activeGroupName, 
      menus: menusWithNewPriority 
    }));
  };

  const groupedMenus = menu.menus && Array.isArray(menu.menus) && menu.menus.length > 0 
    ? groupMenusByCategory(menu.menus) 
    : {};

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div>
        {menu.menus && Array.isArray(menu.menus) && menu.menus.length > 0 ? (
          groupNames.map((groupName) => (
            groupedMenus[groupName] && (
              <div key={`group-${groupName}`}>
                <h2 className={styles.groupTitle}>{groupName}</h2>
                <SortableContext
                  items={groupedMenus[groupName].map(item => String(item.menuId || item.id))}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className={styles.menuList}>
                    {groupedMenus[groupName].map((item) => (
                      <SortableMenuItem
                        key={`menu-${item.menuId || item.id}`}
                        item={item}
                        selectedMenuId={selectedMenuId}
                        onMenuClick={handleMenuClick}
                        menuStatuses={menuStatuses}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </div>
            )
          ))
        ) : (
          <div>메뉴가 없습니다.</div>
        )}
      </div>
    </DndContext>
  );
}

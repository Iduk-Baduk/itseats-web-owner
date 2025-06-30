// groupMenus.js
export function getGroupNames(menus) {
  if (!menus || menus.length === 0) return [];
  const set = new Set();
  for (const item of menus) {
    set.add(item.menuGroupName || "기타");
  }

  return Array.from(set);
}

export const groupMenusByCategory = (menus) => {
  return menus.reduce((acc, item) => {
    const group = item.menuGroupName || "기타";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);
    return acc;
  }, {});
};

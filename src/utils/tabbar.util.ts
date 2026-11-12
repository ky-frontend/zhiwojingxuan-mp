export type TabBarItem = {
  icon: string;
  text: string;
  url: string;
};

export const TAB_BAR_ITEMS: TabBarItem[] = [
  {
    icon: 'https://cdn-public.knowyourself.cc/icon/wechat/20240124_jszx.png',
    text: '心理教练',
    url: '/subCounselling/pages/index/index',
  },
  {
    icon: 'https://cdn-public.knowyourself.cc/icon/wechat/20240124_wd.png',
    text: '我的',
    url: '/subCommon/pages/me/index',
  },
];

/** 底部 Tab 展示列表 */
export function getVisibleTabBarItems(): TabBarItem[] {
  return TAB_BAR_ITEMS;
}

/**
 * 各页面传入 Tab 的下标，直接映射为高亮下标
 */
export function getTabBarActiveIndex(logicalIndex: number): number {
  return logicalIndex;
}

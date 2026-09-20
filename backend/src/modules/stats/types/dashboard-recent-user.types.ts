/** Slim user row for owner home «Последние пользователи». */
export type DashboardRecentUser = {
  id: string;
  name: string;
  login: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

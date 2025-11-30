export interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  roles: string[];
  created_at: string;
  updated_at: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  is_active?: boolean;
}

export interface ListUsersParams {
  page?: number;
  per_page?: number;
  include_deleted?: boolean;
}

export interface AssignRoleRequest {
  role_id: string;
}


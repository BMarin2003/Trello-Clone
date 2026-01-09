export interface UserModel {
  id: string;
  name: string;
  avatar?: string;
  email: string;
}

export interface UserGroupModel {
  id: string;
  name: string;
  memberIds: string[];
  color: string;
}

export interface UserMenuProps {
  name: string;
  email: string;
  roleName: string;
  profileHref: string;
  onSignOut: () => void;
}

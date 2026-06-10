export interface WorkspaceUserPublic {
  _id:           string;
  firstName:     string;
  lastName:      string;
  email:         string;
  avatar?:       string;
  jobTitle?:     string;
  bio?:          string;
  status:        'active' | 'inactive' | 'pending' | 'suspended';
  workspaceRole: 'owner' | 'admin' | 'member' | 'guest';
  joinedAt?:     string;
}

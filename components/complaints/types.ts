export type ComplaintListItem = {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  aiStatus: string;
  aiCategory: string | null;
  aiPriority: string | null;
  createdAt: string;
  student: { name: string; studentId: string | null };
  room: { roomNumber: string; block: string } | null;
};

export type ComplaintFilters = {
  status?: string;
  category?: string;
  priority?: string;
  q?: string;
  page: number;
  pageSize: number;
};

export type ActiveRoomOption = { id: string; roomNumber: string; block: string } | null;

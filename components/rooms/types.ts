export type RoomTypeValue = "SINGLE" | "DOUBLE" | "TRIPLE" | "QUAD";
export type RoomStatusValue = "AVAILABLE" | "FULL" | "MAINTENANCE";

export type RoomListItem = {
  id: string;
  roomNumber: string;
  block: string;
  floor: number;
  type: RoomTypeValue;
  capacity: number;
  monthlyRent: number | null;
  status: RoomStatusValue;
  amenities: string[];
  notes: string | null;
  occupancy: number;
  availableBeds: number;
};

export type RoomOccupantItem = {
  id: string;
  allocationId: string;
  name: string;
  email: string;
  studentId: string | null;
  startDate: string;
};

export type RoomComplaintItem = {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  student: { name: string };
};

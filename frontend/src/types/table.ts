export interface TableResponse {
  id: number;
  name: string;
  capacity: number;
  active: boolean;
}

export interface TableRequest {
  name: string;
  capacity: number;
}

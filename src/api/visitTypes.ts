export type VisitRequest = {
  id: number;
  visitAtLocal: string;
  message: string;
  status: string;
  requestedBy: string;
  phone: string | null;
};

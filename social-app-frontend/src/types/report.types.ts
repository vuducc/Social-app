export type ReportStatus = "PENDING" | "RESOLVED" | "REJECTED";
export type ReportType = "POST" | "COMMENT" | "USER";

export interface Report {
  report_id: string;
  reporter_id: string;
  reported_id: string;
  type: ReportType;
  status: ReportStatus;
  content_id: string;
  reason: string;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface UpdateReportDto {
  status: ReportStatus;
  admin_note: string;
}

export interface CreateReportDto {
  type: "POST" | "COMMENT";
  content_id: string;
  reason: string;
}

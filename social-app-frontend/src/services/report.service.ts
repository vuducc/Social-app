import { axiosClient } from "./api";
import {
  CreateReportDto,
  Report,
  UpdateReportDto,
} from "../types/report.types";

class ReportService {
  async getReports(status: string, skip = 0, limit = 50): Promise<Report[]> {
    const response = await axiosClient.get("/reports/reports", {
      params: { status, skip, limit },
    });
    return response.data;
  }

  async updateReport(reportId: string, data: UpdateReportDto): Promise<Report> {
    const response = await axiosClient.put(
      `/reports/reports/${reportId}`,
      data
    );
    return response.data;
  }

  async createReport(data: CreateReportDto): Promise<Report> {
    const response = await axiosClient.post("/reports/reports", data);
    return response.data;
  }
}

export const reportService = new ReportService();

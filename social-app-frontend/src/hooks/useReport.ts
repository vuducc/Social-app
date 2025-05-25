import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportService } from "../services/report.service";
import { UpdateReportDto, CreateReportDto } from "../types/report.types";
import toast from "react-hot-toast";

export const useReports = (status: string) => {
  return useQuery({
    queryKey: ["reports", status],
    queryFn: () => reportService.getReports(status),
  });
};

export const useUpdateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
      data,
    }: {
      reportId: string;
      data: UpdateReportDto;
    }) => reportService.updateReport(reportId, data),
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success(
        `Báo cáo đã được ${
          data.status === "RESOLVED" ? "giải quyết" : "từ chối"
        }`
      );
    },
    onError: () => {
      toast.error("Không thể cập nhật báo cáo. Vui lòng thử lại!");
    },
  });
};

export const useCreateReport = () => {
  return useMutation({
    mutationFn: (data: CreateReportDto) => reportService.createReport(data),
    onSuccess: () => {
      toast.success("Báo cáo đã được gửi");
    },
    onError: () => {
      toast.error("Không thể gửi báo cáo. Vui lòng thử lại!");
    },
  });
};

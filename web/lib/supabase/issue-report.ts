import { supabase } from "./client";

export interface IssueReportData {
  user_id: string;
  user_email: string;
  issue_type: string;
  description: string;
  status?: string;
}

export const createIssueReport = async (report: IssueReportData) => {
  try {
    const { data, error } = await supabase
      .from("issue_reports")
      .insert([{
        user_id: report.user_id,
        user_email: report.user_email,
        issue_type: report.issue_type,
        description: report.description,
        status: report.status || "open",
      }])
      .select();

    if (error) {
      console.error("Error creating issue report:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error creating issue report:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
};

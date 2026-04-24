import { supabase } from "./client";

export interface FeedbackData {
  user_id: string;
  user_email: string;
  feedback_type: string;
  description: string;
  status?: string;
}

export const createFeedback = async (feedback: FeedbackData) => {
  try {
    const { data, error } = await supabase
      .from("user_feedback")
      .insert([{
        user_id: feedback.user_id,
        user_email: feedback.user_email,
        feedback_type: feedback.feedback_type,
        description: feedback.description,
        status: feedback.status || "open",
      }])
      .select();

    if (error) {
      console.error("Error creating feedback:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error creating feedback:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
};

import { supabase } from "@/lib/supabase/client";
import { SignUpData, SignUpResult } from "./types";

export const verifyEmail = async (
  email: string,
  otp: string,
): Promise<{ error: string | null }> => {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "email",
  });
  if (error) return { error: error.message };
  return { error: null };
};

export const resendVerification = async (
  email: string,
): Promise<{ error: string | null }> => {
  const { error } = await supabase.auth.resend({ email, type: "signup" });
  if (error) return { error: error.message };
  return { error: null };
};

export const resetPassword = async (
  email: string,
): Promise<{ error: string | null }> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) return { error: error.message };
  return { error: null };
};

export const updatePassword = async (
  newPassword: string,
): Promise<{ error: string | null }> => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return { error: null };
};

export const updateUserMeta = async (
  data: Record<string, string>,
): Promise<{ error: string | null }> => {
  const { error } = await supabase.auth.updateUser({ data });
  if (error) return { error: error.message };
  return { error: null };
};

export const signUp = async ({
  email,
  password,
  firstName,
  lastName,
  organisation,
  phone,
}: SignUpData): Promise<SignUpResult> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        organisation,
        phone,
      },
    },
  });

  if (error) return { error: error.message, needsVerification: false };

  const needsVerification =
    data.user?.identities?.length === 0 ? false : !data.session;
  return { error: null, needsVerification };
};

export const signIn = async (
  email: string,
  password: string,
): Promise<{ error: string | null }> => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };
  return { error: null };
};

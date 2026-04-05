import axiosInstance from "@/config/axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const registerUser = async ({ email, password, confirmPassword }) => {
  const response = await axiosInstance.post("/api/auth/register", {
    email,
    password,
    confirmPassword,
  });
  return response.data;
};

export const loginUser = async ({ email, password }) => {
  const response = await axiosInstance.post("/api/auth/login", {
    email,
    password,
  });
  return response.data;
};

export const logoutUser = async () => {
  const response = await axiosInstance.post("/api/auth/logout");
  return response.data;
};

export const getMe = async () => {
  const response = await axiosInstance.get("/api/auth/me");
  return response.data;
};

export const forgotPassword = async ({ email }) => {
  const response = await axiosInstance.post("/api/auth/forgot-password", {
    email,
  });
  return response.data;
};

export const verifyEmailOtp = async ({ email, otp }) => {
  const response = await axiosInstance.post("/api/auth/verify-otp", {
    email,
    otp,
  });
  return response.data;
};

export const resendOtp = async ({ email, type = "verification" }) => {
  const response = await axiosInstance.post("/api/auth/resend-otp", {
    email,
    type,
  });
  return response.data;
};

export const verifyResetOtp = async ({ email, otp }) => {
  const response = await axiosInstance.post("/api/auth/verify-reset-otp", {
    email,
    otp,
  });
  return response.data;
};

export const resetPassword = async ({ token, password }) => {
  const response = await axiosInstance.post("/api/auth/reset-password", {
    token,
    password,
  });
  return response.data;
};

export const refreshAccessToken = async ({ refreshToken }) => {
  const response = await axiosInstance.post("/api/auth/refresh", {
    refreshToken,
  });
  return response.data;
};

export const getGoogleAuthUrl = () =>
  API_BASE_URL ? `${API_BASE_URL}/api/auth/google` : "";

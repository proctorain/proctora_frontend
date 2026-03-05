import axiosInstance from "@/config/axios";

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

export const resetPassword = async ({ token, password }) => {
  const response = await axiosInstance.post(
    `/api/auth/reset-password?token=${encodeURIComponent(token)}`,
    { password },
  );
  return response.data;
};

export const refreshAccessToken = async ({ refreshToken }) => {
  const response = await axiosInstance.post("/api/auth/refresh", {
    refreshToken,
  });
  return response.data;
};

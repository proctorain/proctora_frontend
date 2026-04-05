import axiosInstance from "@/config/axios";

export const getMyProfile = async () => {
  const response = await axiosInstance.get("/api/profile/me");
  return response.data;
};

export const completeOnboarding = async ({ name, avatarFile }) => {
  const formData = new FormData();
  formData.append("name", name);

  if (avatarFile) {
    formData.append("avatar", avatarFile);
  }

  const response = await axiosInstance.post("/api/profile/onboarding", formData);

  return response.data;
};

export const updateProfileName = async ({ name }) => {
  const response = await axiosInstance.patch("/api/profile/name", { name });
  return response.data;
};

export const updateProfileAvatar = async ({ avatarFile }) => {
  const formData = new FormData();
  formData.append("avatar", avatarFile);

  const response = await axiosInstance.patch("/api/profile/avatar", formData);
  return response.data;
};

export const deleteProfileAvatar = async () => {
  const response = await axiosInstance.delete("/api/profile/avatar");
  return response.data;
};

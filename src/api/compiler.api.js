import axiosInstance from "@/config/axios";

export const getCompilerLanguages = async () => {
  const response = await axiosInstance.get("/api/compiler/languages");
  return response.data;
};

export const executeCompilerCode = async ({ language, code, stdin = "" }) => {
  const response = await axiosInstance.post("/api/compiler/execute", {
    language,
    code,
    stdin,
  });

  return response.data;
};

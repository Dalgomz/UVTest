import apiClient from "@/api/axiosClient";

interface Endpoints {
  getKpi: (polygon: Coords[]) => Promise<ResponseKPI>;
}

const endpoints: Endpoints = {
  getKpi: async (polygon: Coords[]): Promise<ResponseKPI> => {
    const response = await apiClient.post<ResponseKPI>(`/kpi`, polygon);
    return response.data;
  } 
};

export default endpoints;
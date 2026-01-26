import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://api.carbonmark.com",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
  },
  timeout: 20000,
});

export default axiosInstance;

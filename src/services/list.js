import axios from "axios";

export const getList = () =>
  axios.get("http://localhost:8080/list").then((res) => res.data);

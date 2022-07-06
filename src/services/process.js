import axios from "axios";

export const stopProcess = (pid) =>
  axios.post(`http://localhost:8080/stop/${pid}`).then((res) => res.data);

export const startProcess = (pid) =>
  axios.post(`http://localhost:8080/start/${pid}`).then((res) => res.data);

export const restartProcess = (pid) =>
  axios.post(`http://localhost:8080/restart/${pid}`).then((res) => res.data);

export const reloadProcess = (pid) =>
  axios.post(`http://localhost:8080/reload/${pid}`).then((res) => res.data);

export const deleteProcess = (pid) =>
  axios.post(`http://localhost:8080/delete/${pid}`).then((res) => res.data);

export const createProcess = (settings) =>
  axios.post(`http://localhost:8080/create`, settings).then((res) => res.data);

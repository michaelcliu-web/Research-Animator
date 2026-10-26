import axios from "axios";

// Backend endpoints, configured in .env (see .env.example).
export const API_URL = process.env.REACT_APP_API_URL;
export const WS_URL = process.env.REACT_APP_WS_URL;

// Uploaded PDFs, rendered videos and thumbnails are served from the backend
// root (e.g. /media/videos/...), not from under /api/.
const BACKEND_ORIGIN = API_URL?.replace("/api/", "") || "";

export const mediaUrl = (path) => BACKEND_ORIGIN + path;

/** Uploads a PDF and returns the new paper's id. */
export const uploadPaper = async (file, authToken) => {
  const formData = new FormData();
  formData.append("pdf_file", file);

  const response = await axios.post(API_URL + "papers/upload/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + authToken,
    },
  });
  return response.data.paper_id;
};

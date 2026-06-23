import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/auth")
    ) {
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (data: { email?: string; username?: string; password: string }) => {
  const response = await apiClient.post("/users/login", data);
  return response.data.data;
};

export const registerUser = async (formData: FormData) => {
  const response = await apiClient.post("/users/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

export const logoutUser = async () => {
  const response = await apiClient.post("/users/logout");
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get("/users/me");
  return response.data.data;
};


export interface VideoOwner {
  _id: string;
  username: string;
  fullName: string;
  avatar: string;
  coverImage?: string;
  subscribersCount?: number;
  isSubscribed?: boolean;
}

export interface Video {
  _id: string;
  title: string;
  description?: string;
  videoFile: string;
  thumbnail?: string;
  views: number;
  duration?: number;
  createdAt: string;
  likesCount?: number;
  isLiked?: boolean;
  owner: VideoOwner;
}

export interface PaginatedVideos {
  docs: Video[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const fetchVideos = async (page = 1, limit = 20, query?: string): Promise<PaginatedVideos> => {
  const response = await apiClient.get("/video", { params: { page, limit, query } });
  return response.data.data;
};

export const fetchVideoById = async (id: string): Promise<Video> => {
  const response = await apiClient.get(`/video/${id}`);
  return response.data.data;
};

export const uploadVideoFile = async (
  formData: FormData,
  onProgress?: (pct: number) => void
) => {
  const response = await apiClient.post("/video/video-upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });
  return response.data.data;
};

export const incrementViews = async (videoId: string) => {
  const response = await apiClient.patch(`/video/${videoId}/views`);
  return response.data.data;
};


export interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  ownerDetails: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
  likesCount: number;
  isLiked: boolean;
}

export const getComments = async (videoId: string, page = 1, limit = 20) => {
  const response = await apiClient.get(`/comments/${videoId}`, {
    params: { page, limit },
  });
  return response.data.data;
};

export const addComment = async (videoId: string, content: string): Promise<Comment> => {
  const response = await apiClient.post(`/comments/${videoId}`, { content });
  return response.data.data;
};

export const deleteComment = async (commentId: string) => {
  const response = await apiClient.delete(`/comments/c/${commentId}`);
  return response.data;
};

export const toggleCommentLike = async (commentId: string) => {
  const response = await apiClient.post(`/likes/toggle/c/${commentId}`);
  return response.data.data as { isLiked: boolean };
};


export const toggleVideoLike = async (videoId: string) => {
  const response = await apiClient.post(`/likes/toggle/v/${videoId}`);
  return response.data.data as { isLiked: boolean };
};

export const getLikedVideos = async (): Promise<Video[]> => {
  const response = await apiClient.get("/likes/videos");
  return response.data.data;
};


export const toggleSubscription = async (channelId: string) => {
  const response = await apiClient.post(`/subscriptions/c/${channelId}`);
  return response.data.data as { subscribed: boolean };
};

export const getSubscribedChannels = async (userId: string) => {
  const response = await apiClient.get(`/subscriptions/u/${userId}`);
  return response.data.data;
};


export const addToWatchHistory = async (videoId: string) => {
  const response = await apiClient.patch(`/users/history/${videoId}`);
  return response.data;
};

export const getWatchHistory = async (): Promise<Video[]> => {
  const response = await apiClient.get("/users/history");
  return response.data.data;
};

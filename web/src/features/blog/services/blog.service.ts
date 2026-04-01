import { api } from "@/lib/axios";
import { BlogPostData, BlogListResponse, CreateBlogRequest } from "../types/blog.types";

export const blogService = {
  list: async (page = 1, tag?: string): Promise<BlogListResponse> => {
    const params = new URLSearchParams({ page: String(page) });
    if (tag) params.set("tag", tag);
    const res = await api.get<BlogListResponse>(`/blog?${params}`);
    return res.data;
  },

  getById: async (id: string): Promise<BlogPostData> => {
    const res = await api.get<BlogPostData>(`/blog/${id}`);
    return res.data;
  },

  create: async (data: CreateBlogRequest): Promise<BlogPostData> => {
    const res = await api.post<BlogPostData>("/blog", data);
    return res.data;
  },

  update: async (id: string, data: Partial<CreateBlogRequest>): Promise<BlogPostData> => {
    const res = await api.put<BlogPostData>(`/blog/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/blog/${id}`);
  },

  toggleLike: async (id: string): Promise<{ likes: number; liked: boolean }> => {
    const res = await api.post(`/blog/${id}/like`);
    return res.data;
  },

  addComment: async (
    id: string,
    content: string
  ): Promise<BlogPostData> => {
    const res = await api.post(`/blog/${id}/comment`, { content });
    return res.data;
  },
};

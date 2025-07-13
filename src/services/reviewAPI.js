import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

const ReviewAPI = {
  getStoreReviews: async (storeId, startDate, endDate) => {
    try {
      const response = await apiClient.get(
        `/owner/${storeId}/reviews`,
        {
          params: {
            startDate: `${startDate}T00:00:00`,
            endDate: `${endDate}T23:59:59`
          }
        }
      );

      return response.data; // .data 안에 startDate, endDate, reviews[]
    } catch (error) {
      console.error('리뷰 조회 실패:', error);
      throw error;
    }
  },

  reportReview: async (storeId, reviewId, payload) => {
    try {
      const response = await apiClient.post(
        `/owner/${storeId}/reviews/${reviewId}/report`,
        payload
      );

      return response.data; // .data 안에 reporter, reviewId, reason, reportedAt, reportStatus
    } catch (error) {
      console.error('리뷰 신고 실패:', error);
      throw error;
    }
  }
};

export default ReviewAPI;

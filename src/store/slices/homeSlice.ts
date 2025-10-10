import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types for home page data
export interface Speaker {
  id: string;
  name: string;
  title: string;
  bio?: string;
  description?: string;
  image: string;
}

export interface Blog {
  id: string;
  title: string;
  description: string;
  image: string;
  createdAt?: string;
}

export interface Advertisement {
  id: string;
  image: string;
  title?: string;
  description?: string;
  url?: string;
}

export interface HomeState {
  featuredSpeakers: Speaker[];
  topSpeakers: Speaker[];
  recentBlogs: Blog[];
  advertisements: Advertisement[];
  isLoading: boolean;
  error: string | null;
}

const initialState: HomeState = {
  featuredSpeakers: [],
  topSpeakers: [],
  recentBlogs: [],
  advertisements: [],
  isLoading: false,
  error: null,
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setFeaturedSpeakers: (state, action: PayloadAction<Speaker[]>) => {
      state.featuredSpeakers = action.payload;
    },
    setTopSpeakers: (state, action: PayloadAction<Speaker[]>) => {
      state.topSpeakers = action.payload;
    },
    setRecentBlogs: (state, action: PayloadAction<Blog[]>) => {
      state.recentBlogs = action.payload;
    },
    setAdvertisements: (state, action: PayloadAction<Advertisement[]>) => {
      state.advertisements = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearHomeData: (state) => {
      state.featuredSpeakers = [];
      state.topSpeakers = [];
      state.recentBlogs = [];
      state.advertisements = [];
      state.error = null;
    },
  },
});

export const {
  setFeaturedSpeakers,
  setTopSpeakers,
  setRecentBlogs,
  setAdvertisements,
  setLoading,
  setError,
  clearHomeData,
} = homeSlice.actions;

export default homeSlice.reducer;


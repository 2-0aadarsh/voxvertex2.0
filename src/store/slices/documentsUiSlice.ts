// ============================================================================
// DOCUMENTS UI SLICE - Local UI state (filters, selection)
// ============================================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DocumentsUiState {
  tab: 'outgoing' | 'incoming';
  search: string;
  tag: string | null;
  page: number;
  limit: number;
}

const initialState: DocumentsUiState = {
  tab: 'outgoing',
  search: '',
  tag: null,
  page: 1,
  limit: 10,
};

const documentsUiSlice = createSlice({
  name: 'documentsUi',
  initialState,
  reducers: {
    setTab(state, action: PayloadAction<DocumentsUiState['tab']>) {
      state.tab = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setTag(state, action: PayloadAction<string | null>) {
      state.tag = action.payload;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
    },
    resetDocumentsUi: () => initialState,
  },
});

export const { setTab, setSearch, setTag, setPage, setLimit, resetDocumentsUi } = documentsUiSlice.actions;
export default documentsUiSlice.reducer;



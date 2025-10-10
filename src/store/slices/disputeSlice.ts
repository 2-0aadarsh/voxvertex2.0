import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Event {
  _id: string;
  topic: string;
  eventDate: string;
}

interface EventsState {
  events: Event[];
  loading: boolean;
  error: string | null;
  selectedEventId: string | null;
  selectedEventName: string | null;
  selectedEventDate: string | null;
}

const initialState: EventsState = {
  events: [],
  loading: false,
  error: null,
  selectedEventId: null,
  selectedEventName: null,
  selectedEventDate: null,
};

// Async thunk to fetch events
export const fetchEvents = createAsyncThunk('events/fetchEvents', async () => {
  const res = await fetch('https://voxvertex20-production.up.railway.app/api/events');
  const data = await res.json();
  // Combine upcoming and past events
  return [...(data.data.upcoming || []), ...(data.data.past || [])] as Event[];
});

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    selectEvent(state, action: PayloadAction<{ id: string; name: string; date: string }>) {
      state.selectedEventId = action.payload.id;
      state.selectedEventName = action.payload.name;
      state.selectedEventDate = action.payload.date;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchEvents.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchEvents.fulfilled, (state, action) => {
      state.loading = false;
      state.events = action.payload;
    });
    builder.addCase(fetchEvents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch events';
    });
  },
});

export const { selectEvent } = eventsSlice.actions;
export default eventsSlice.reducer;

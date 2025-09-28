# Speakers Page - Optimized Data Fetching Implementation

## Overview

This implementation provides a high-performance, scalable solution for fetching and displaying speakers data with the following key features:

- **Fast Initial Load**: Page loads instantly without blocking API calls
- **Smart Data Fetching**: Only fetches data when needed
- **Efficient Caching**: RTK Query handles intelligent caching
- **Progressive Enhancement**: Basic page → Enhanced with data
- **Scalable Architecture**: Easy to extend with new features

## Architecture

### 1. Store Structure

```
src/store/
├── slices/
│   └── speakersSlice.ts          # Speaker state management
├── types/
│   └── index.ts                 # Speaker type definitions
├── api/
│   └── baseApi.ts              # Base API configuration
└── index.ts                    # Store configuration
```

### 2. Data Flow

```
User navigates to /speakers
    ↓
Page loads instantly (0ms)
    ↓
Component mounts → Triggers data fetch
    ↓
API call (200-500ms)
    ↓
Data arrives → UI updates
```

## Performance Optimizations

### 1. Lazy Loading Strategy

```typescript
// Only fetch when component mounts
const { data, isLoading } = useGetSpeakersQuery(
  { page: 1, limit: 12 },
  { skip: !hasMounted } // Don't fetch until mounted
);
```

### 2. Smart Caching

```typescript
// Cache for 5 minutes
keepUnusedDataFor: 300,

// Cache event types for 1 hour (they don't change often)
keepUnusedDataFor: 3600,
```

### 3. Conditional Queries

```typescript
// Basic speakers (no filters)
const basicQuery = useGetSpeakersQuery(params, { skip: hasActiveFilters });

// Filtered speakers (with filters)
const filteredQuery = useSearchSpeakersQuery(params, { skip: !hasActiveFilters });
```

### 4. Debounced Search

```typescript
// Debounce search queries to avoid excessive API calls
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearchQuery(searchQuery);
  }, 300);
  return () => clearTimeout(timer);
}, [searchQuery]);
```

## API Endpoints

### 1. Basic Speaker List
```typescript
GET /speaker-search/filter?page=1&limit=12
```

### 2. Search with Filters
```typescript
GET /speaker-search/filter?q=AI&location=San Francisco&expertise=Technology
```

### 3. Autocomplete Suggestions
```typescript
GET /speaker-search/suggestions?q=AI&limit=5
```

### 4. Available Event Types
```typescript
GET /speaker-search/event-types
```

## Usage Examples

### 1. Basic Implementation

```typescript
import { useGetSpeakersQuery } from '@/store/slices/speakersSlice';

const SpeakersPage = () => {
  const { data, isLoading, error } = useGetSpeakersQuery(
    { page: 1, limit: 12 }
  );
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;
  
  return <SpeakerGrid speakers={data?.data?.speakers} />;
};
```

### 2. With Filters

```typescript
import { useSearchSpeakersQuery } from '@/store/slices/speakersSlice';

const FilteredSpeakers = () => {
  const { data } = useSearchSpeakersQuery({
    q: 'AI',
    location: 'San Francisco',
    expertise: ['Technology'],
    yearsOfExperience: 5,
    availabilityDate: '2024-01-15',
    eventTypes: ['Corporate & Professional Events'],
    minFee: 1000,
    maxFee: 5000,
  });
  
  return <SpeakerGrid speakers={data?.data?.speakers} />;
};
```

### 3. Autocomplete Search

```typescript
import { useGetSpeakerSuggestionsQuery } from '@/store/slices/speakersSlice';

const SearchInput = ({ query }) => {
  const { data: suggestions } = useGetSpeakerSuggestionsQuery(
    { q: query, limit: 5 },
    { skip: query.length < 2 }
  );
  
  return (
    <div>
      <input type="text" />
      {suggestions?.data?.map(speaker => (
        <div key={speaker._id}>{speaker.fullName}</div>
      ))}
    </div>
  );
};
```

## Performance Metrics

### Expected Performance

- **Initial Page Load**: <100ms (no API calls)
- **First Data Load**: 200-500ms (first API call)
- **Subsequent Loads**: <100ms (cached)
- **Search Results**: 300-800ms (depending on query complexity)
- **Filter Changes**: 200-600ms (cached when possible)

### Caching Strategy

- **Basic Speakers**: 5 minutes
- **Search Results**: 5 minutes
- **Suggestions**: 1 minute
- **Event Types**: 1 hour
- **Individual Speakers**: 10 minutes

## Error Handling

### 1. Network Errors
```typescript
if (error) {
  return (
    <div className="error-state">
      <h3>Error loading speakers</h3>
      <p>{error.message}</p>
      <button onClick={() => refetch()}>Try Again</button>
    </div>
  );
}
```

### 2. Empty States
```typescript
if (speakers.length === 0) {
  return (
    <div className="empty-state">
      <h3>No speakers found</h3>
      <p>Try adjusting your search criteria</p>
      <button onClick={clearFilters}>Clear Filters</button>
    </div>
  );
}
```

## Future Enhancements

### 1. Infinite Scroll
```typescript
const { data, fetchMore } = useGetSpeakersQuery({ page: 1, limit: 12 });

const loadMore = () => {
  fetchMore({ page: currentPage + 1 });
};
```

### 2. Background Prefetching
```typescript
// Prefetch next page while user browses
useEffect(() => {
  if (currentPage < totalPages) {
    prefetch({ page: currentPage + 1 });
  }
}, [currentPage, totalPages]);
```

### 3. Offline Support
```typescript
// Cache speakers for offline viewing
const { data } = useGetSpeakersQuery(params, {
  keepUnusedDataFor: 3600, // 1 hour
});
```

## Best Practices

### 1. Always Use Conditional Queries
```typescript
// ✅ Good - Only fetch when needed
const { data } = useGetSpeakersQuery(params, { skip: !shouldFetch });

// ❌ Bad - Always fetches
const { data } = useGetSpeakersQuery(params);
```

### 2. Implement Proper Loading States
```typescript
// ✅ Good - Show loading for initial load
if (isLoading && speakers.length === 0) {
  return <LoadingSpinner />;
}

// ✅ Good - Show loading for additional data
if (isLoading && speakers.length > 0) {
  return <LoadingMoreSpinner />;
}
```

### 3. Handle Errors Gracefully
```typescript
// ✅ Good - Show error with retry option
if (error) {
  return <ErrorMessage onRetry={() => refetch()} />;
}
```

### 4. Use Memoization for Expensive Operations
```typescript
// ✅ Good - Memoize sorted speakers
const sortedSpeakers = useMemo(() => {
  return speakers.sort((a, b) => a.price - b.price);
}, [speakers, sortBy]);
```

## Troubleshooting

### Common Issues

1. **Slow Initial Load**
   - Check if you're fetching data on page mount
   - Ensure you're using conditional queries

2. **Stale Data**
   - Check cache invalidation tags
   - Verify `keepUnusedDataFor` settings

3. **Memory Leaks**
   - Ensure proper cleanup in useEffect
   - Use `skip` parameter for conditional queries

4. **Network Errors**
   - Check API endpoint URLs
   - Verify authentication headers
   - Check network connectivity

### Debug Tools

```typescript
// Enable Redux DevTools
if (process.env.NODE_ENV === 'development') {
  // Log store state changes
  store.subscribe(() => {
    console.log('Store updated:', store.getState());
  });
}
```

## Conclusion

This implementation provides a robust, performant solution for speaker data management that:

- ✅ Loads pages instantly
- ✅ Fetches data efficiently
- ✅ Caches intelligently
- ✅ Handles errors gracefully
- ✅ Scales with your application

The key is to never block the initial page render with API calls, and instead fetch data progressively as the user interacts with the page.

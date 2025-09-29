import { useState, useCallback, useEffect } from "react";
/**
 * SearchPage
 *
 * Purpose
 * - Provide a powerful search interface across all data types using API client
 * - Allow filtering by data type and navigation to relevant results
 *
 * Concepts
 * - Local state manages search query and type filters
 * - Custom hook handles search functionality and state management
 * - API-level search for better performance and consistency
 * - Proper loading states and error handling
 */
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import SearchBar, { SearchType } from "../../components/Search/SearchBar";
import SearchResults from "../../components/Search/SearchResults";
import { SearchResult } from "../../types/domain";
import { useSearch } from "../../lib/hooks/useSearch";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import "./SearchPage.css";

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Use search hook for API-based search functionality
  const { 
    searchResults, 
    loading, 
    error, 
    performSearch, 
    clearResults 
  } = useSearch();

  // Search types configuration
  const searchTypes: SearchType[] = [
    { id: 'manager', label: 'Managers', color: 'primary' },
    { id: 'event', label: 'Events', color: 'secondary' },
    { id: 'note', label: 'Notes', color: 'success' },
    { id: 'document', label: 'Documents', color: 'warning' }
  ];

  // Handle search with API call
  const handleSearch = useCallback(async (searchQuery: string, types: string[]) => {
    setQuery(searchQuery);
    setSelectedTypes(types);
    
    // Perform API search
    await performSearch({
      q: searchQuery,
      types: types.length > 0 ? types.join(',') : undefined,
      page: 1,
      pageSize: 25
    });
  }, [performSearch]);

  // Auto-search when query or types change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        performSearch({
          q: query,
          types: selectedTypes.length > 0 ? selectedTypes.join(',') : undefined,
          page: 1,
          pageSize: 25
        });
      } else {
        clearResults();
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, selectedTypes, performSearch, clearResults]);

  const handleResultClick = useCallback((result: SearchResult) => {
    switch (result.type) {
      case 'manager':
        // Extract the original manager ID by removing the prefix
        const managerId = result.id.replace('manager-', '');
        navigate(`/managers/${managerId}`);
        break;
      case 'event':
        // Navigate to manager detail page (events are shown there)
        // The metadata should contain the manager ID
        if (result.metadata?.manager) {
          // Find manager by name (this is a limitation of current API design)
          // In a real implementation, the search result should include manager ID
          console.log('Navigate to manager for event:', result.metadata.manager);
        }
        break;
      case 'note':
        // Navigate to manager detail page (notes are shown there)
        if (result.metadata?.manager) {
          console.log('Navigate to manager for note:', result.metadata.manager);
        }
        break;
      case 'document':
        // Placeholder - would navigate to document view
        console.log('Navigate to document:', result.id);
        break;
    }
  }, [navigate]);

  return (
    <Box className="search-page">
      <Typography variant="h4" gutterBottom>
        Search
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Search across managers, events, meeting notes, and documents to quickly find the information you need.
      </Typography>

      <SearchBar
        query={query}
        onQueryChange={setQuery}
        types={searchTypes}
        selectedTypes={selectedTypes}
        onTypesChange={setSelectedTypes}
        onSearch={handleSearch}
        placeholder="Search managers, events, notes, or documents..."
        loading={loading}
        showFilters={true}
      />

      {/* Show error state */}
      {error && (
        <Box sx={{ mt: 3 }}>
          <ErrorAlert
            title="Search failed"
            message={error}
            onRetry={() => {
              if (query.trim()) {
                performSearch({
                  q: query,
                  types: selectedTypes.length > 0 ? selectedTypes.join(',') : undefined,
                  page: 1,
                  pageSize: 25
                });
              }
            }}
          />
        </Box>
      )}

      {/* Show loading state */}
      {loading && (
        <Box sx={{ mt: 3 }}>
          <LoadingSpinner message="Searching..." />
        </Box>
      )}

      {/* Show search results */}
      {!loading && !error && (
        <Box sx={{ mt: 3 }}>
          <SearchResults
            results={searchResults}
            loading={loading}
            query={query}
            selectedTypes={selectedTypes}
            onResultClick={handleResultClick}
          />
        </Box>
      )}
    </Box>
  );
}

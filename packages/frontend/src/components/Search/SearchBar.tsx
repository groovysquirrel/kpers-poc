import { useState } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Chip,
  Paper,
  Typography,
  IconButton,
  CircularProgress
} from "@mui/material";
import { 
  Search as SearchIcon, 
  Clear as ClearIcon,
  FilterList as FilterIcon 
} from "@mui/icons-material";
import "./SearchBar.css";

export interface SearchType {
  id: string;
  label: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'default';
}

export interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  types: SearchType[];
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
  onSearch: (query: string, types: string[]) => void;
  placeholder?: string;
  loading?: boolean;
  showFilters?: boolean;
  className?: string;
}

export default function SearchBar({
  query,
  onQueryChange,
  types,
  selectedTypes,
  onTypesChange,
  onSearch,
  placeholder = "Search...",
  loading = false,
  showFilters = true,
  className = ""
}: SearchBarProps) {
  const [showTypeFilters, setShowTypeFilters] = useState(false);

  // Handle search on Enter key
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    onSearch(query, selectedTypes);
  };

  const handleClear = () => {
    onQueryChange("");
    onTypesChange([]);
    onSearch("", []);
  };

  const handleTypeToggle = (typeId: string) => {
    const newTypes = selectedTypes.includes(typeId)
      ? selectedTypes.filter(id => id !== typeId)
      : [...selectedTypes, typeId];
    onTypesChange(newTypes);
  };

  const hasActiveFilters = query.trim() !== "" || selectedTypes.length > 0;

  return (
    <Box className={`search-bar ${className}`}>
      <Paper elevation={1} sx={{ p: 2 }}>
        {/* Search Input */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: showFilters ? 2 : 0 }}>
          <TextField
            fullWidth
            placeholder={placeholder}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {loading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <SearchIcon />
                  )}
                </InputAdornment>
              ),
              endAdornment: hasActiveFilters && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleClear}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            disabled={loading}
          />
          
          <IconButton
            onClick={handleSearch}
            disabled={loading}
            sx={{ 
              minWidth: 48,
              height: 48,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              }
            }}
          >
            <SearchIcon />
          </IconButton>
        </Box>

        {/* Type Filters */}
        {showFilters && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <FilterIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Filter by type:
              </Typography>
              <IconButton
                size="small"
                onClick={() => setShowTypeFilters(!showTypeFilters)}
                sx={{ ml: 'auto' }}
              >
                <FilterIcon fontSize="small" />
              </IconButton>
            </Box>
            
            {showTypeFilters && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {types.map((type) => (
                  <Chip
                    key={type.id}
                    label={type.label}
                    color={selectedTypes.includes(type.id) ? (type.color || 'primary') : 'default'}
                    variant={selectedTypes.includes(type.id) ? 'filled' : 'outlined'}
                    onClick={() => handleTypeToggle(type.id)}
                    size="small"
                  />
                ))}
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Pagination,
  CircularProgress,
  Alert
} from "@mui/material";
import {
  Person as PersonIcon,
  Event as EventIcon,
  Description as DocumentIcon,
  Note as NoteIcon
} from "@mui/icons-material";
import { SearchResult } from "../../types/domain";
import "./SearchResults.css";

export interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  query: string;
  selectedTypes: string[];
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

export default function SearchResults({
  results,
  loading,
  query,
  selectedTypes,
  onResultClick,
  className = ""
}: SearchResultsProps) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'manager':
        return <PersonIcon />;
      case 'event':
        return <EventIcon />;
      case 'note':
        return <NoteIcon />;
      case 'document':
        return <DocumentIcon />;
      default:
        return <DescriptionIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manager':
        return 'primary';
      case 'event':
        return 'secondary';
      case 'note':
        return 'success';
      case 'document':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatSnippet = (snippet?: string, maxLength: number = 150) => {
    if (!snippet) return '';
    if (snippet.length <= maxLength) return snippet;
    return snippet.substring(0, maxLength) + '...';
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const paginatedResults = results.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(results.length / itemsPerPage);

  if (loading) {
    return (
      <Box className={`search-results ${className}`}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Searching...
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (!query.trim() && selectedTypes.length === 0) {
    return (
      <Box className={`search-results ${className}`}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Enter a search term to find managers, events, notes, and documents
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Use the filters above to narrow your search by type
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (results.length === 0) {
    return (
      <Box className={`search-results ${className}`}>
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>
            No results found
          </Typography>
          <Typography variant="body2">
            Try adjusting your search terms or filters. You can search for:
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            <li>Manager names or companies</li>
            <li>Event comments or staff names</li>
            <li>Meeting notes content</li>
            <li>Document titles</li>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box className={`search-results ${className}`}>
      {/* Results Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Search Results
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          {selectedTypes.length > 0 && ` in ${selectedTypes.join(', ')}`}
        </Typography>
      </Box>

      {/* Results List */}
      <Paper>
        <List>
          {paginatedResults.map((result, index) => (
            <Box key={result.id}>
              <ListItem
                onClick={() => onResultClick?.(result)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <ListItemIcon>
                  {getResultIcon(result.type)}
                </ListItemIcon>
                <ListItemText
                  disableTypography
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">{result.title}</Typography>
                      <Chip
                        label={result.type}
                        color={getTypeColor(result.type) as any}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      {result.snippet && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
                          {formatSnippet(result.snippet)}
                        </Typography>
                      )}
                      {result.metadata && (
                        <Box sx={{ mt: 1 }}>
                          {Object.entries(result.metadata).map(([key, value]) => (
                            <Chip
                              key={key}
                              label={`${key}: ${value}`}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < paginatedResults.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Paper>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  );
}

/**
 * LoadingSpinner Component
 * 
 * Purpose: Reusable loading indicator
 * - Consistent loading UI across the application
 * - Configurable size and message
 * - Accessible loading states
 */

import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  fullHeight?: boolean;
}

export default function LoadingSpinner({ 
  message = 'Loading...', 
  size = 40,
  fullHeight = false 
}: LoadingSpinnerProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 4,
        ...(fullHeight && { minHeight: '50vh' })
      }}
    >
      <CircularProgress size={size} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}


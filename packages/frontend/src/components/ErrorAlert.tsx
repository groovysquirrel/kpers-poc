/**
 * ErrorAlert Component
 * 
 * Purpose: Reusable error display component
 * - Consistent error UI across the application
 * - Configurable error messages and actions
 * - Accessible error states
 */

import { Alert, AlertTitle, Button } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  severity?: 'error' | 'warning' | 'info';
}

export default function ErrorAlert({ 
  title = 'Error',
  message,
  onRetry,
  retryLabel = 'Try Again',
  severity = 'error'
}: ErrorAlertProps) {
  return (
    <Alert 
      severity={severity}
      action={
        onRetry && (
          <Button
            color="inherit"
            size="small"
            onClick={onRetry}
            startIcon={<RefreshIcon />}
          >
            {retryLabel}
          </Button>
        )
      }
    >
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
}



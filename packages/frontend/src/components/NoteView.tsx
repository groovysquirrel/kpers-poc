import { useMemo } from "react";
/**
 * NoteView Component
 *
 * Purpose: Display a note in read-only format
 * - Shows all note details including associations and metadata
 * - Provides a clean, organized view of note information
 * - No editing capabilities - purely for viewing
 *
 * Usage: <NoteView note={note} managers={managers} staff={staff} noteTypes={noteTypes} />
 */
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Avatar,
  Stack
} from "@mui/material";
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import { Note, Manager, StaffMember, NoteType } from "../types/domain";

interface NoteViewProps {
  open: boolean;
  note: Note | null;
  managers: Manager[];
  staff: StaffMember[];
  noteTypes: NoteType[];
  onClose: () => void;
  onEdit?: (note: Note) => void;
}

export default function NoteView({
  open,
  note,
  managers,
  staff,
  noteTypes,
  onClose,
  onEdit
}: NoteViewProps) {
  // Build lookup maps for O(1) access
  const managerLookup = useMemo(() => {
    const lookup: Record<string, Manager> = {};
    managers.forEach(manager => {
      lookup[manager.id] = manager;
    });
    return lookup;
  }, [managers]);

  const staffLookup = useMemo(() => {
    const lookup: Record<string, StaffMember> = {};
    staff.forEach(staffMember => {
      lookup[staffMember.id] = staffMember;
    });
    return lookup;
  }, [staff]);

  const noteTypeLookup = useMemo(() => {
    const lookup: Record<string, NoteType> = {};
    noteTypes.forEach(noteType => {
      lookup[noteType.id] = noteType;
    });
    return lookup;
  }, [noteTypes]);

  if (!note) return null;

  const noteType = noteTypeLookup[note.type];
  const manager = note.managerId ? managerLookup[note.managerId] : null;
  const staffMember = note.staffId ? staffLookup[note.staffId] : null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DescriptionIcon color="primary" />
          <Typography variant="h5" component="div">
            {note.title}
          </Typography>
          {noteType && (
            <Chip
              label={noteType.name}
              color="primary"
              variant="outlined"
              size="small"
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={3}>
          {/* Note Content */}
          <Box>
            <Typography variant="body1" sx={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              fontSize: '1rem',
              color: 'text.primary'
            }}>
              {note.content}
            </Typography>
          </Box>

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {note.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Divider />

          {/* Associations */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Associations
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Manager Association */}
              {manager && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                    <BusinessIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Associated Manager
                    </Typography>
                    <Typography variant="body2">
                      {manager.firstName} {manager.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {manager.company}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Staff Association */}
              {staffMember && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Associated Staff
                    </Typography>
                    <Typography variant="body2">
                      {staffMember.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {staffMember.role}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Event Association (placeholder for future implementation) */}
              {note.eventId && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                    <EventIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Associated Event
                    </Typography>
                    <Typography variant="body2">
                      Event ID: {note.eventId}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Document Association (placeholder for future implementation) */}
              {note.documentId && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}>
                    <DescriptionIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Associated Document
                    </Typography>
                    <Typography variant="body2">
                      Document ID: {note.documentId}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          <Divider />

          {/* Metadata */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon color="action" fontSize="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(note.createdAt)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EditIcon color="action" fontSize="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(note.updatedAt)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="action" fontSize="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created By
                  </Typography>
                  <Typography variant="body2">
                    User ID: {note.createdBy}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          startIcon={<CloseIcon />}
        >
          Close
        </Button>
        {onEdit && (
          <Button
            variant="contained"
            onClick={() => onEdit(note)}
            startIcon={<EditIcon />}
          >
            Edit Note
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

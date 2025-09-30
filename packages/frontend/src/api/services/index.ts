/**
 * API Services Index
 * 
 * Purpose: Central export point for all API services
 * - Makes it easy to import services throughout the app
 * - Establishes a clear pattern for organizing services
 * 
 * Usage: import { managersService, eventsService } from '@/api/services'
 */

export { managersService } from './managers';
export { eventsService } from './events';
export { eventTypesService } from './event-types';

// TODO: Export other services as they are implemented
// export { notesService } from './notes';
// export { documentsService } from './documents';


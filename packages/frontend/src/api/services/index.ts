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
export { documentsService } from './documents';
export { documentTypesService } from './document-types';
export { notesService } from './notes';
export { noteTypesService } from './note-types';
export { staffService } from './staff';
export { performanceMetricsService } from './performance-metrics';


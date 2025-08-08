# Replit.md

## Overview

TaskSync Manager is a comprehensive webhook-based task management dashboard built with a full-stack TypeScript architecture. The application receives task updates via webhooks from external project management systems, processes and stores them in a PostgreSQL database, and provides a rich web interface for monitoring, managing, and analyzing tasks. It features real-time health monitoring, email notifications, external service synchronization, and detailed logging capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.
Email configuration: Gmail SMTP configured with mhc638417@gmail.com for automatic task completion notifications.
Database: PostgreSQL (originally requested MongoDB but implemented with PostgreSQL for better integration).
Language: User communicates in Spanish but project developed in English.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS styling
- **Routing**: Wouter for client-side routing with a sidebar navigation layout
- **State Management**: TanStack Query (React Query) for server state management and API caching
- **Styling**: Tailwind CSS with a custom design system featuring Inter font family and neutral color scheme

### Backend Architecture
- **Framework**: Express.js with TypeScript for RESTful API endpoints
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Validation**: Zod schemas for request/response validation
- **Development**: Vite middleware integration for hot module replacement in development

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database with the following schema:
  - Users table for authentication
  - Tasks table for webhook-received task data with status tracking
  - Webhooks table for endpoint management and statistics
  - WebhookLogs table for audit trails and debugging
  - EmailTemplates table for notification management
  - Notifications table for email delivery tracking
- **ORM**: Drizzle with automatic migrations and type-safe queries
- **Connection**: Connection pooling via @neondatabase/serverless driver

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session storage via connect-pg-simple
- **User Management**: Username/password authentication with encrypted password storage
- **Authorization**: Role-based access control for webhook endpoints and admin functions

### Core Services Architecture

#### Webhook Processing Service
- **Endpoint Management**: Dynamic webhook endpoint creation and configuration
- **Payload Validation**: Zod schema validation for incoming webhook data
- **Task Processing**: Automatic task creation, updating, and status management
- **Error Handling**: Comprehensive error logging with retry mechanisms
- **Performance Tracking**: Response time monitoring and success rate calculation

#### Email Service
- **Provider**: Nodemailer with SMTP configuration (Gmail support)
- **Template System**: Dynamic email templates with variable substitution
- **Notification Types**: Task completion, status changes, and system alerts
- **Delivery Tracking**: Email delivery status monitoring and retry logic

#### Sync Service
- **External Integration**: Bidirectional synchronization with external project management systems
- **API Client**: Axios-based HTTP client with retry logic and timeout handling
- **Conflict Resolution**: Automatic conflict detection and resolution for task updates
- **Rate Limiting**: Configurable rate limiting for external API calls

#### Logging Service
- **Structured Logging**: JSON-formatted logs with timestamp and severity levels
- **File Rotation**: Automatic log file rotation based on size and age
- **Error Tracking**: Centralized error logging with stack trace capture
- **Performance Metrics**: Response time and throughput monitoring

### Health Monitoring System
- **Database Health**: Connection status and query performance monitoring
- **Service Health**: SMTP server connectivity and external API availability
- **System Metrics**: Memory usage, CPU utilization, and disk space monitoring
- **Real-time Updates**: 30-second refresh intervals for health status dashboard

### API Architecture
- **RESTful Design**: Standard HTTP methods with consistent response formats
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Request Logging**: Comprehensive request/response logging for debugging
- **Rate Limiting**: Configurable rate limiting to prevent abuse
- **CORS Support**: Cross-origin resource sharing for frontend integration

## External Dependencies

### Core Infrastructure
- **Database**: Neon Database (serverless PostgreSQL) for data persistence
- **Email Service**: SMTP servers (Gmail, SendGrid, etc.) for notification delivery
- **External APIs**: Third-party project management systems for task synchronization

### Development Tools
- **Build System**: Vite for fast development and optimized production builds
- **Type Checking**: TypeScript compiler for static type checking
- **Code Quality**: ESLint and Prettier for code formatting and linting
- **Package Management**: npm with lockfile for dependency management

### Runtime Dependencies
- **Database ORM**: Drizzle with PostgreSQL adapter for type-safe database operations
- **HTTP Client**: Axios for external API communications with retry logic
- **Validation**: Zod for runtime type checking and schema validation
- **Session Storage**: connect-pg-simple for PostgreSQL-backed session management
- **Email Transport**: Nodemailer for SMTP email delivery

### UI Dependencies
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **Styling**: Tailwind CSS for utility-first styling approach
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date manipulation and formatting
- **Form Management**: React Hook Form with Zod resolvers for form validation

### Monitoring and Observability
- **Error Tracking**: Custom logging service with file-based storage
- **Performance Monitoring**: Built-in response time tracking and metrics collection
- **Health Checks**: Automated service health monitoring with status reporting
- **Audit Trails**: Comprehensive webhook and email delivery logging
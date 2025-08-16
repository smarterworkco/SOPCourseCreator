# SOPify - AI-Powered Learning Management System

## Overview

SOPify is a modern micro-learning platform that transforms Standard Operating Procedures (SOPs) into interactive, mobile-first courses. The application uses AI to automatically generate structured learning modules with assessments from uploaded SOP content. Built as a full-stack TypeScript application with React frontend and Express backend, it serves both administrators who create courses and learners who consume them.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite for development and building
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **Authentication**: Context-based auth system with session management
- **UI Components**: Radix UI primitives with custom styling through shadcn/ui

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with role-based access control
- **Session Management**: Express sessions with role-based middleware
- **File Structure**: Modular organization with separate routes, services, and storage layers

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Well-structured tables for users, organizations, courses, modules, questions, enrollments, and attempts
- **Connection**: Neon Database serverless PostgreSQL for cloud hosting
- **Migrations**: Drizzle Kit for database schema management and migrations

### Authentication and Authorization
- **Session-based Authentication**: Express sessions with secure cookie configuration
- **Role-based Access Control**: Multi-role system (admin, owner, learner) with middleware guards
- **Organization Isolation**: Multi-tenant architecture where users belong to organizations
- **Route Protection**: Middleware-based authentication and authorization checks

## External Dependencies

### AI Services
- **OpenAI GPT-4**: Course generation from SOP content, module creation, and quiz generation
- **Model**: Uses GPT-4o for high-quality content generation and educational material creation

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting for production deployments
- **Drizzle ORM**: Type-safe database client with schema validation using Zod

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component library with Tailwind integration

### Development and Build Tools
- **Vite**: Fast development server and optimized production builds
- **TypeScript**: Static type checking across the entire application
- **ESBuild**: Fast bundling for server-side code in production
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

### Runtime Dependencies
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form handling with validation using Zod schemas
- **Date-fns**: Date manipulation and formatting utilities
- **Wouter**: Lightweight routing solution for React applications
# CLAUDE.md

# Lendsqr Frontend Assessment

## Project Overview

This repository contains my submission for the Lendsqr Frontend Engineer Assessment.

The objective is not simply to reproduce the Figma designs, but to build a production-quality frontend application demonstrating sound software engineering principles, maintainability, scalability, accessibility, performance, and attention to detail.

Every architectural decision should optimize for:

- readability
- maintainability
- scalability
- developer experience
- user experience

The implementation should resemble code that could reasonably be deployed into production.

This project will later be extended during a live coding interview, therefore all code must be easy to understand and modify.

---

# Core Principles

When making implementation decisions always prioritize, in order:

1. Correctness
2. Readability
3. Simplicity
4. Reusability
5. Performance

Never introduce abstractions unless they solve a real problem.

Prefer explicit code over clever code.

Every function should be understandable within seconds.

Every component should have one responsibility.

---

# Tech Stack

Required

- React
- TypeScript
- SCSS

Chosen

- Vite
- React Router
- Axios
- TanStack Query
- TanStack Table
- React Hook Form
- Zod
- Lucide Icons
- moment
- clsx
- Faker

Testing

- Vitest
- React Testing Library
- Jest DOM
- User Event

---

# Project Goals

The application must include

- Login
- Dashboard
- Users
- User Details

Users are loaded from a mock API containing approximately 500 records.

Selected user information should persist using Local Storage.

Application must be responsive.

Application must gracefully handle

- loading
- empty
- error

states.

---

# Folder Structure

Use the following structure.

src/

    api/

    assets/

    components/

    config/

    hooks/

    layouts/

    pages/

    routes/

    services/

    styles/

    types/

    utils/

Each feature should remain isolated whenever practical.

Avoid dumping everything into components/.

---

# Component Architecture

Components should be divided into

## UI Components

Reusable presentation components.

Examples

Button

Card

Badge

Avatar

Input

Dropdown

Tabs

Skeleton

Spinner

Pagination

EmptyState

ErrorState

These should contain little or no business logic.

---

## Feature Components

Components tied to a feature.

Examples

UsersTable

UserFilters

DashboardCards

UserProfileCard

UserInfoSection

These may consume hooks and services.

---

## Page Components

Responsible only for page composition.

Avoid placing business logic directly inside page files.

---

# Layout Architecture

There should be two layouts.

AuthLayout

Login only.

AppLayout

Dashboard

Users

User Details

AppLayout owns

Header

Sidebar

Main Content

Pages render through Outlet.

---

# Routing

Use React Router.

Routes should be centralized.

Suggested

routes/

    index.tsx

Protected routes should be implemented.

Unauthenticated users attempting to access protected pages should be redirected to Login.

---

# Styling

Use SCSS Modules.

Avoid global component styles.

Only the following should be global

reset

typography

variables

mixins

colors

utility helpers

Component styles should live beside components.

Example

Button/

    Button.tsx

    Button.module.scss

Never create one giant styles.scss.

---

# Naming

Use PascalCase

Components

Hooks

Interfaces

Types

Use camelCase

variables

functions

props

Use UPPER_SNAKE_CASE

constants

environment keys

Avoid abbreviations unless universally understood.

---

# TypeScript

Never use any.

Prefer

interface

for object contracts.

Use

type

only for unions or utility types.

Avoid unnecessary type assertions.

All exported functions should have explicit return types when practical.

---

# React

Prefer functional components.

Avoid React.FC.

Destructure props.

Keep components focused.

If a component exceeds roughly 200 lines, consider splitting it.

Avoid prop drilling where possible.

---

# State Management

Do not introduce Redux.

Do not introduce Zustand.

React Query manages server state.

React manages UI state.

Local component state is preferred whenever possible.

---

# Data Fetching

Create a single Axios instance.

Responsibilities

baseURL

timeout

request interceptor

response normalization

Do NOT implement

refresh token queue

authentication refresh flow

batch requests

complex interceptor logic

Those are unnecessary for this assessment.

---

# Services

API calls belong inside service files.

Example

services/

    auth.service.ts

    users.service.ts

Components should never call axios directly.

---

# Hooks

Hooks should wrap React Query.

Example

useUsers()

useUser()

Avoid generic wrappers like

useAppQuery()

unless they provide significant value.

Feature-specific hooks are preferred.

---

# Error Handling

Normalize API errors.

Display friendly UI messages.

Never expose raw Axios errors directly to users.

Every request should support

loading

success

error

---

# Table

Use TanStack Table.

Support

pagination

sorting

filtering

search

Avoid writing a table implementation from scratch.

---

# Pagination

Use page-based pagination.

Example

20 users per page.

Do not use virtualization.

Reason

500 records with pagination do not justify the additional complexity.

If asked during interview

explain that pagination already limits rendered DOM size.

---

# Local Storage

Persist only the selected user.

Create utility helpers.

Example

storage/

    selectedUser.ts

Avoid directly calling localStorage throughout the application.

---

# Forms

Use

React Hook Form

plus

Zod.

Validation should be schema driven.

---

# Icons

Use Lucide Icons.

Avoid multiple icon libraries.

---

# Accessibility

All interactive elements should be keyboard accessible.

Provide

aria-label

button labels

table headers

focus indicators

semantic HTML

Use buttons instead of clickable divs.

---

# Responsiveness

Support

Desktop

Tablet

Mobile

Sidebar should collapse into a drawer on smaller devices.

Tables should remain usable.

Do not ignore mobile simply because the design emphasizes desktop.

---

# Performance

Avoid unnecessary re-renders.

Memoize only when there is measurable benefit.

Avoid premature optimization.

Pagination is sufficient.

Do not implement virtualization.

---

# Testing

Every major feature should include tests.

Focus on behavior.

Examples

Login validation

Users table rendering

Pagination

Filtering

Local Storage utilities

API services

Avoid testing implementation details.

---

# Documentation

Documentation should evolve throughout development.

After every completed milestone update README.

Document

architecture decisions

tradeoffs

folder structure

major features

Do not postpone documentation until the end.

---

# Git

Commits should be small.

Each commit should represent one logical change.

Examples

feat: implement login page

feat: build reusable table component

refactor: simplify API service layer

Avoid

update

changes

fix stuff

---

# Code Quality

Run before every commit

npm run lint

npm run test

npm run build

All three should pass.

No TypeScript errors.

No ESLint warnings.

---

# Review Checklist

Before marking any feature complete verify

✓ TypeScript passes

✓ Build succeeds

✓ Tests pass

✓ Responsive

✓ Accessible

✓ No console errors

✓ Loading state

✓ Empty state

✓ Error state

✓ Documentation updated

---

# Definition of Done

A task is complete only if

Implementation complete

Code reviewed

Responsive

Accessible

Tests written

Documentation updated

Commit created

Application still builds successfully

Otherwise the task is not complete.

---

# Things To Avoid

Do not use

Ant Design

Material UI

Chakra

Redux

Zustand

Virtualization

Generic over-engineered abstractions

Massive utility files

Huge components

Unnecessary Context Providers

Magic numbers

any

---

# Engineering Philosophy

Write code as though another engineer will inherit this repository tomorrow.

Every architectural decision should be explainable within two minutes.

Optimize for clarity over cleverness.

If there is a simpler solution that achieves the same result, choose it.

The goal is not to demonstrate knowledge of every React pattern.

The goal is to demonstrate good engineering judgment.
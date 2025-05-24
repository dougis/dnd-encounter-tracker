# Product Requirements Document (PRD)
**Product Name:** D&D Encounter Tracker Web App  
**Version:** 1.3  
**Date:** [Replace with today's date]

## 1. Purpose
The D&D Encounter Tracker Web App enables Dungeon Masters to manage combat efficiently. It supports initiative, HP, AC, class/race tracking, legendary actions, and Dexterity-based tiebreakers. Data is persisted between sessions.

## 2. Scope
- Party/encounter management
- Initiative and combat tracking with Dexterity tiebreakers
- Legendary action management
- Data persistence

## 3. Features
### Party Management
- Name, race, class(es), Dexterity, AC, max/current HP

### Encounter Management
- NPC name, AC, Dexterity, initiative modifier, HP, legendary actions

### Initiative Tracker
- Roll/init input
- Sort by initiative > Dexterity > manual override

### Combat Tracker
- HP damage/heal
- Status effects
- Legendary action counter

### Persistence
- Browser storage
- JSON import/export

## 4. Non-Functional Requirements
- Performance, security, compatibility, accessibility

## 5. Technology Stack
- React + Tailwind, IndexedDB, optional Node/Firebase backend

## 6. Milestones
- UI > Party + Encounter > Combat + Persistence > MVP

## 7. Future Enhancements
- Cloud sync, PWA, shared campaigns, monster/statblock import

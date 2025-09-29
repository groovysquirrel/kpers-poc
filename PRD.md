Project Requirements Document: Fund Manager Relations App POC

1. Project Overview & Goals

1.1. Project Purpose

The project is a Proof of Concept (POC) to modernize an existing Microsoft Access database used by the organization's investment team. The current database serves as a repository for managing communications, documentation, meetings, and performance data related to external fund managers.

1.2. Primary Goals
•	Modernization: Migrate the legacy MS Access application to a modern, cloud-native web application, aligning with the organization's standard technology stack (Azure, C#/.NET, SQL Server).
•	Showcase Modern Development Practices: The primary success metric is to demonstrate the speed and efficiency of modernizing an application using AI-assisted coding within a CI/CD-compliant framework.
•	Improve User Experience: Replace the dated, "click-heavy" UI with a streamlined, intuitive, and modern web interface.
•	Enhance Functionality: Introduce critical new features that are lacking in the current tool, most notably a robust search capability.
•	API backend with gateway: ability to access a variety of services in the future without major refactoring. 
 
2. Scope of the Proof of Concept (POC)

The POC will focus on delivering the core functionality of the existing application while showcasing key improvements.

In Scope
- Replicating core functionality: viewing managers, adding meetings/artifacts, and viewing associated data. (primary)
- A new, powerful search feature to find managers, meetings, and documents. (secondary)
- A clean, modern UI for a better user experience (with some screens directly comparable to the old UI for effect). (primary)
- Role-based access control (Admin, Editor, Viewer). (secondary)
- (Showcase Feature): A simple implementation of AI-powered summarization for meeting notes or a collection of documents. (tertiary)
- Deployment to Microsoft Azure with user authentication. (primary)
- Demonstrate deployment via IaC into KPERS account after development in another account (primary)

Out of Scope (For this POC)
- Complex financial data calculation and/or integrations (performance data is manual – not going to lookup or search or calculate any performance metrics).
- Full data migration of all historical records.
- Advanced, multi-stage approval workflows (no existing workflows in the current version).
- Emailing directly from the application (can be a future goal).
- Offline capabilities (a fully cloud based app – not offline capabilities in scope).
- No mobile support or mobile app. (maybe in the future – or a single page as a demo)
- Probationary screen is not in scope. Other less used screens will not be prioritized. 


3. User Roles & Permissions
The application will support three distinct user roles:
•	Viewer (View-only): Can browse, search, and view all fund managers, meetings, notes, and attachments. Cannot create, edit, or delete any information. This is the default role for most of the investment team, including the CFO.
•	Editor: Has all the permissions of a Viewer, plus the ability to create new fund manager entries, add meetings, upload documents, edit notes, and manage artifacts. Can also place a manager on "probation." This role is for admins and key team members responsible for data entry.
•	Administrator: Has all the permissions of an Editor, plus the ability to manage user accounts and permissions within the application.

4. Key Features & High-Level User Stories
4.1. Fund Manager Management (Feature)
•	As an Editor, I want to create, view, and update a list of all fund managers so that our directory is always current.
•	As a Viewer, I want to select a specific fund manager and see a dashboard view of all their related information (meetings, notes, performance, etc.) in one place.
•	As a Viewer, I want to see a timeline of effects and some interesting visuals.
•	As an Editor, I want to place a fund manager on "probation" status and have it be clearly visible on their profile. [out of scope]
4.2. Artifact & Event Management (Feature)
•	As an Editor, I want to add new events for a fund manager, including meetings, memos, and reports, using a simple form.
•	As an Editor, I want to upload related documents (e.g., PowerPoint decks, PDFs) and associate them with a specific meeting or manager.
•	As an Editor, I want to manually input and display a simple chart for fund performance data.
o	Implementation Note: [data storage strategy]

4.3. Search (Feature)
•	As a Viewer, I want a powerful search bar that allows me to find information by fund manager name, keywords within notes, document titles, or date ranges, so I can quickly find what I need without manually scrolling through lists.
o	Implementation Note: [to do – what’s an easy way to do this?]
4.4. AI-Powered Summarization (Feature)
•	As a Viewer, I want to select a meeting or manager (or a collection of documents) and click a "Summarize" button to get an AI-generated summary of the key points, allowing for rapid information discovery.
o	Implementation Note: This can be achieved using Azure AI Language Service, which provides pre-built text summarization models accessible via a REST API. This is a perfect way to showcase the power of cloud AI services.
5. High-Level Data Model
The application will be built around three core data entities:
1.	Fund Managers: Contains information about the management company (e.g., Vanguard), contact details, and status (Active, Terminated, Probation).
2.	Events/Artifacts: A collection of records linked to a Fund Manager. Each record has a type (Meeting, Memo, Report), a date, metadata, and associated notes or file attachments.
3.	Users: A table to manage user accounts and their assigned roles (Viewer, Editor, Admin).

6. Technical Requirements
•	Cloud Platform: Microsoft Azure
•	Backend: C# / ASP.NET Core (Typescript?)
•	Database: Azure SQL Database
•	Authentication: Azure Active Directory (now Microsoft Entra ID) for secure user login.
•	Deployment: The project should be set up within a CI/CD-compliant framework (e.g., using Azure DevOps or GitHub Actions) to demonstrate modern deployment practices.

7. Success Criteria for the POC
•	Demonstration of Speed: The core application is developed and deployed to a staging environment in a matter of days.
•	Successful Feature Showcase: Key stakeholders (e.g., CFO, investment team members) can successfully use the new search feature to find information faster than in the old system.
•	Positive User Feedback: Users react positively to the modernized UI and the potential of the AI summarization feature.
•	Process Validation: The project successfully demonstrates the value of the new development and delivery framework to the organization.

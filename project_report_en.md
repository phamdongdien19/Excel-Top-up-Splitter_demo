# CASE STUDY: EXCEL TOP-UP SPLITTER & DASHBOARD

**Role**: Lead Developer  
**Timeline**: 2026 (Version 1.1)  
**Live Demo**: `[Your-Vercel-Link]/demo`  
**Source Code**: `github.com/phamdongdien19/Excel-Top-up-Splitter_demo`

---

## 1. Executive Summary
Developed a high-performance web application designed to automate logistics processes within the Market Research industry. The tool addresses the challenge of processing thousands of survey response rows (Top-up data) for reward distribution (e-vouchers) and managing costs for sample provider partners (Vendors).

## 2. The Problem
Before this tool, the data processing workflow was entirely manual:
*   **Time-Consuming**: Staff spent hours filtering and splitting Excel files for each project.
*   **Risk of Errors**: Manual copy-pasting prone to errors in incentive amounts or recipient information mismatches.
*   **Lack of Cost Transparency**: Difficulties in tracking actual vs. projected budgets, especially when working with multiple international vendors and varying exchange rates.

## 3. The Solution
An optimized Full-stack (Client-side) solution featuring:
*   **Automated Data Splitting**: Automatically identifies and splits data into separate files for Vendors, Referrers, and Internal Panels with a simple drag-and-drop.
*   **Real-time Cost Engine**: Intelligent cost calculation system supporting multiple currencies (USD/VND) and additional service fees (SMS/Email).
*   **Budget Forecasting & Sampling Optimization**: Real-time cumulative cost estimation across all sources. This enables accurate remaining budget forecasting, allowing for informed and cost-effective allocation of remaining sample targets among vendors.
*   **Interactive Analytics**: Visually intuitive dashboard for tracking sampling distribution and budget composition through dynamic charts.
*   **Project History**: Integrated local storage for immediate access and management of project history and configurations.

## 4. Technical Excellence
*   **Modern Stack**: 
    *   **Frontend**: Next.js 15, React 19 (Hooks & Functional Components).
    *   **Styling**: Tailwind CSS 4 (Premium, responsive UI).
*   **Data Processing**:
    *   `xlsx` & `jszip`: Handling large data arrays and direct browser-side compression (Zero-server latency).
    *   `TypeScript`: Ensuring data consistency and minimizing runtime errors.
*   **Visualization**: `recharts` for in-depth analytical dashboards.

## 5. Business Impact
*   **Efficiency**: Reduced data processing time by **95%** (from 1 hour to under 10 seconds).
*   **Accuracy**: Eliminated human errors in incentive distribution and vendor liability calculations.
*   **Strategic Decision Support**: Empowered Project Managers to proactively balance budgets during the fieldwork phase, rather than post-project cost reconciliation.
*   **User Experience**: "Premium" standard interface, enabling easy operation without complex documentation.

---
*This report serves as a demonstration of system architecture thinking and modern programming expertise.*

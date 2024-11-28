// Path: client/src/pages/ActivityReportPage.js

import React from 'react';
import ActivityReport from '../components/reports/ActivityReport';
import '../styles/pages/ActivityReportPage.css';

const ActivityReportPage = () => {
  return (
    <div className="activity-report-page">
      <div className="container">
        <h1 className="page-title">Reporte de Actividades</h1>
        <ActivityReport />
      </div>
    </div>
  );
};

export default ActivityReportPage;
import React from 'react';
import './ExportResults.css';

const ExportResults = ({ groupsData }) => {
    const downloadCSV = () => {
        if (!groupsData || !groupsData.groups) return;

        const csvContent = convertGroupsToCSV(groupsData.groups);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'smart_groups_results.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const convertGroupsToCSV = (groups) => {
        let csv = 'Group,Time Slot,Student Name,Attributes\n';
        
        groups.forEach((group, groupIndex) => {
            const groupName = `Group ${groupIndex + 1}`;
            const timeSlot = group.time_slot || '';
            group.students.forEach(student => {
                const attributes = student.attributes
                  ? Object.entries(student.attributes)
                      .filter(([attr, value]) => value === '1')
                      .map(([attr]) => attr)
                      .join(';')
                  : '';
                csv += `"${groupName}","${timeSlot}","${student.name}","${attributes}"\n`;
            });
        });
        
        return csv;
    };

    return (
        <button 
            onClick={downloadCSV}
            className="export-download-button"
        >
            Download CSV
        </button>
    );
};

export default ExportResults;

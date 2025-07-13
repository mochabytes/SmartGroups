import React from 'react';
import './ExportResults.css';

const ExportResults = ({ groupsData }) => {
    // download csv results
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
        if (!groups || groups.length === 0) return '';
        
        // get original column names
        const firstStudent = groups[0].students[0];
        if (!firstStudent) return '';
        
        const attributeColumns = Object.keys(firstStudent.attributes || {});
        const availabilityColumns = Object.keys(firstStudent.availabilities || {});
        
        // add new columns to the far left
        const headers = [
            'Student Name',
            'Assigned Group',
            'Assigned Time Slot',
            ...attributeColumns,
            ...availabilityColumns
        ];
        
        let csv = headers.join(',') + '\n';
        
        // add each student's row with their original data plus group assignment
        let regularGroupCounter = 1;
        groups.forEach((group) => {
            // use special handling for unassigned groups
            let groupName;
            if (group.is_unassigned) {
                groupName = 'Unassigned - no availabilities';
            } else {
                groupName = `Group ${regularGroupCounter}`;
                regularGroupCounter++;
            }
            
            const timeSlot = group.time_slot || '';
            
            group.students.forEach(student => {
                const row = [
                    `"${student.name}"`,
                    `"${groupName}"`,
                    `"${timeSlot}"`,
                    ...attributeColumns.map(attr => student.attributes[attr] || '0'),
                    ...availabilityColumns.map(avail => student.availabilities[avail] || '0')
                ];
                csv += row.join(',') + '\n';
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

import React from 'react';
import ExportResults from './ExportResults';
import './GroupsDisplay.css';

const GroupsDisplay = ({ groupsData, onReset }) => {

    if (!groupsData || !groupsData.groups) {
        return (
            <div className="groups-error-container">
                <div className="groups-error-content">
                    <h3>No Groups Data</h3>
                    <p>
                        {groupsData && groupsData.error
                            ? groupsData.error
                            : "Something went wrong with group generation."}
                    </p>
                </div>
                <button onClick={onReset} className="groups-error-button">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="groups-display-container">
            <div className="groups-success-header">
                <h2 className="groups-success-title" style={{ color: '#014d43' }}>Groups Generated Successfully!</h2>
                <p className="groups-success-description" style={{ color: '#014d43' }}>
                    Created {groupsData.groups.length} groups with your constraints
                </p>
                
                <div className="groups-button-container">
                    <ExportResults groupsData={groupsData} />
                    <button 
                        onClick={onReset}
                        className="groups-reset-button"
                    >
                        Upload New File
                    </button>
                </div>
            </div>

            <div className="groups-grid">
                {groupsData.groups.map((group, groupIndex) => (
                    <div 
                        key={groupIndex}
                        className="group-card"
                    >
                        <h3 className="group-title">
                            Group {groupIndex + 1} {group.time_slot ? `[${group.time_slot}]` : ''}
                        </h3>
                        
                        <div className="group-students-container">
                            {group.students.map((student, studentIndex) => (
                                <div 
                                    key={studentIndex}
                                    className="student-item"
                                >
                                    <strong>{student.name}</strong>
                                    {student.attributes && (
                                        <div className="student-attributes">
                                            {Object.entries(student.attributes).map(([attr, value]) => 
                                                `${attr}: ${value}`
                                            ).join(' | ')}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupsDisplay; 
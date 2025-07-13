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

    // separate regular groups from unassigned groups
    const regularGroups = groupsData.groups.filter(group => !group.is_unassigned);
    const unassignedGroup = groupsData.groups.find(group => group.is_unassigned);

    return (
        <div className="groups-display-container">
            <div className="groups-success-header">
                <h2 className="groups-success-title" style={{ color: '#014d43' }}>Groups Generated Successfully!</h2>
                <p className="groups-success-description" style={{ color: '#014d43' }}>
                    Created {regularGroups.length} groups with your constraints
                </p>
                
                {/* Show unassigned students message if any exist */}
                {unassignedGroup && (
                    <div className="unassigned-notice" style={{ color: '#b45309', marginTop: '10px' }}>
                        <strong>Note:</strong> {unassignedGroup.students.length} student(s) could not be assigned to groups because they have no available time slots: {unassignedGroup.students.map(s => s.name).join(', ')}
                    </div>
                )}
                
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
                {regularGroups.map((group, groupIndex) => (
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
                
                {/* Show unassigned group card if it exists */}
                {unassignedGroup && (
                    <div className="group-card unassigned-group-card">
                        <h3 className="group-title">
                            Unassigned - No Availabilities
                        </h3>
                        
                        <div className="group-students-container">
                            {unassignedGroup.students.map((student, studentIndex) => (
                                <div 
                                    key={studentIndex}
                                    className="student-item unassigned-student-item"
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
                )}
            </div>
        </div>
    );
};

export default GroupsDisplay; 
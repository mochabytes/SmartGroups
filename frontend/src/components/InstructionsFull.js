import React from 'react';
import './Instructions.css';

const Instructions = () => {
    return (
        <div className="instructions-container">
            <h3 className="instructions-title">
                How to Use SmartGroups
            </h3>
            
            <div className="instructions-grid">
                <div className="instruction-item">
                    <span className="instruction-number">1</span>
                    <p className="instruction-text">
                        <strong>Upload your CSV file</strong> - Your CSV file should follow this structure:<br/>
                        <strong>a)</strong> <strong>Name columns:</strong> Include 1-2 columns for names. Use either one column titled "Name", "Student Name", or "Student", OR two columns titled "First" (or "First Name") and "Last" (or "Last Name").<br/>
                        <strong>b)</strong> <strong>Additional attributes (optional):</strong> If you want to sort groups by attributes other than time availability (e.g., gender, experience level, department), include these as binary columns with 1s for "has attribute" and 0s or blanks for "does not have attribute".<br/>
                        <strong>c)</strong> <strong>Time availability:</strong> Include one column per time slot with 1s for "available" and 0s or blanks for "not available".
                    </p>
                </div>
                
                <div className="instruction-item">
                    <span className="instruction-number">2</span>
                    <p className="instruction-text">
                        <strong>Specify attributes</strong> - Please enter EVERY column name in your csv that is not name(s) or an availabilities here. <br/>
                    </p>
                </div>
                
                <div className="instruction-item">
                    <span className="instruction-number">3</span>
                    <p className="instruction-text">
                        <strong>Set constraints</strong> - Define group sizes and attribute distributions (all optional - leave blank for no constraints). Please note that you can only set constraints on attributes that have binary values in the columns.
                    </p>
                </div>
                
                <div className="instruction-item">
                    <span className="instruction-number">4</span>
                    <p className="instruction-text">
                        <strong>Generate & download</strong> - View your optimized groups and optionally download the results as a csv (this will be your original csv with 2 new columns: Assigned Group, and Assigned Time Slot).
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Instructions;

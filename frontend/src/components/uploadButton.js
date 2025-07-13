// want them to be able to drag + drop or click to upload

import React, { useState } from 'react';
import './UploadButton.css';

const UploadButton = ({ onFileSelect }) => {
    const [file, setFile] = useState(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const handleButtonClick = () => {
        document.getElementById('file-input').click(); // click + input file
    };

    const handleFileSelect = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            console.log('selected file:', selectedFile.name);
            onFileSelect(selectedFile);
        }
    };

    // drag + drop file
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault(); // prevent default browser behavior
        e.stopPropagation(); // stop event from propagating to parent elements, like the upload rectangle
        setIsDragActive(false); // no longer true if not dragging
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true); // still true if dragging
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const selectedFile = files[0];
            if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
                setFile(selectedFile);
                console.log('dropped file:', selectedFile.name);
                onFileSelect(selectedFile);
            } else {
                alert('Please upload a CSV file.');
            }
        }
    };

    return (
        <div className="upload-container">
            <div 
                className={`upload-rectangle ${isDragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-input"
                    accept=".csv"
                    onChange={handleFileSelect}
                    style={{ display: 'none'}}
                />
                <button className="upload-button" onClick={handleButtonClick}>
                    {isDragActive ? 'Drop your CSV file here!' : 'Click to upload file (or drag & drop). Make sure it satisfies the file format!'}
                </button>

                {file && <p style={{ marginTop: '15px', fontSize: '14px', color: '#374151' }}>Selected: {file.name}</p>}
            </div>
        </div>
    );
};

export default UploadButton;


import React, { useState } from 'react';
import Header from './Header';
import Instructions from './InstructionsFull';
import UploadButton from './UploadButton';
import ConstraintForm from './ConstraintForm';
import GroupsDisplay from './GroupsDisplay';
import { uploadFileAndConstraints } from '../api/apiService';
import './FileUploadFlow.css';

const FileUploadFlow = () => {
    const [file, setFile] = useState(null);
    const [step, setStep] = useState(1); // 1 means file selection, 2 means constraint form
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    const handleFileSelect = (selectedFile) => {
        setFile(selectedFile);
        setStep(2); // go to step 2!
        console.log('File selected:', selectedFile.name);
    };

    const handleConstraints = async (constraintData) => {
        // send everything to backend
        setIsUploading(true);
        try {
            const result = await uploadFileAndConstraints(file, constraintData);
            setUploadResult(result);
            console.log('Upload successful:', result);
        } catch (error) {
            console.error('Upload failed:', error);
            setUploadResult({ error: error.message });
        } finally {
            setIsUploading(false);
        }
    };

    const handleReset = () => {
        // reset everything; this happens if they try again
        setFile(null);
        setStep(1);
        setUploadResult(null);
    };

    return (
        <div>
            <Header />
            <Instructions />
            <div className="flow-container"> 
            
            {step === 1 && (
                <UploadButton onFileSelect={handleFileSelect} /> // this is the upload button
            )}
            
            {step === 2 && !isUploading && !uploadResult && (
                <ConstraintForm 
                    file={file} // file they uploaded
                    onConstraints={handleConstraints} // constraints they set 
                    onBack={() => setStep(1)} // option to go back
                />
            )}
            
            {isUploading && (
                <div className="uploading-container">
                    <p>Uploading and processing...</p> 
                </div>
            )}
            
            {uploadResult && (
                uploadResult.error ? (
                    <div className="error-container">
                        <div className="error-content">
                            <h3>Upload Failed</h3>
                            <p>{uploadResult.error}</p>
                        </div>
                        <button onClick={handleReset} className="try-again-button">
                            Try Again
                        </button>
                    </div>
                ) : (
                    <GroupsDisplay 
                        groupsData={uploadResult.data} 
                        onReset={handleReset}
                    />
                                 )
             )}
            </div>
        </div>
    );
};

export default FileUploadFlow; 
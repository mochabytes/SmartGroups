import React, { useState } from 'react';
import './ConstraintForm.css';

const ConstraintForm = ({ file, onConstraints, onBack }) => {
    const [attributes, setAttributes] = useState('');
    const [attributeArray, setAttributeArray] = useState([]);
    const [step, setStep] = useState(1); // 1 = attributes input, 2 = constraints form
    const [groupSizeMin, setGroupSizeMin] = useState('');
    const [groupSizeMax, setGroupSizeMax] = useState('');
    const [groupCountMin, setGroupCountMin] = useState('');
    const [groupCountMax, setGroupCountMax] = useState('');
    const [attributeConstraints, setAttributeConstraints] = useState({});
    const [combinedConstraints, setCombinedConstraints] = useState([]);

    const handleAttributeChange = (event) => {
        setAttributes(event.target.value);
    };

    const handleAttributeSubmit = () => {
        // Allow proceeding with or without attributes
        if (attributes.trim()) {
            const attributeArray = attributes.split(',').map(attr => attr.trim());
            setAttributeArray(attributeArray);
        } else {
            setAttributeArray([]); // Empty array for no attributes
        }
        setStep(2);
    };

    const handleAttributeConstraintChange = (attribute, type, value) => {
        setAttributeConstraints(prev => ({
            ...prev,
            [attribute]: {
                ...prev[attribute],
                [type]: value
            }
        }));
    };

    const handleAddCombinedConstraint = () => {
        setCombinedConstraints(prev => [...prev, { attributes: [], min: '', max: '' }]);
    };
    const handleCombinedConstraintChange = (idx, field, value) => {
        setCombinedConstraints(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
    };
    const handleCombinedConstraintAttributeChange = (idx, value) => {
        setCombinedConstraints(prev => prev.map((c, i) => i === idx ? { ...c, attributes: value } : c));
    };

    const handleSubmit = () => {
        const cleanedAttributeConstraints = {};
        Object.entries(attributeConstraints).forEach(([attribute, constraints]) => {
            const cleanedConstraints = {};
            if (constraints.minPerGroup && constraints.minPerGroup.trim() !== '') {
                cleanedConstraints.minPerGroup = parseInt(constraints.minPerGroup);
            }
            if (constraints.maxPerGroup && constraints.maxPerGroup.trim() !== '') {
                cleanedConstraints.maxPerGroup = parseInt(constraints.maxPerGroup);
            }
            if (Object.keys(cleanedConstraints).length > 0) {
                cleanedAttributeConstraints[attribute] = cleanedConstraints;
            }
        });
        const cleanedCombinedConstraints = combinedConstraints
            .filter(c => c.attributes.length > 0 && (c.min !== '' || c.max !== ''))
            .map(c => ({
                attributes: c.attributes,
                min: c.min !== '' ? parseInt(c.min) : undefined,
                max: c.max !== '' ? parseInt(c.max) : undefined
            }));
        const constraints = {
            givenAttributes: attributeArray.join(','),
            groupSizeMin: groupSizeMin ? parseInt(groupSizeMin) : undefined,
            groupSizeMax: groupSizeMax ? parseInt(groupSizeMax) : undefined,
            groupCountMin: groupCountMin ? parseInt(groupCountMin) : undefined,
            groupCountMax: groupCountMax ? parseInt(groupCountMax) : undefined,
            attributeConstraints: cleanedAttributeConstraints,
            combinedConstraints: cleanedCombinedConstraints
        };
        onConstraints(constraints);
    };

    return (
        <div className="constraint-form-container royal-blue-box">
            <h3 className="constraint-form-title">{step === 1 ? 'Enter Attributes (all columns except names + times)' : 'Set Constraints'}</h3>
            
            {step === 1 && (
                <div className="attributes-step">
                    <p className="file-info">
                        File: <strong>{file?.name}</strong>
                    </p>
                    <input
                        type="text"
                        placeholder="Enter binary attributes (comma-separated): e.g. industry, gender, etc. (Leave blank if none)"
                        value={attributes}
                        onChange={handleAttributeChange}
                        className="attributes-input"
                    />
                    <div className="button-group">
                        <button 
                            onClick={onBack}
                            className="btn btn-secondary"
                        >
                            Back to File Selection
                        </button>
                        <button 
                            onClick={handleAttributeSubmit}
                            className="btn btn-primary"
                        >
                            Next: Set Group Constraints
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="constraints-step">
                    <div className="file-attributes-summary light-pink-box">
                        <p><strong>File:</strong> {file?.name}</p>
                        <p><strong>Attributes:</strong> {attributeArray.length > 0 ? attributeArray.join(', ') : 'None specified'}</p>
                    </div>
            
                    {/* Group Size Constraints */}
                    <div className="constraints-section group-size-section">
                        <h4>Group Size Constraints</h4>
                        <div className="constraint-inputs">
                            <input
                                type="number"
                                placeholder="Minimum group size"
                                value={groupSizeMin}
                                onChange={(e) => setGroupSizeMin(e.target.value)}
                                className="constraint-input"
                            />
                            <input
                                type="number"
                                placeholder="Maximum group size"
                                value={groupSizeMax}
                                onChange={(e) => setGroupSizeMax(e.target.value)}
                                className="constraint-input"
                            />
                        </div>
                    </div>

                    {/* Group Count Constraints */}
                    <div className="constraints-section group-count-section">
                        <h4>Group Count Constraints</h4>
                        <div className="constraint-inputs">
                            <input
                                type="number"
                                placeholder="Minimum number of groups"
                                value={groupCountMin}
                                onChange={(e) => setGroupCountMin(e.target.value)}
                                className="constraint-input"
                            />
                            <input
                                type="number"
                                placeholder="Maximum number of groups"
                                value={groupCountMax}
                                onChange={(e) => setGroupCountMax(e.target.value)}
                                className="constraint-input"
                            />
                        </div>
                    </div>

                    {/* Attribute-specific Constraints - only show if attributes were provided */}
                    {attributeArray.length > 0 && (
                        <div className="constraints-section">
                            <h4>Attribute Constraints</h4>
                            {attributeArray.map(attribute => (
                                <div key={attribute} className="attribute-constraint purple-box">
                                    <h5>{attribute}</h5>
                                    <div className="attribute-inputs">
                                        <input
                                            type="number"
                                            placeholder={`I want at least _ ${attribute} per group`}
                                            value={attributeConstraints[attribute]?.minPerGroup || ''}
                                            onChange={(e) => handleAttributeConstraintChange(attribute, 'minPerGroup', e.target.value)}
                                            className="constraint-input"
                                        />
                                        <input
                                            type="number"
                                            placeholder={`I want at most _ ${attribute} per group`}
                                            value={attributeConstraints[attribute]?.maxPerGroup || ''}
                                            onChange={(e) => handleAttributeConstraintChange(attribute, 'maxPerGroup', e.target.value)}
                                            className="constraint-input"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Combined Attribute Constraints */}
                    <div className="constraints-section combined-constraints-section green-box">
                        <h4>Combined Attribute Constraints</h4>
                        {combinedConstraints.map((constraint, idx) => (
                            <div key={idx} className="combined-constraint-row">
                                <div className="combined-checkboxes">
                                    {attributeArray.map(attr => (
                                        <label key={attr} className="combined-checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={constraint.attributes.includes(attr)}
                                                onChange={e => {
                                                    const checked = e.target.checked;
                                                    let newAttrs = constraint.attributes.slice();
                                                    if (checked) {
                                                        newAttrs.push(attr);
                                                    } else {
                                                        newAttrs = newAttrs.filter(a => a !== attr);
                                                    }
                                                    handleCombinedConstraintAttributeChange(idx, newAttrs);
                                                }}
                                            />
                                            {attr}
                                        </label>
                                    ))}
                                </div>
                                <input
                                    type="number"
                                    placeholder="Min total"
                                    className="constraint-input"
                                    value={constraint.min}
                                    onChange={e => handleCombinedConstraintChange(idx, 'min', e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Max total"
                                    className="constraint-input"
                                    value={constraint.max}
                                    onChange={e => handleCombinedConstraintChange(idx, 'max', e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="delete-combined-btn"
                                    onClick={() => setCombinedConstraints(prev => prev.filter((_, i) => i !== idx))}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <button type="button" className="btn btn-primary add-combined-btn" onClick={handleAddCombinedConstraint}>+</button>
                    </div>

                    {/* Show a message when no attributes are specified */}
                    {attributeArray.length === 0 && (
                        <div className="no-attributes-message">
                            <p>No attributes specified. Groups will be generated based on availability and your size/count constraints only.</p>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="final-buttons">
                        <button 
                            onClick={() => setStep(1)}
                            className="btn btn-secondary"
                        >
                            Back to attribute specification
                        </button>
                        <button 
                            onClick={handleSubmit}
                            className="btn btn-primary"
                        >
                            Generate groups with my constraints!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConstraintForm;

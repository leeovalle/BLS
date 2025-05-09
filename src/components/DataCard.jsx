import React from 'react';

/**
 * Component to display a single BLS data item
 */
const DataCard = ({ item }) => {
  return (
    <div className="data-card">
      <div className="data-header">
        <h3>{item.name}</h3>
        <span className="category-badge">{item.category}</span>
      </div>
      
      <div className="data-body">
        <p className="data-value">
          {item.value} <span className="unit">{item.unit}</span>
        </p>
        <p className="data-period">
          {item.periodName} {item.year}
        </p>
      </div>
      
      {item.footnotes && item.footnotes.length > 0 && (
        <div className="data-footnotes">
          {item.footnotes.map((note, i) => (
            <p key={i} className="footnote">
              {note.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default DataCard; 
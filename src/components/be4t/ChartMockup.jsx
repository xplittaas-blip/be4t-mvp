import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getMarketplaceData } from '../../core/xplit/spotify';
import './ChartMockup.css';

// A simple but beautiful CSS-based generic chart component
export const BarChartMockup = ({ data = [] }) => {
    const maxVal = Math.max(...data.map(d => d.value));

    return (
        <div className="chart-container">
            <div className="bars-wrapper">
                {data.map((item, index) => (
                    <div key={index} className="bar-group">
                        <div className="bar-bg">
                            <div
                                className="bar-fill"
                                style={{ height: `${(item.value / maxVal) * 100}%` }}
                            >
                                <div className="bar-glow"></div>
                            </div>
                        </div>
                        <span className="bar-label">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const DistributionChartMockup = ({ distributions = [] }) => {
    return (
        <div className="distribution-list">
            {distributions.map((item, index) => (
                <div key={index} className="dist-item">
                    <div className="dist-header">
                        <span className="dist-label text-secondary">
                            <span className="dist-dot" style={{ backgroundColor: item.color }}></span>
                            {item.label}
                        </span>
                        <span className="dist-value font-heading">{item.percentage}%</span>
                    </div>
                    <div className="dist-bar-bg">
                        <div
                            className="dist-bar-fill"
                            style={{ width: `${item.percentage}%`, backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

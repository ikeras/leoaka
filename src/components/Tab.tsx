import React from 'react';

type TabProps = {
    isSelected: boolean,
    children: React.ReactNode
}

export default function Tab({ isSelected, children }: TabProps) {
    if (!isSelected) {
        return null;
    }

    return (
        <div
            className="tab-pane fade show active"
            role="tabpanel"
        >
            {children}
        </div>
    );
}